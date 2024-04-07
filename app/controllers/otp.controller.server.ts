import { json } from "@remix-run/node";

import PERMISSIONS from "~/constants/permissions.server";

import { ValidationError } from "~/errors";

import checkAuth from "~/middleware/auth.middleware.server";
import csrfMiddleware from "~/middleware/csrf.middleware.server";
import checkPermissions from "~/middleware/permission.middleware.server";

import userService from "~/service/user.service.server";

import { decrypt } from "~/utils/crypto.utils.server";
import {
  handleActionError,
  handleLoaderError,
} from "~/utils/error.utils.server";
import { generateSecret, generateTOTP } from "~/utils/otp.utils.server";

const generate = async (request: Request) => {
  try {
    const { user } = await checkAuth(request, new Headers());
    checkPermissions(user, PERMISSIONS.UPDATE_USER);

    const secret = generateSecret();

    const totp = generateTOTP(secret);

    const url = totp.toString();

    await userService.setOTPSecret(user.id, secret);

    return json({ secret, url });
  } catch (error) {
    return handleLoaderError(error);
  }
};

const verify = async (request: Request) => {
  try {
    const formData = await request.formData();
    const token = String(formData.get("token"));
    const csrfToken = String(formData.get("csrf"));
    const headers = new Headers();

    const err = new ValidationError({ OTPError: ["Error verifying token"] });

    await csrfMiddleware(request, csrfToken);
    const { user } = await checkAuth(request, headers);
    checkPermissions(user, PERMISSIONS.UPDATE_USER);

    const fullUser = await userService.findFullByEmail(user.email);

    if (
      !fullUser ||
      (fullUser &&
        (!fullUser.otpSecret || !fullUser.otpSecretIV || !fullUser.otpAuthTag))
    ) {
      throw err;
    }

    const secret = await decrypt(
      fullUser.otpSecret!,
      fullUser.otpSecretIV!,
      fullUser.otpAuthTag!,
    );

    const totp = generateTOTP(secret);

    const delta = totp.validate({ token, window: 1 });

    if (delta === null) {
      throw err;
    }

    await userService.setOTPVerified(fullUser.id);

    return json({ success: true }, { headers });
  } catch (error) {
    return handleActionError(error);
  }
};

const disable = async (request: Request) => {
  try {
    const formData = await request.formData();
    const token = String(formData.get("token"));
    const csrfToken = String(formData.get("csrf"));
    const headers = new Headers();

    const err = new ValidationError({ OTPError: ["Error verifying token"] });

    await csrfMiddleware(request, csrfToken);
    const { user } = await checkAuth(request, headers);
    checkPermissions(user, PERMISSIONS.UPDATE_USER);

    const fullUser = await userService.findFullByEmail(user.email);

    if (
      !fullUser ||
      (fullUser &&
        (!fullUser.otpSecret || !fullUser.otpSecretIV || !fullUser.otpAuthTag))
    ) {
      throw err;
    }

    const secret = await decrypt(
      fullUser.otpSecret!,
      fullUser.otpSecretIV!,
      fullUser.otpAuthTag!,
    );

    const totp = generateTOTP(secret);

    const delta = totp.validate({ token, window: 1 });

    if (delta === null) {
      throw err;
    }

    await userService.disableOTP(fullUser.id);

    return json({ success: true }, { headers });
  } catch (error) {
    return handleActionError(error);
  }
};

const otpController = { generate, verify, disable };

export default otpController;
