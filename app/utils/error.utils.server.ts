import { Prisma } from "@prisma/client";
import { json, redirect } from "@remix-run/node";

import PRISMA_ERROR_CODES from "~/constants/prismaErrorCodes.server";

import { AuthenticationError, CustomError } from "~/errors";

import Logger from "~/logger";

import { logoutHeaders } from "~/utils/auth.utils.server";

export const handleLoaderError = async (error: unknown) => {
  Logger.error((error as Error).stack);

  if (error instanceof AuthenticationError) {
    throw redirect(`/login?returnUrl=${error.currentRoute}`, {
      statusText: "Please login to continue",
      headers: await logoutHeaders(),
    });
  }

  if (error instanceof CustomError) {
    throw new Response(JSON.stringify(error.errors), {
      status: error.statusCode,
      statusText: error.statusText,
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code !== PRISMA_ERROR_CODES.UNIQUE_CONSTRAINT_FAILED) {
      throw new Response("Record not found", {
        status: 404,
        statusText: "Record not found",
      });
    }
  }

  throw new Response("Something went wrong", {
    status: 500,
    statusText: "Something went wrong",
  });
};

export const handleActionError = async (error: unknown) => {
  Logger.error((error as Error).stack);

  if (error instanceof AuthenticationError) {
    if (error.redirect) {
      return redirect(`/login?returnUrl=${error.currentRoute}`, {
        status: 401,
        statusText: "Please login to continue",
        headers: await logoutHeaders(),
      });
    }

    return json(
      { AuthenticationError: ["Authentication error"] },
      { status: 401, statusText: "Authentication error" },
    );
  }

  if (error instanceof CustomError) {
    return json(error.serializeErrors(), {
      status: error.statusCode,
      statusText: error.statusText,
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const recordType = error?.meta?.target
      ? (error.meta.target as string[])[0]
      : "record";

    if (
      error.code === PRISMA_ERROR_CODES.OPERATION_FAILED_AS_RECORD_NOT_FOUND
    ) {
      return json(
        { NotFoundError: [`${recordType} not found`] },
        { status: 404, statusText: "Record not found" },
      );
    }

    if (error.code === PRISMA_ERROR_CODES.UNIQUE_CONSTRAINT_FAILED) {
      return json(
        { AlreadyExists: [`${recordType} already exists`] },
        { status: 400, statusText: "Record already exists" },
      );
    }

    if (error.code === PRISMA_ERROR_CODES.FOREIGN_KEY_CONSTRAINT_FAILED) {
      return json(
        { NotFoundError: [`A related record for ${recordType} was not found`] },
        { status: 404, statusText: "Related record not found" },
      );
    }
  }

  //   if (error instanceof multer.MulterError) {
  //     if (error.message === "Unexpected field") {
  //       return res.status(400).send({
  //         errors: [
  //           {
  //             message: "Unexpected field",
  //           },
  //         ],
  //       });
  //     }
  //   }

  // if (error.message.includes("Boundary not found")) {
  //   return json(
  //     {
  //       errors: [
  //         {
  //           message: "Boundary not found",
  //         },
  //       ],
  //     },
  //     { status: 400 },
  //   );
  // }

  return json(
    { SomethingWentWrong: ["Something went wrong"] },
    { status: 500, statusText: "Something went wrong" },
  );
};
