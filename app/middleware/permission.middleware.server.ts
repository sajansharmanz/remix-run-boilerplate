import { AuthenticationError } from "~/errors";

import { UserResponseBody } from "~/types/user.types";

const checkPermissions = (
  user: UserResponseBody,
  ...requiredPermissions: string[]
) => {
  const allocatedPermissions: string[] = [];

  user.roles.forEach((role) => {
    role.permissions.forEach((permission) =>
      allocatedPermissions.push(permission.name),
    );
  });

  if (
    !requiredPermissions.every((permission) =>
      allocatedPermissions.includes(permission),
    )
  ) {
    throw new AuthenticationError({ redirect: false });
  }
};

export default checkPermissions;
