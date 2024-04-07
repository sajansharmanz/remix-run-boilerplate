import Stripe from "stripe";

import env from "~/config/environment.config.server";

export const stripe = new Stripe(env.STRIPE_SECRET_KEY);
