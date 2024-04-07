import cors from "cors";

import { env } from "node:process";

const corsOptions = {
  origin: env.APP_DOMAIN,
  credentials: true,
  optionsSuccessStatus: 200,
};

export default cors(corsOptions);
