import * as argon2 from "argon2";

import env from "~/config/environment.config.server";

export const hashPassword = async (password: string): Promise<string> => {
  return await argon2.hash(password, {
    type: argon2.argon2id,
    secret: Buffer.from(env.PASSWORD_SECRET),
  });
};

export const verifyPassowrd = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  return await argon2.verify(hashedPassword, password, {
    secret: Buffer.from(env.PASSWORD_SECRET),
  });
};
