import { createThemeAction } from "remix-themes";

import { themeSessionCookie } from "~/cookies/theme.cookie.server";

export const action = createThemeAction(themeSessionCookie);
