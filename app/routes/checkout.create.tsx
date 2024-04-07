import { ActionFunctionArgs } from "@remix-run/node";

import stripeController from "~/controllers/stripe.controller.server";

export const loader = () => {
  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  return await stripeController.createCheckout(request);
};
