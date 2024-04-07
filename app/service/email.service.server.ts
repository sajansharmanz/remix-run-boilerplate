import { render } from "@react-email/render";
import nodemailer from "nodemailer";

import env from "~/config/environment.config.server";

import AccountLocked from "~/emails/AccountLockedEmail";
import ForgotPassword from "~/emails/ForgotPasswordEmail";
import PasswordReset from "~/emails/PasswordResetEmail";
import SignUpEmail from "~/emails/SignUpEmail";

const TRANSPORT = nodemailer.createTransport({
  host: env.NODEMAILER_HOST,
  port: env.NODEMAILER_PORT!,
  secure: env.NODEMAILER_SECURE,
  auth: {
    user: env.NODEMAILER_USERNAME,
    pass: env.NODEMAILER_PASSWORD,
  },
});

const sendMail = async (
  to: string,
  subject: string,
  html: string,
): Promise<void> => {
  await TRANSPORT.sendMail({
    from: env.NODEMAILER_USERNAME,
    to,
    subject,
    html,
  });
};

const signUp = async (toEmail: string) => {
  await sendMail(toEmail, `Welcome to ${env.APP_NAME}`, render(SignUpEmail()));
};

const accountLocked = async (toEmail: string) => {
  await sendMail(
    toEmail,
    `${env.APP_NAME} Account Locked`,
    render(AccountLocked({ contactEmail: "contact@contact.com" })),
  );
};

const forgotPassword = async (toEmail: string, token: string) => {
  await sendMail(
    toEmail,
    `${env.APP_NAME} Reset Your Password`,
    render(
      ForgotPassword({
        resetUrl: `${env.APP_DOMAIN}/reset-password?token=${token}`,
        contactEmail: "contact@contact.com",
      }),
    ),
  );
};

const passwordReset = async (toEmail: string) => {
  await sendMail(
    toEmail,
    `${env.APP_NAME} Password Has Been Reset`,
    render(PasswordReset()),
  );
};

const emailService = { signUp, accountLocked, forgotPassword, passwordReset };

export default emailService;
