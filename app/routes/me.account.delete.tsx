import { ActionFunctionArgs, redirect } from "@remix-run/node";

import userController from "~/controllers/user.controller.server";

export const loader = () => {
  return redirect("/me/account");
};

export const action = async ({ request }: ActionFunctionArgs) => {
  return await userController.deleteMe(request);
};
