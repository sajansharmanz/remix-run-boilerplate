import { env } from "node:process";

const cache = (req, res, next) => {
  // Period in seconds
  const cachePeriod = 60 * 60;

  const ignoreRoutes = ["/swagger", "/healthcheck"];

  if (env.NODE_ENV === "production") {
    if (
      req.method === "GET" &&
      !ignoreRoutes.some((value) => req.path.includes(value))
    ) {
      res.set("Cache-Control", `public, max-age=${cachePeriod}`);
    } else {
      res.set("Cache-control", `no-store`);
    }
  }

  next();
};

export default cache;
