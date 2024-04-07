/* eslint-disable require-await */
/* eslint-disable no-console */

import { Prisma, PrismaClient } from "@prisma/client";

import env from "~/config/environment.config.server";

import PERMISSIONS from "~/constants/permissions.server";
import DEFAULT_ROLES, { ADMIN_USER_ROLE_NAME } from "~/constants/roles.server";

import Logger from "~/logger";

import userSchemas from "~/schemas/user.schemas";

import { hashPassword } from "~/utils/password.utils.server";

const prisma = new PrismaClient();

const seed = (action: () => void, callback?: () => void): void => {
  action();

  if (callback) {
    setTimeout(() => callback(), 1500);
  }
};

const seedRoles = () => {
  DEFAULT_ROLES.forEach(async (r) => {
    await prisma.role.upsert({
      where: {
        name: r.name,
      },
      create: r,
      update: r,
    });
  });
};

const seedPermissions = () => {
  Object.values(PERMISSIONS).forEach(async (p) => {
    const data: Prisma.PermissionCreateInput = {
      name: p,
      description: `Allow user to ${p.split("_").join(" ").toLowerCase()}`,
    };

    await prisma.permission.upsert({
      where: {
        name: data.name,
      },
      create: data,
      update: data,
    });
  });
};

const seedDefaultUser = () => {
  const email = env.DEFAULT_ADMIN_EMAIL;
  const password = env.DEFAULT_ADMIN_PASSWORD;

  userSchemas.signUp.parse({
    email,
    password,
  });

  (async () => {
    const trimmedEmail = email.trim().toLowerCase();
    const hashedPassword = await hashPassword(password.trim());

    await prisma.user.upsert({
      where: {
        email: trimmedEmail,
      },
      create: {
        email: trimmedEmail,
        password: hashedPassword,
        roles: {
          connect: {
            name: ADMIN_USER_ROLE_NAME,
          },
        },
        profile: {
          create: {},
        },
      },
      update: {
        email: trimmedEmail,
        password: hashedPassword,
        roles: {
          connect: {
            name: ADMIN_USER_ROLE_NAME,
          },
        },
      },
    });
  })();
};

const main = async () => {
  seed(seedPermissions, () => seed(seedRoles, () => seedDefaultUser()));
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    Logger.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
