import { redirect } from "@remix-run/react";

import csrfCookie from "~/cookies/csrf.cookie.server";
import sessionCookie from "~/cookies/session.cookie.server";
import userCookie from "~/cookies/user.cookie.server";

export const authAlreadyLoggedInRedirect = async (
  request: Request,
): Promise<ReturnType<typeof redirect> | void> => {
  const user = await userCookie.getValue(request);

  if (user && "email" in user) {
    throw redirect("/");
  }
};

export const logoutHeaders = async (): Promise<Headers> => {
  const headers = new Headers();

  headers.append(
    "Set-Cookie",
    await userCookie.cookie.serialize("", { maxAge: 1 }),
  );

  headers.append(
    "Set-Cookie",
    await csrfCookie.cookie.serialize("", { maxAge: 1 }),
  );

  headers.append(
    "Set-Cookie",
    await sessionCookie.cookie.serialize("", { maxAge: 1 }),
  );

  return headers;
};
