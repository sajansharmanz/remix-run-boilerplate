import { TokenType } from "@prisma/client";
import * as jose from "jose";

import env from "~/config/environment.config.server";

const determineExpiresIn = (type: TokenType): string => {
  const FIFTEEN_MINS = "15m";
  const THIRTY_MINS = "30m";
  const SEVEN_DAYS = "7d";

  switch (type) {
    case TokenType.SESSION:
      return SEVEN_DAYS;
    case TokenType.PASSWORD_RESET:
      return THIRTY_MINS;
    case TokenType.CSRF:
    default:
      return FIFTEEN_MINS;
  }
};

const determineSecret = (type: TokenType): Uint8Array => {
  switch (type) {
    case TokenType.PASSWORD_RESET:
      return new TextEncoder().encode(env.PASSWORD_RESET_TOKEN_SECRET);
    case TokenType.CSRF:
      return new TextEncoder().encode(env.CSRF_TOKEN_SECRET);
    case TokenType.SESSION:
    default:
      return new TextEncoder().encode(env.SESSION_TOKEN_SECRET);
  }
};

export const signToken = async (
  data: object,
  type: TokenType,
): Promise<string> => {
  return await new jose.SignJWT({ ...data })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(determineExpiresIn(type))
    .sign(determineSecret(type));
};

export const verifyToken = async (
  token: string,
  type: TokenType,
): Promise<jose.JWTPayload> => {
  try {
    const { payload } = await jose.jwtVerify(token, determineSecret(type), {
      algorithms: ["HS256"],
    });

    return payload;
  } catch (error) {
    if (
      error instanceof jose.errors.JWTExpired ||
      error instanceof jose.errors.JWSInvalid
    ) {
      throw error;
    }

    throw new Error("Error verifying token");
  }
};
