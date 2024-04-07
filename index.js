/* eslint-disable no-console */
import { createRequestHandler } from "@remix-run/express";
import { installGlobals } from "@remix-run/node";
import compression from "compression";
import express from "express";
import helmet from "helmet";

import crypto from "node:crypto";
import { env } from "node:process";

import cache from "./server/cache.middleware.js";
import httpLogger from "./server/httpLogger.middleware.js";
import rateLimit from "./server/rateLimit.middleware.js";

installGlobals();

const viteDevServer =
  env.NODE_ENV === "production"
    ? undefined
    : await import("vite").then((vite) =>
        vite.createServer({
          server: { middlewareMode: true },
        }),
      );

const remixHandler = createRequestHandler({
  getLoadContext: (_req, res) => ({ cspNonce: res.locals.cspNonce }),
  build: viteDevServer
    ? () => viteDevServer.ssrLoadModule("virtual:remix/server-build")
    : await import("./build/server/index.js"),
});

const app = express();

app.get("*", (req, res, next) => {
  if (req.path.endsWith("/") && req.path.length > 1) {
    const query = req.url.slice(req.path.length);
    const safepath = req.path.slice(0, -1).replace(/\/+/g, "/");
    res.redirect(302, safepath + query);
  } else {
    next();
  }
});

app.use((_req, res, next) => {
  res.locals.cspNonce = crypto.randomBytes(16).toString("hex");
  next();
});

app.use(
  helmet({
    referrerPolicy: { policy: "same-origin" },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    contentSecurityPolicy: {
      directives: {
        "connect-src": [
          env.NODE_ENV === "development" ? "ws:" : null,
          "'self'",
          "https://accounts.google.com/gsi/",
          "https://appleid.cdn-apple.com/appleauth/",
        ].filter(Boolean),
        "font-src": ["'self'", "data:"],
        "frame-src": [
          "'self'",
          "https://accounts.google.com/gsi/",
          "https://appleid.cdn-apple.com/appleauth/",
        ],
        "img-src": ["'self'", "data:"],
        "script-src": [
          // "'strict-dynamic'",
          "'self'",
          (_req, res) => `'nonce-${res.locals.cspNonce}'`,
          "https://accounts.google.com/gsi/client",
          "https://appleid.cdn-apple.com/appleauth/",
        ],
        "script-src-attr": [
          // "'strict-dynamic'",
          "'self'",
          (_req, res) => `'nonce-${res.locals.cspNonce}'`,
          "https://accounts.google.com/gsi/client",
          "https://appleid.cdn-apple.com/appleauth/",
        ],
        "upgrade-insecure-requests": null,
      },
    },
  }),
);

app.use(compression());

app.use(rateLimit);
app.use(httpLogger);

app.use(cache);

// handle asset requests
if (viteDevServer) {
  app.use(viteDevServer.middlewares);
} else {
  // Vite fingerprints its assets so we can cache forever.
  app.use(
    "/assets",
    express.static("build/client/assets", { immutable: true, maxAge: "1y" }),
  );
}

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static("build/client", { maxAge: "1h" }));

// handle SSR requests
app.all("*", remixHandler);

const port = env.PORT || 3000;
app.listen(port, () =>
  console.log(`Express server listening at http://localhost:${port}`),
);
