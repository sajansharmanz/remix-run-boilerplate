import { Prisma } from "@prisma/client";

import PERMISSIONS from "~/constants/permissions.server";

export const ADMIN_USER_ROLE_NAME = "Administrator";
export const DEFAULT_USER_ROLE_NAME = "User";

const DEFAULT_ROLES: Prisma.RoleCreateInput[] = [
  {
    name: ADMIN_USER_ROLE_NAME,
    description: "A super user with access to everything",
    system: true,
    permissions: {
      connect: Object.values(PERMISSIONS).map((p) => ({ name: p })),
    },
  },
  {
    name: DEFAULT_USER_ROLE_NAME,
    description: "Default role added to users who sign up",
    system: true,
    permissions: {
      connect: [
        { name: PERMISSIONS.READ_USER },
        { name: PERMISSIONS.UPDATE_USER },
        { name: PERMISSIONS.DELETE_USER },

        { name: PERMISSIONS.CREATE_PROFILE },
        { name: PERMISSIONS.READ_PROFILE },
        { name: PERMISSIONS.UPDATE_PROFILE },
        { name: PERMISSIONS.DELETE_PROFILE },

        { name: PERMISSIONS.CREATE_FILE },
        { name: PERMISSIONS.READ_FILE },
        { name: PERMISSIONS.UPDATE_FILE },
        { name: PERMISSIONS.DELETE_FILE },
      ],
    },
  },
];

export default DEFAULT_ROLES;
