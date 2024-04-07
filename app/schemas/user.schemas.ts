import isStrongPassword from "validator/lib/isStrongPassword";
import { z } from "zod";

const passwordValidator = z
  .string()
  .refine((value) => isStrongPassword(value), {
    message: "Invalid Password",
  });

const signUp = z.object({
  email: z.string().email(),
  password: passwordValidator,
});

const loginVerify = z.object({
  otpToken: z.string().min(6).max(6),
  userId: z.string(),
});

const forgotPassword = z.object({
  email: z.string().email(),
});

const passwordReset = z.object({
  token: z.string(),
  password: passwordValidator,
});

const updateMe = z.object({
  email: z.string().email().optional(),
  password: passwordValidator.optional(),
});

const authWithGoogle = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

const authWithApple = z.object({
  email: z.string().email(),
  name: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
  }),
});

const userSchemas = {
  signUp,
  login: signUp,
  loginVerify,
  authWithGoogle,
  authWithApple,
  forgotPassword,
  passwordReset,
  updateMe,
};

export default userSchemas;
