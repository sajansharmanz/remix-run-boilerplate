import { rateLimit as RL } from "express-rate-limit";

import { env } from "node:process";

const rateLimit =
  env.NODE_ENV !== "production"
    ? (_req, _res, next) => next()
    : RL({
        windowMs: 60 * 1000,
        standardHeaders: true,
        legacyHeaders: true,
        validate: { trustProxy: false },
        max: (req) => {
          switch (req.path) {
            case "/signup":
            case "/login":
            case "/login/google":
            case "/login/apple":
            case "/login/verify":
            case "/forgot-password":
            case "/reset-password":
              return 10;
            default:
              return 100;
          }
        },
      });

export default rateLimit;
