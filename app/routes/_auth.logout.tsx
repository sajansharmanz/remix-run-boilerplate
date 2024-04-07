import { googleLogout } from "@react-oauth/google";
import { LoaderFunctionArgs } from "@remix-run/node";
import React from "react";

import userController from "~/controllers/user.controller.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return await userController.logout(request);
};

export default function Logout() {
  React.useEffect(() => {
    googleLogout();
  }, []);

  return <h1>Logging out...</h1>;
}
