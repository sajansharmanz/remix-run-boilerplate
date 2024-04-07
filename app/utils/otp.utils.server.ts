import { Secret, TOTP } from "otpauth";

import env from "~/config/environment.config.server";

export const generateSecret = (): string => {
  return new Secret({ size: 10 }).base32;
};

export const generateTOTP = (secret: string): TOTP => {
  return new TOTP({
    issuer: env.OTP_ISSUER,
    label: env.OTP_LABEL,
    algorithm: "SHA1",
    digits: 6,
    secret,
  });
};
