import { User, UserStatus } from "@prisma/client";
import { z } from "zod";

import { DEFAULT_USER_ROLE_NAME } from "~/constants/roles.server";

import userSchemas from "~/schemas/user.schemas";

import { UserResponseBody } from "~/types/user.types";

import { encrypt, generateRandomString } from "~/utils/crypto.utils.server";
import { hashPassword } from "~/utils/password.utils.server";
import { prisma } from "~/utils/prisma.utils.server";

const USER_FOR_RESPONSE = {
  id: true,
  email: true,
  status: true,
  otpEnabled: true,
  createdAt: true,
  updatedAt: true,
  roles: {
    select: {
      name: true,
      permissions: {
        select: {
          name: true,
        },
      },
    },
  },
};

const createWithEmailAndPassword = async (
  email: string,
  password: string,
): Promise<UserResponseBody> => {
  const hashedPassword = await hashPassword(password.trim());

  return await prisma.user.create({
    data: {
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      roles: {
        connect: [{ name: DEFAULT_USER_ROLE_NAME }],
      },
      profile: {
        create: {},
      },
    },
    select: USER_FOR_RESPONSE,
  });
};

const createWithOAuth = async (
  email: string,
  firstName: string | undefined,
  lastName: string | undefined,
) => {
  const randomString = await generateRandomString();
  const hashedPassword = await hashPassword(randomString);

  return await prisma.user.create({
    data: {
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      roles: {
        connect: [{ name: DEFAULT_USER_ROLE_NAME }],
      },
      profile: {
        create: {
          firstName,
          lastName,
        },
      },
    },
    select: USER_FOR_RESPONSE,
  });
};

const findFullByEmail = async (email: string): Promise<User | null> => {
  return await prisma.user.findUnique({
    where: {
      email: email.toLowerCase().trim(),
    },
  });
};

const findById = async (userId: string): Promise<UserResponseBody | null> => {
  return await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: USER_FOR_RESPONSE,
  });
};

const loginAttemptUpdates = async (
  userId: string,
  failedLoginAttempts: number,
  status: UserStatus,
) => {
  return await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      failedLoginAttempts,
      status,
    },
    select: USER_FOR_RESPONSE,
  });
};

const resetPassword = async (email: string, password: string) => {
  const hashedPasssowrd = await hashPassword(password.trim());

  await prisma.user.update({
    where: {
      email: email.toLowerCase().trim(),
    },
    data: {
      status: UserStatus.ENABLED,
      password: hashedPasssowrd,
    },
  });
};

const deleteById = async (userId: string) => {
  await prisma.user.delete({
    where: {
      id: userId,
    },
  });
};

const updateEmailAndOrPasswordById = async (
  userId: string,
  { email, password }: z.infer<typeof userSchemas.updateMe>,
) => {
  let data = {};

  if (email !== undefined && email !== null) {
    data = {
      ...data,
      email: email.toLowerCase().trim(),
    };
  }

  if (password !== undefined && password !== null) {
    const hashedPasssowrd = await hashPassword(password.trim());

    data = {
      ...data,
      password: hashedPasssowrd,
    };
  }

  return await prisma.user.update({
    where: {
      id: userId,
    },
    data,
    select: USER_FOR_RESPONSE,
  });
};

const setOTPSecret = async (userId: string, secret: string) => {
  const { content, iv, authTag } = await encrypt(secret);

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      otpSecret: content,
      otpSecretIV: iv,
      otpAuthTag: authTag,
    },
  });
};

const setOTPVerified = async (userId: string) => {
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      otpEnabled: true,
    },
  });
};

const disableOTP = async (userId: string) => {
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      otpEnabled: false,
      otpSecret: null,
      otpSecretIV: null,
      otpAuthTag: null,
    },
  });
};

const userService = {
  createWithEmailAndPassword,
  createWithOAuth,
  findFullByEmail,
  findById,
  loginAttemptUpdates,
  resetPassword,
  deleteById,
  updateEmailAndOrPasswordById,
  setOTPSecret,
  setOTPVerified,
  disableOTP,
};

export default userService;
