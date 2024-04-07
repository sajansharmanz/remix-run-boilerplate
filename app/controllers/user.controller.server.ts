import { Prisma, TokenType, UserStatus } from "@prisma/client";
import { json, redirect } from "@remix-run/react";
import { OAuth2Client } from "google-auth-library";
import * as jose from "jose";
import { z } from "zod";

import env from "~/config/environment.config.server";

import PERMISSIONS from "~/constants/permissions.server";
import PRISMA_ERROR_CODES from "~/constants/prismaErrorCodes.server";

import csrfCookie from "~/cookies/csrf.cookie.server";
import sessionCookie from "~/cookies/session.cookie.server";
import userCookie from "~/cookies/user.cookie.server";

import { AuthenticationError, ValidationError } from "~/errors";

import checkAuth from "~/middleware/auth.middleware.server";
import csrfMiddleware from "~/middleware/csrf.middleware.server";
import checkPermissions from "~/middleware/permission.middleware.server";
import schemaValidator from "~/middleware/schemaValidator.middleware.server";

import userSchemas from "~/schemas/user.schemas";

import emailService from "~/service/email.service.server";
import tokenService from "~/service/token.service.server";
import userService from "~/service/user.service.server";

import { logoutHeaders } from "~/utils/auth.utils.server";
import {
  handleActionError,
  handleLoaderError,
} from "~/utils/error.utils.server";
import { verifyPassowrd } from "~/utils/password.utils.server";
import { verifyToken } from "~/utils/token.utils.server";

const signUp = async (request: Request) => {
  try {
    const formData = await request.formData();
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));
    const csrfToken = String(formData.get("csrf"));

    schemaValidator(userSchemas.signUp, {
      email,
      password,
    });
    await csrfMiddleware(request, csrfToken);

    const user = await userService.createWithEmailAndPassword(email, password);

    await emailService.signUp(user.email);

    const headers = new Headers();
    await userCookie.addHeaders(headers, user);
    await sessionCookie.addHeaders(headers, user);

    return redirect("/", { headers });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === PRISMA_ERROR_CODES.UNIQUE_CONSTRAINT_FAILED) {
        return json({
          EmailAlreadyInUse: ["Email address is already in use"],
        });
      }
    }

    return handleActionError(error);
  }
};

const login = async (request: Request) => {
  try {
    const formData = await request.formData();
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));
    const csrfToken = String(formData.get("csrf"));

    const authErr = new AuthenticationError({ redirect: false });

    try {
      schemaValidator(userSchemas.login, { email, password });
    } catch (error) {
      throw authErr;
    }

    await csrfMiddleware(request, csrfToken);

    const user = await userService.findFullByEmail(email);

    if (!user || (user && user.status !== UserStatus.ENABLED)) {
      throw authErr;
    }

    const { searchParams } = new URL(request.url);
    const returnUrl = searchParams.get("returnUrl") || "/";

    if (user.otpEnabled) {
      const headers = new Headers();
      await userCookie.addHeaders(headers, { id: user.id, otpEnabled: true });

      return redirect(`/login/verify?returnUrl=${returnUrl}`, { headers });
    }

    if (!(await verifyPassowrd(password, user.password))) {
      const failedLoginAttempts = user.failedLoginAttempts + 1;
      let newStatus: UserStatus = user.status;

      if (failedLoginAttempts >= env.MAX_FAILED_LOGIN_ATTEMPTS!) {
        newStatus = UserStatus.LOCKED;
        await emailService.accountLocked(user.email);
      }

      await userService.loginAttemptUpdates(
        user.id,
        failedLoginAttempts,
        newStatus,
      );

      throw authErr;
    }

    const userForResponse = await userService.loginAttemptUpdates(
      user.id,
      0,
      UserStatus.ENABLED,
    );

    const headers = new Headers();
    await userCookie.addHeaders(headers, userForResponse);
    await sessionCookie.addHeaders(headers, userForResponse);

    return redirect(returnUrl, { headers });
  } catch (error) {
    return handleActionError(error);
  }
};

const loginVerify = async (request: Request) => {
  try {
    const formData = await request.formData();
    const otpToken = String(formData.get("otpToken"));
    const userId = String(formData.get("userId"));
    const csrfToken = String(formData.get("csrf"));

    const authErr = new AuthenticationError({ redirect: false });

    await csrfMiddleware(request, csrfToken);

    try {
      schemaValidator(userSchemas.loginVerify, { otpToken, userId });
    } catch (error) {
      throw authErr;
    }

    const user = await tokenService.validateOTP(userId, otpToken);

    const headers = new Headers();
    await userCookie.addHeaders(headers, user);
    await sessionCookie.addHeaders(headers, user);

    const { searchParams } = new URL(request.url);
    const returnUrl = searchParams.get("returnUrl") || "/";
    return redirect(returnUrl, { headers });
  } catch (error) {
    return handleActionError(error);
  }
};

const authWithGoogle = async (request: Request) => {
  try {
    const formData = await request.formData();
    const csrfToken = String(formData.get("csrf"));
    const credential = String(formData.get("credential"));

    const { searchParams } = new URL(request.url);
    const returnUrl = searchParams.get("returnUrl") || "/";

    const authErr = new AuthenticationError({ redirect: false });

    await csrfMiddleware(request, csrfToken);

    let userFromGogle: z.infer<typeof userSchemas.authWithGoogle>;

    try {
      const client = new OAuth2Client();

      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: env.GOOGLE_OAUTH_CLIENT_ID,
      });

      const payload = ticket.getPayload();

      if (!payload) {
        throw new Error();
      }

      userFromGogle = userSchemas.authWithGoogle.parse({
        email: payload.email,
        firstName: payload.given_name,
        lastName: payload.family_name,
      });
    } catch (error) {
      throw authErr;
    }

    const fullUser = await userService.findFullByEmail(userFromGogle.email);

    if (fullUser) {
      if (fullUser.status !== UserStatus.ENABLED) {
        throw authErr;
      }

      if (fullUser.otpEnabled) {
        const headers = new Headers();
        await userCookie.addHeaders(headers, {
          id: fullUser.id,
          otpEnabled: true,
        });

        return redirect(`/login/verify?returnUrl=${returnUrl}`, { headers });
      }

      const userForResponse = await userService.loginAttemptUpdates(
        fullUser.id,
        0,
        UserStatus.ENABLED,
      );

      const headers = new Headers();
      await userCookie.addHeaders(headers, userForResponse);
      await sessionCookie.addHeaders(headers, userForResponse);

      return redirect(returnUrl, { headers });
    }

    const user = await userService.createWithOAuth(
      userFromGogle.email,
      userFromGogle.firstName,
      userFromGogle.lastName,
    );

    const headers = new Headers();
    await userCookie.addHeaders(headers, user);
    await sessionCookie.addHeaders(headers, user);

    return redirect(returnUrl, { headers });
  } catch (error) {
    return handleActionError(error);
  }
};

const authWithApple = async (request: Request) => {
  try {
    const formData = await request.formData();
    const error = formData.get("error");

    if (error) {
      throw new AuthenticationError({});
    }

    const user = String(formData.get("user"));
    const parsedUser = JSON.parse(user);

    const authErr = new AuthenticationError({ redirect: false });
    let userObj: z.infer<typeof userSchemas.authWithApple>;

    try {
      userObj = userSchemas.authWithApple.parse(parsedUser);
    } catch (error) {
      throw authErr;
    }

    const fullUser = await userService.findFullByEmail(userObj.email);

    if (fullUser) {
      if (fullUser.status !== UserStatus.ENABLED) {
        throw authErr;
      }

      if (fullUser.otpEnabled) {
        const headers = new Headers();
        await userCookie.addHeaders(headers, {
          id: fullUser.id,
          otpEnabled: true,
        });

        return redirect(`/login/verify`, { headers });
      }

      const userForResponse = await userService.loginAttemptUpdates(
        fullUser.id,
        0,
        UserStatus.ENABLED,
      );

      const headers = new Headers();
      await userCookie.addHeaders(headers, userForResponse);
      await sessionCookie.addHeaders(headers, userForResponse);

      return redirect("/", { headers });
    }

    const userForResponse = await userService.createWithOAuth(
      userObj.email,
      userObj.name.firstName,
      userObj.name.lastName,
    );

    const headers = new Headers();
    await userCookie.addHeaders(headers, userForResponse);
    await sessionCookie.addHeaders(headers, userForResponse);

    return redirect("/", { headers });
  } catch (error) {
    return handleActionError(error);
  }
};

const logout = async (request: Request) => {
  try {
    const { sessionId } = await checkAuth(request, new Headers());

    await tokenService.deleteToken(sessionId);

    return redirect("/", {
      headers: await logoutHeaders(),
    });
  } catch (error) {
    return handleLoaderError(error);
  }
};

const logoutAll = async (request: Request) => {
  try {
    const { user } = await checkAuth(request, new Headers());

    await tokenService.deleteAllSessions(user.id);

    return redirect("/", {
      headers: await logoutHeaders(),
    });
  } catch (error) {
    return handleLoaderError(error);
  }
};

const forgotPassword = async (request: Request) => {
  try {
    const formData = await request.formData();
    const email = String(formData.get("email"));
    const csrfToken = String(formData.get("csrf"));

    schemaValidator(userSchemas.forgotPassword, { email });
    await csrfMiddleware(request, csrfToken);

    const token = await tokenService.generatePasswordResetToken(email);
    await emailService.forgotPassword(email, token);

    return json({ success: true });
  } catch (error) {
    return json({ success: true });
  }
};

const resetPassword = async (request: Request) => {
  try {
    const formData = await request.formData();
    const token = String(formData.get("token"));
    const password = String(formData.get("password"));
    const csrfToken = String(formData.get("csrf"));

    await csrfMiddleware(request, csrfToken);
    schemaValidator(userSchemas.passwordReset, {
      token,
      password,
    });

    const { email } = (await verifyToken(token, TokenType.PASSWORD_RESET)) as {
      email: string;
    };

    await userService.resetPassword(email, password);
    await tokenService.deleteToken(token);
    await emailService.passwordReset(email);

    return json({ success: true });
  } catch (error) {
    if (error instanceof jose.errors.JWTExpired) {
      return handleActionError(
        new ValidationError({ TokenExpired: ["Password reset token expired"] }),
      );
    } else if (
      error instanceof jose.errors.JWSInvalid ||
      (error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === PRISMA_ERROR_CODES.OPERATION_FAILED_AS_RECORD_NOT_FOUND)
    ) {
      return handleActionError(
        new ValidationError({ TokenInvalid: ["Invalid token"] }),
      );
    }

    return handleActionError(error);
  }
};

const getMe = async (request: Request) => {
  try {
    const headers = new Headers();
    const { user } = await checkAuth(request, headers);
    checkPermissions(user, PERMISSIONS.READ_USER);
    const csrf = await csrfCookie.addHeaders(headers);

    return json({ user, csrf }, { headers });
  } catch (error) {
    return handleLoaderError(error);
  }
};

const updateMe = async (request: Request) => {
  try {
    const formData = await request.formData();
    const email = formData.get("email")
      ? String(formData.get("email"))
      : undefined;
    const password = formData.get("password")
      ? String(formData.get("password"))
      : undefined;
    const csrfToken = String(formData.get("csrf"));
    const headers = new Headers();

    await csrfMiddleware(request, csrfToken);
    schemaValidator(userSchemas.updateMe, { email, password });
    const { user } = await checkAuth(request, headers);
    checkPermissions(user, PERMISSIONS.UPDATE_USER);

    const userForRes = await userService.updateEmailAndOrPasswordById(user.id, {
      email,
      password,
    });

    await userCookie.addHeaders(headers, userForRes);

    return json({ user }, { headers });
  } catch (error) {
    return handleActionError(error);
  }
};

const deleteMe = async (request: Request) => {
  try {
    const { user } = await checkAuth(request, new Headers());
    checkPermissions(user, PERMISSIONS.DELETE_USER);

    await userService.deleteById(user.id);

    return redirect("/", { headers: await logoutHeaders() });
  } catch (error) {
    return handleActionError(error);
  }
};

const userController = {
  signUp,
  login,
  loginVerify,
  authWithGoogle,
  authWithApple,
  logout,
  logoutAll,
  forgotPassword,
  resetPassword,
  getMe,
  deleteMe,
  updateMe,
};

export default userController;
