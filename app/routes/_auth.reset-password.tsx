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

import userSchemas from "~/schemas/user.schemas";

import { authAlreadyLoggedInRedirect } from "~/utils/auth.utils.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const headers = new Headers();
  const csrf = await csrfCookie.addHeaders(headers);
  await authAlreadyLoggedInRedirect(request);

  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token") ?? "";

  return json({ csrf, token }, { headers });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  return await userController.resetPassword(request);
};

export const meta: MetaFunction<typeof loader> = () => [
  { title: "Reset Password - My App" },
  { name: "description", content: "Description" },
];

export default function ResetPassword() {
  const { csrf, token } = useLoaderData<typeof loader>();
  const data = useActionData<typeof action>();
  const submit = useSubmit();
  const [generalError, setGeneralError] = useGeneralFormError();

  const form = useForm<z.infer<typeof userSchemas.passwordReset>>({
    resolver: zodResolver(userSchemas.passwordReset),
    defaultValues: { token, password: "" },
  });

  const onSubmit = (values: z.infer<typeof userSchemas.passwordReset>) => {
    const formData = new FormData();
    formData.append("csrf", csrf);

    Object.entries(values).forEach(([key, value]) => {
      formData.append(key, value);
    });

    submit(formData, { method: "POST" });
  };

  React.useEffect(() => {
    if (data) {
      Object.entries(data).forEach(([, value]) => {
        setGeneralError(value ? value[0] : "");
      });
    }
  }, [data, setGeneralError]);

  if (data && "success" in data) {
    return (
      <AuthCard
        title="Reset Password"
        description="Enter the code below from the email"
        mainContent={
          <>
            <div className="space-y-1">
              <p>Your password has been changed successfully!</p>
            </div>
            <div className="mt-2 space-y-1">
              <Link to="/login">
                <Button type="button" className="w-full">
                  Click here to login
                </Button>
              </Link>
            </div>
          </>
        }
      />
    );
  }

  return (
    <AuthCard
      title="Reset Password"
      description="Enter the code below from the email"
      mainContent={
        <Form {...form}>
          {generalError ? (
            <FormMessage aria-live="assertive">{generalError}</FormMessage>
          ) : null}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="token"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Token</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Token"
                      type="string"
                      required
                      aria-invalid={fieldState.invalid}
                      aria-describedby="token-error-message"
                    />
                  </FormControl>
                  <FormMessage id="token-error-message" aria-live="assertive" />
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
                    />
                  </FormControl>
                  <FormMessage
                    id="password-error-message"
                    aria-live="assertive"
                  />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Reset Password
            </Button>
          </form>
        </Form>
      }
    />
  );
}
