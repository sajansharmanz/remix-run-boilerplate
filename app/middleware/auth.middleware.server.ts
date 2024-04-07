import { TokenType } from "@prisma/client";
import * as jose from "jose";

import sessionCookie from "~/cookies/session.cookie.server";
import userCookie from "~/cookies/user.cookie.server";

import { AuthenticationError } from "~/errors";

import tokenService from "~/service/token.service.server";
import userService from "~/service/user.service.server";

import { UserResponseBody } from "~/types/user.types";

import { verifyToken } from "~/utils/token.utils.server";

const checkAuth = async (request: Request, headers: Headers) => {
  const user = await userCookie.getValue(request);
  const sessionId = await sessionCookie.getValue(request);

  try {
    if (!user || !sessionId) {
      throw new Error();
    }

    if (!(await tokenService.verifySessionId(sessionId))) {
      throw new Error();
    }

    const sessionUser = (await verifyToken(
      sessionId,
      TokenType.SESSION,
    )) as UserResponseBody;

    if (user.id !== sessionUser.id) {
      throw new Error();
    }

    return {
      user: (await userService.findById(user.id)) as UserResponseBody,
      sessionId: sessionId!,
    };
  } catch (error) {
    if (error instanceof jose.errors.JWTExpired) {
      /**
       * Issue a new SessionID here, because the token
       * has been verified in the database already, if we
       * have made it here, its because the token has
       * expired, so we will issue a new one without
       * needing the user to log in again.
       */

      const u = await userService.findById(user!.id);

      sessionCookie.addHeaders(headers, u!);

      return {
        user: u as UserResponseBody,
        sessionId: sessionId!,
      };
    }

    const currentRoute = new URL(request.url).pathname;
    throw new AuthenticationError({ currentRoute });
  }
};

export default checkAuth;
