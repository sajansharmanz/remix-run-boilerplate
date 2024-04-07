import { Cookie, CookieOptions } from "@remix-run/node";

import env from "~/config/environment.config.server";

export const serverCookieOptions: CookieOptions = {
  maxAge: 604800000,
  httpOnly: true,
  sameSite: "lax",
  path: "/",
  secure: env.NODE_ENV === "production",
  secrets: [env.COOKIE_SECRET],
};

export const clientCookieOptions: CookieOptions = {
  maxAge: 604800000,
  sameSite: "lax",
  path: "/",
};

export const getCookieValue = async <T>(
  request: Request,
  cookie: Cookie,
): Promise<T | null> => {
  return await cookie.parse(request.headers.get("Cookie"));
};
