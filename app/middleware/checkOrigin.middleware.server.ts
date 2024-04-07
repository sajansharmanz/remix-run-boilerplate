import env from "~/config/environment.config.server";

import { ForbiddenError } from "~/errors";

const checkOriginMiddleware = (request: Request) => {
  const origin =
    request.headers.get("origin") ||
    request.headers.get("referer") ||
    request.headers.get("host");

  if (origin && origin === env.APP_DOMAIN) {
    return;
  }

  throw new ForbiddenError();
};

export default checkOriginMiddleware;
