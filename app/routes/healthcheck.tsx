import { json } from "@remix-run/react";

export const loader = () => {
  return json({ message: "API running" });
};
