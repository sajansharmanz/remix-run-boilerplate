import { createCookie } from "@remix-run/node";

import {
  getCookieValue,
  serverCookieOptions,
} from "~/cookies/cookie.helpers.server";

import tokenService from "~/service/token.service.server";

const cookie = createCookie("csrf", serverCookieOptions);

const getValue = async (request: Request): Promise<string | null> => {
  return await getCookieValue<string>(request, cookie);
};

const addHeaders = async (headers: Headers) => {
  const [token, signedToken] = await tokenService.generateCsrfToken();

  headers.append("Set-Cookie", await cookie.serialize(signedToken));

  return token;
};

const csrfCookie = {
  cookie,
  getValue,
  addHeaders,
};

export default csrfCookie;
