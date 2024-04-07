/* eslint-disable @typescript-eslint/no-namespace */
import { z } from "zod";

const envVariables = z.object({
  APP_NAME: z.string(),
  APP_DOMAIN: z.string(),
  NODE_ENV: z.enum(["development", "test", "production"]),
  DATABASE_URL: z.string(),
  LOG_LEVEL: z.enum([
    "error",
    "warn",
    "info",
    "http",
    "verbose",
    "debug",
    "silly",
  ]),
  ENCRYPTION_SECRET: z.string(),
  PASSWORD_SECRET: z.string(),
  SESSION_TOKEN_SECRET: z.string(),
  PASSWORD_RESET_TOKEN_SECRET: z.string(),
  CSRF_TOKEN_SECRET: z.string(),
  COOKIE_SECRET: z.string(),
  MAX_FAILED_LOGIN_ATTEMPTS: z.string().transform((value, ctx) => {
    const parsed = parseInt(value);

    if (isNaN(parsed)) {
      return ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Max failed login attempts must be an integer",
      });
    }

    return parsed;
  }),
  DEFAULT_ADMIN_EMAIL: z.string(),
  DEFAULT_ADMIN_PASSWORD: z.string(),
  NODEMAILER_HOST: z.string(),
  NODEMAILER_PORT: z.string().transform((value, ctx) => {
    const parsed = parseInt(value);

    if (isNaN(parsed)) {
      return ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Nodemailer port must be an integer",
      });
    }

    return parsed;
  }),
  NODEMAILER_SECURE: z
    .enum(["true", "false"])
    .transform((value) => value === "true"),
  NODEMAILER_USERNAME: z.string(),
  NODEMAILER_PASSWORD: z.string(),
  OTP_ISSUER: z.string(),
  OTP_LABEL: z.string(),
  STRIPE_SECRET_KEY: z.string(),
  STRIPE_PUBLIC_KEY: z.string(),
  STRIPE_WEBHOOK_KEY: z.string(),
  GOOGLE_OAUTH_CLIENT_ID: z.string(),
  APPLE_OAUTH_CLIENT_ID: z.string(),
});

export default envVariables.parse(process.env);

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envVariables> {}
  }
}
