import { createCookieSessionStorage } from "@remix-run/node";
import { createThemeSessionResolver } from "remix-themes";

import { serverCookieOptions } from "~/cookies/cookie.helpers.server";

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "theme",
    ...serverCookieOptions,
  },
});

export const themeSessionCookie = createThemeSessionResolver(sessionStorage);
