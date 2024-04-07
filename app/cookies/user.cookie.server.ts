import { createCookie } from "@remix-run/node";

import {
  getCookieValue,
  serverCookieOptions,
} from "~/cookies/cookie.helpers.server";

import {
  OTPEnabledLoginUserResponseBody,
  UserResponseBody,
} from "~/types/user.types";

const cookie = createCookie("user", serverCookieOptions);

const getValue = async (
  request: Request,
): Promise<UserResponseBody | OTPEnabledLoginUserResponseBody | null> => {
  return await getCookieValue<
    UserResponseBody | OTPEnabledLoginUserResponseBody
  >(request, cookie);
};

const addHeaders = async (
  headers: Headers,
  user: UserResponseBody | OTPEnabledLoginUserResponseBody,
) => {
  headers.append("Set-Cookie", await cookie.serialize(user));
};

const userCookie = { cookie, getValue, addHeaders };

export default userCookie;
