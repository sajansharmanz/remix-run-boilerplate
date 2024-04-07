import { ActionFunctionArgs, redirect } from "@remix-run/node";

import otpController from "~/controllers/otp.controller.server";

export const loader = () => {
  return redirect("/me/security");
};

export const action = async ({ request }: ActionFunctionArgs) => {
  return await otpController.verify(request);
};
