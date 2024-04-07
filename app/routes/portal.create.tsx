import { ActionFunctionArgs } from "@remix-run/node";

import stripeController from "~/controllers/stripe.controller.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  return await stripeController.createPortal(request);
};
