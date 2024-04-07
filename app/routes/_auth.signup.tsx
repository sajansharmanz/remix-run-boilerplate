import { zodResolver } from "@hookform/resolvers/zod";
import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import {
  Link,
  useActionData,
  useLoaderData,
  useSubmit,
} from "@remix-run/react";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import AuthCard from "~/components/AuthCard";
import GoogleAuthButton from "~/components/GoogleAuthButton";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";

import userController from "~/controllers/user.controller.server";

import csrfCookie from "~/cookies/csrf.cookie.server";

import useGeneralFormError from "~/hooks/useGeneralFormError";
import usePasswordValidation from "~/hooks/usePasswordValidation";

import userSchemas from "~/schemas/user.schemas";

import { authAlreadyLoggedInRedirect } from "~/utils/auth.utils.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const headers = new Headers();
  const csrf = await csrfCookie.addHeaders(headers);
  await authAlreadyLoggedInRedirect(request);

  return json({ csrf }, { headers });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  return await userController.signUp(request);
};

export const meta: MetaFunction<typeof loader> = () => [
  { title: "Create an account - My App" },
  { name: "description", content: "Description" },
];

export default function SignUp() {
  const { csrf } = useLoaderData<typeof loader>();
  const data = useActionData<typeof action>();
  const submit = useSubmit();
  const [generalError, setGeneralError] = useGeneralFormError();

  const form = useForm<z.infer<typeof userSchemas.signUp>>({
    resolver: zodResolver(userSchemas.signUp),
    defaultValues: { email: "", password: "" },
  });

  const {
    value: passwordValue,
    component: passwordValidationComponent,
    onPasswordChange,
  } = usePasswordValidation();

  const onSubmit = (values: z.infer<typeof userSchemas.signUp>) => {
    const formData = new FormData();
    formData.append("csrf", csrf);

    Object.entries(values).forEach(([key, value]) => {
      formData.append(key, value);
    });

    submit(formData, { method: "POST" });
  };

  React.useEffect(() => {
    form.setValue("password", passwordValue);
  }, [passwordValue, form]);

  React.useEffect(() => {
    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        if (key === "email") {
          form.setError("email", { message: value ? value[0] : "" });
        } else if (key === "password") {
          form.setError("password", { message: value ? value[0] : "" });
        } else {
          setGeneralError(value ? value[0] : "");
        }
      });
    }
  }, [data, form, setGeneralError]);

  return (
    <AuthCard
      title="Create an account"
      description=" Enter your email below to create your account"
      mainContent={
        <>
          <Form {...form}>
            {generalError ? (
              <FormMessage aria-live="assertive">{generalError}</FormMessage>
            ) : null}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Email Address"
                        type="email"
                        required
                        aria-invalid={fieldState.invalid}
                        aria-describedby="email-error-message"
                      />
                    </FormControl>
                    <FormMessage
                      id="email-error-message"
                      aria-live="assertive"
                    />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="Password"
                        required
                        aria-invalid={fieldState.invalid}
                        aria-describedby="password-error-message password-requirements"
                        onChange={onPasswordChange}
                      />
                    </FormControl>
                    <FormMessage
                      id="password-error-message"
                      aria-live="assertive"
                    />
                    {passwordValidationComponent}
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Create account
              </Button>
            </form>
          </Form>

          <br />
          <GoogleAuthButton csrf={csrf} setError={setGeneralError} />
        </>
      }
      footerContent={
        <p className="text-xs">
          <Link to="/login">Already got an account? Click here to login</Link>
        </p>
      }
    />
  );
}
