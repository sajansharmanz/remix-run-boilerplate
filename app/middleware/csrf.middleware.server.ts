import { TokenType } from "@prisma/client";

import csrfCookie from "~/cookies/csrf.cookie.server";

import { ForbiddenError } from "~/errors";

import checkOriginMiddleware from "~/middleware/checkOrigin.middleware.server";

import { verifyToken } from "~/utils/token.utils.server";

const csrfMiddleware = async (request: Request, csrfFormToken: string) => {
  try {
    if (request.method === "GET") {
      return;
    }

    checkOriginMiddleware(request);

    const csrfCookieValue = await csrfCookie.getValue(request);

    if (!csrfCookieValue || !csrfFormToken) {
      throw new Error();
    }

    const { token: csrfToken } = (await verifyToken(
      String(csrfCookieValue),
      TokenType.CSRF,
    )) as { token: string };

    if (csrfToken !== csrfFormToken) {
      throw new Error();
    }
  } catch (error) {
    throw new ForbiddenError();
  }
};

export default csrfMiddleware;
