import { createCookie } from "@remix-run/node";

import {
  getCookieValue,
  serverCookieOptions,
} from "~/cookies/cookie.helpers.server";

import tokenService from "~/service/token.service.server";

import { UserResponseBody } from "~/types/user.types";

const cookie = createCookie("session", serverCookieOptions);

const getValue = async (request: Request): Promise<string | null> => {
  return await getCookieValue<string>(request, cookie);
};

const addHeaders = async (headers: Headers, user: UserResponseBody) => {
  const sessionId = await tokenService.generateSessionId(user);

  headers.append("Set-Cookie", await cookie.serialize(sessionId));

  return sessionId;
};

const sessionCookie = { cookie, getValue, addHeaders };

export default sessionCookie;
