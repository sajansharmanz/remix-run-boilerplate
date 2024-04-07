/* eslint-disable camelcase */
import { redirect } from "@remix-run/node";

import env from "~/config/environment.config.server";

import userCookie from "~/cookies/user.cookie.server";

import Logger from "~/logger";

import csrfMiddleware from "~/middleware/csrf.middleware.server";

import { UserResponseBody } from "~/types/user.types";

import { handleActionError } from "~/utils/error.utils.server";
import { stripe } from "~/utils/stripe.utils.server";

const createCheckout = async (request: Request) => {
  try {
    const formData = await request.formData();
    const csrfToken = String(formData.get("csrf"));
    const lookupKey = formData.get("lookup_key");

    await csrfMiddleware(request, csrfToken);
    const user = (await userCookie.getValue(
      request,
    )) as UserResponseBody | null;

    if (lookupKey) {
      const prices = await stripe.prices.list({
        lookup_keys: [String(lookupKey)],
        expand: ["data.product"],
      });

      const session = await stripe.checkout.sessions.create({
        customer_email: user?.email,
        line_items: [{ price: prices.data[0].id, quantity: 1 }],
        mode: "subscription",
        success_url: `${env.APP_DOMAIN}/checkout/success?sessionId={CHECKOUT_SESSION_ID}`,
        cancel_url: `${env.APP_DOMAIN}/checkout/cancel`,
      });

      return redirect(session.url!, { status: 303 });
    }

    const session = await stripe.checkout.sessions.create({
      customer_email: user?.email,

      line_items: [
        {
          price: "price_1OtwvkAGDnixpwVhtctn0Bg6",
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${env.APP_DOMAIN}/checkout/success`,
      cancel_url: `${env.APP_DOMAIN}/checkout/cancel`,
    });

    return redirect(session.url!, { status: 303 });
  } catch (error) {
    return handleActionError(error);
  }
};

const createPortal = async (request: Request) => {
  try {
    const formData = await request.formData();
    const csrfToken = String(formData.get("csrf"));
    const sessionId = String(formData.get("session_id"));

    Logger.info(csrfToken);

    await csrfMiddleware(request, csrfToken);

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: String(session.customer),
      return_url: env.APP_DOMAIN,
    });

    return redirect(portalSession.url, { status: 303 });
  } catch (error) {
    return handleActionError(error);
  }
};

const stripeController = { createCheckout, createPortal };

export default stripeController;
