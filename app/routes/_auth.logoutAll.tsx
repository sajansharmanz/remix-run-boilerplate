import { LoaderFunctionArgs } from "@remix-run/node";

import userController from "~/controllers/user.controller.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return await userController.logoutAll(request);
};
