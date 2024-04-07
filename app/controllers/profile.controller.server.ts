// eslint-disable-next-line camelcase
import { json, unstable_parseMultipartFormData } from "@remix-run/node";

import PERMISSIONS from "~/constants/permissions.server";

import csrfCookie from "~/cookies/csrf.cookie.server";

import checkAuth from "~/middleware/auth.middleware.server";
import csrfMiddleware from "~/middleware/csrf.middleware.server";
import checkPermissions from "~/middleware/permission.middleware.server";
import schemaValidator from "~/middleware/schemaValidator.middleware.server";

import profileSchemas from "~/schemas/profile.schemas";

import profileService from "~/service/profile.service.server";

import {
  handleActionError,
  handleLoaderError,
} from "~/utils/error.utils.server";
import { avatarUploadHandler } from "~/utils/file.utils.server";

const get = async (request: Request) => {
  try {
    const headers = new Headers();
    const { user } = await checkAuth(request, headers);
    checkPermissions(user, PERMISSIONS.READ_PROFILE, PERMISSIONS.READ_FILE);
    const csrf = await csrfCookie.addHeaders(headers);

    const profile = await profileService.findByUserId(user.id);
    const avatar = await profileService.findAvatarByUserId(user.id);

    if (!profile) {
      throw new Response("Record not found", {
        status: 404,
        statusText: "Record not found",
      });
    }

    return json({ profile, avatar, csrf }, { headers });
  } catch (error) {
    return handleLoaderError(error);
  }
};

const update = async (request: Request) => {
  try {
    const formData = await request.formData();
    const csrfToken = String(formData.get("csrf"));
    const firstName = formData.get("firstName")
      ? String(formData.get("firstName"))
      : null;
    const lastName = formData.get("lastName")
      ? String(formData.get("lastName"))
      : null;

    const headers = new Headers();
    await csrfMiddleware(request, csrfToken);
    const { user } = await checkAuth(request, headers);
    checkPermissions(user, PERMISSIONS.UPDATE_PROFILE);
    schemaValidator(profileSchemas.update, { firstName, lastName });

    const profile = await profileService.update(user.id, firstName, lastName);

    return json({ profile }, { headers });
  } catch (error) {
    return handleActionError(error);
  }
};

const createAvatar = async (request: Request) => {
  try {
    const formData = await unstable_parseMultipartFormData(
      request,
      avatarUploadHandler,
    );
    const csrfToken = String(formData.get("csrf"));
    const avatar = formData.get("avatar") as File;

    const headers = new Headers();
    await csrfMiddleware(request, csrfToken);
    const { user } = await checkAuth(request, headers);
    checkPermissions(user, PERMISSIONS.UPDATE_PROFILE, PERMISSIONS.UPDATE_FILE);

    const avatarForRes = await profileService.createAvatarByUserId(
      user.id,
      avatar,
    );

    return json({ avatar: avatarForRes }, { headers });
  } catch (error) {
    return handleActionError(error);
  }
};

const findAvatar = async (request: Request) => {
  try {
    const headers = new Headers();
    const { user } = await checkAuth(request, headers);
    checkPermissions(user, PERMISSIONS.READ_PROFILE, PERMISSIONS.READ_FILE);

    const avatarForRes = await profileService.findAvatarByUserId(user.id);

    return json({ avatar: avatarForRes }, { headers });
  } catch (error) {
    return handleLoaderError(error);
  }
};

const deleteAvatar = async (request: Request) => {
  try {
    const formData = await request.formData();
    const csrfToken = String(formData.get("csrf"));

    const headers = new Headers();
    await csrfMiddleware(request, csrfToken);
    const { user } = await checkAuth(request, headers);
    checkPermissions(user, PERMISSIONS.UPDATE_PROFILE, PERMISSIONS.DELETE_FILE);

    await profileService.deleteAvatarByUserId(user.id);

    return json({ avatar: "" }, { headers });
  } catch (error) {
    return handleActionError(error);
  }
};

const profileController = {
  get,
  update,
  createAvatar,
  findAvatar,
  deleteAvatar,
};

export default profileController;
