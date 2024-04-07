import { TokenType, UserStatus } from "@prisma/client";

import env from "~/config/environment.config.server";

import { AuthenticationError } from "~/errors";

import emailService from "~/service/email.service.server";
import userService from "~/service/user.service.server";

import { UserResponseBody } from "~/types/user.types";

import { decrypt, hashString } from "~/utils/crypto.utils.server";
import { generateTOTP } from "~/utils/otp.utils.server";
import { prisma } from "~/utils/prisma.utils.server";
import { signToken } from "~/utils/token.utils.server";

const generateCsrfToken = async (): Promise<string[]> => {
  const crypto = await import("node:crypto");

  const token = crypto.randomBytes(32).toString("hex");

  const signedToken = await signToken({ token }, TokenType.CSRF);

  return [token, signedToken];
};

const generateSessionId = async (user: UserResponseBody): Promise<string> => {
  const signedToken = await signToken(user, TokenType.SESSION);
  const hashedToken = await hashString(signedToken);

  await prisma.token.create({
    data: {
      userId: user.id,
      token: hashedToken,
      type: TokenType.SESSION,
    },
  });

  return signedToken;
};

const verifySessionId = async (token: string): Promise<boolean> => {
  const hashedToken = await hashString(token);

  return (
    (await prisma.token.count({
      where: {
        token: hashedToken,
      },
    })) > 0
  );
};

const validateOTP = async (userId: string, otpToken: string) => {
  const fullUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  const err = new AuthenticationError({ redirect: false });

  if (
    !fullUser ||
    (fullUser &&
      (!fullUser.otpSecret || !fullUser.otpSecretIV || !fullUser.otpAuthTag))
  ) {
    throw err;
  }

  const secret = await decrypt(
    fullUser.otpSecret!,
    fullUser.otpSecretIV!,
    fullUser.otpAuthTag!,
  );

  const totp = generateTOTP(secret);

  const delta = totp.validate({ token: otpToken, window: 3 });

  if (delta === null) {
    const failedLoginAttempts = fullUser.failedLoginAttempts + 1;
    let newStatus: UserStatus = fullUser.status;

    if (failedLoginAttempts >= env.MAX_FAILED_LOGIN_ATTEMPTS!) {
      newStatus = UserStatus.LOCKED;
      await emailService.accountLocked(fullUser.email);
    }

    await userService.loginAttemptUpdates(
      fullUser.id,
      failedLoginAttempts,
      newStatus,
    );

    throw err;
  }

  return userService.loginAttemptUpdates(fullUser.id, 0, UserStatus.ENABLED);
};

const deleteToken = async (token: string) => {
  const hashedToken = await hashString(token);

  await prisma.token.delete({
    where: {
      token: hashedToken,
    },
  });
};

const deleteAllSessions = async (userId: string) => {
  await prisma.token.deleteMany({
    where: {
      userId,
      type: TokenType.SESSION,
    },
  });
};

const generatePasswordResetToken = async (email: string): Promise<string> => {
  await prisma.token.deleteMany({
    where: {
      user: {
        email,
      },
      type: TokenType.PASSWORD_RESET,
    },
  });

  const signedToken = await signToken({ email }, TokenType.PASSWORD_RESET);
  const hashedToken = await hashString(signedToken);

  await prisma.token.create({
    data: {
      user: {
        connect: {
          email,
        },
      },
      token: hashedToken,
      type: TokenType.PASSWORD_RESET,
    },
  });

  return signedToken;
};

const tokenService = {
  generateCsrfToken,
  generateSessionId,
  verifySessionId,
  validateOTP,
  deleteToken,
  deleteAllSessions,
  generatePasswordResetToken,
};

export default tokenService;
