import { Permission, Role, User } from "@prisma/client";

export type UserResponseBody = Omit<
  User,
  | "password"
  | "failedLoginAttempts"
  | "otpSecret"
  | "otpSecretIV"
  | "otpAuthTag"
> & {
  roles: {
    name: Pick<Role, "name">["name"];
    permissions: {
      name: Pick<Permission, "name">["name"];
    }[];
  }[];
};

export type OTPEnabledLoginUserResponseBody = Pick<
  UserResponseBody,
  "id" | "otpEnabled"
>;
