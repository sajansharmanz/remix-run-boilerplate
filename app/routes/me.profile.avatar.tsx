import { ActionFunctionArgs } from "@remix-run/node";

import profileController from "~/controllers/profile.controller.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method === "DELETE") {
    return await profileController.deleteAvatar(request);
  }

  return await profileController.createAvatar(request);
};
