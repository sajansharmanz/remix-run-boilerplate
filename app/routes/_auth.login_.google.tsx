import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";

import userController from "~/controllers/user.controller.server";

import userCookie from "~/cookies/user.cookie.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await userCookie.getValue(request);

  if (!user) {
    return redirect("/login");
  }

  return redirect("/");
};

export const action = async ({ request }: ActionFunctionArgs) => {
  return await userController.authWithGoogle(request);
};
