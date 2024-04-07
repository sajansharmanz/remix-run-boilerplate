import { LoaderFunctionArgs } from "@remix-run/node";

import otpController from "~/controllers/otp.controller.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return await otpController.generate(request);
};

export const shouldRevalidate = () => false;
