/* eslint-disable no-console */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-case-declarations */
import { ActionFunctionArgs, json } from "@remix-run/node";
import Stripe from "stripe";

import env from "~/config/environment.config.server";

import Logger from "~/logger";

const stripe = new Stripe(env.STRIPE_SECRET_KEY);
const webhookKey = env.STRIPE_WEBHOOK_KEY;

export const action = async ({ request }: ActionFunctionArgs) => {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookKey);
  } catch (error: unknown) {
    const err = error as Error;
    Logger.error(`Webhook signature failed. ${err.message}`);
    return json({ error: err.message }, { status: 400 });
  }

  let subscription;
  let status;

  switch (event.type) {
    case "checkout.session.completed":
      const session = await stripe.checkout.sessions.retrieve(
        event.data.object.id,
        {
          expand: ["line_items"],
        },
      );
      console.log(`Purchase line items are ${session.line_items}`);
      // Then define and call a method to handle purchase completion.
      // handlePurchaseComplete(session.lineItems)
      break;
    case "checkout.session.async_payment_succeeded":
      const session2 = await stripe.checkout.sessions.retrieve(
        event.data.object.id,
        {
          expand: ["line_items"],
        },
      );
      console.log(`Purchase line items are ${session2.line_items}`);
      // Then define and call a method to handle purchase completion.
      // handlePurchaseComplete(session.lineItems)
      break;
    case "checkout.session.expired":
      // Send abandoned cart email with checkout recovery link
      break;
    case "customer.source.expiring":
      // Send email to billing portal to update payment method
      break;
    case "customer.subscription.trial_will_end":
      subscription = event.data.object;
      status = subscription.status;
      console.log(`Subscription status is ${status}.`);
      // Then define and call a method to handle the subscription trial ending.
      // handleSubscriptionTrialEnding(subscription);
      break;
    case "customer.subscription.deleted":
      // revoke access + send win-back email
      subscription = event.data.object;
      status = subscription.status;
      console.log(`Subscription status is ${status}.`);
      // Then define and call a method to handle the subscription deleted.
      // handleSubscriptionDeleted(subscriptionDeleted);
      break;
    case "customer.subscription.created":
      subscription = event.data.object;
      status = subscription.status;
      console.log(`Subscription status is ${status}.`);
      // Then define and call a method to handle the subscription created.
      // handleSubscriptionCreated(subscription);
      break;
    case "customer.subscription.updated":
      // called when initiating a cancel_at_period_end cancellation
      subscription = event.data.object;
      status = subscription.status;
      console.log(`Subscription status is ${status}.`);
      // Then define and call a method to handle the subscription update.
      // handleSubscriptionUpdated(subscription);
      break;
    case "radar.early_fraud_warning.created":
      // pro-actively cancel subscription and refund
      break;
    case "invoice.payment_action_required":
      break;
    case "invoice.payment_failed":
      // Send email with invoice
      break;
    default:
      console.log(`Unhandled event type ${event.type}.`);
      break;
  }

  return json({});
};
