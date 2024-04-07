import { zodResolver } from "@hookform/resolvers/zod";
import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { useActionData, useLoaderData, useSubmit } from "@remix-run/react";
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "~/components/ui/input-otp";

import userController from "~/controllers/user.controller.server";

import csrfCookie from "~/cookies/csrf.cookie.server";
import userCookie from "~/cookies/user.cookie.server";

import useGeneralFormError from "~/hooks/useGeneralFormError";

import userSchemas from "~/schemas/user.schemas";

import { authAlreadyLoggedInRedirect } from "~/utils/auth.utils.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const headers = new Headers();
  const csrf = await csrfCookie.addHeaders(headers);
  const user = await userCookie.getValue(request);

  if (!user) {
    return redirect("/login");
  }

  await authAlreadyLoggedInRedirect(request);

  return json({ csrf, user }, { headers });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  return await userController.loginVerify(request);
};

export default function LoginVerify() {
  const { csrf, user } = useLoaderData<typeof loader>();
  const data = useActionData<typeof action>();
  const submit = useSubmit();
  const [generalError, setGeneralError] = useGeneralFormError();

  const form = useForm<z.infer<typeof userSchemas.loginVerify>>({
    resolver: zodResolver(userSchemas.loginVerify),
    defaultValues: { otpToken: "", userId: user?.id },
  });

  const onSubmit = (values: z.infer<typeof userSchemas.loginVerify>) => {
    const formData = new FormData();
    formData.append("csrf", csrf);

    Object.entries(values).forEach(([key, value]) => {
      formData.append(key, value);
    });

    submit(formData, { method: "POST" });
  };

  React.useEffect(() => {
    if (data) {
      const entries = Object.entries(data);

      if (entries.length > 0) {
        entries.forEach(([, value]) => {
          setGeneralError(value ? value[0] : "");
        });
      }
    }
  }, [data, setGeneralError]);

  return (
    <AuthCard
      title="Two Factor Authentication"
      description="Please enter the one-time password from your authenticator app"
      mainContent={
        <Form {...form}>
          {generalError ? (
            <FormMessage aria-live="assertive">{generalError}</FormMessage>
          ) : null}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Input type="hidden" name="userId" value={user?.id} />

            <FormField
              control={form.control}
              name="otpToken"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>One-Time Password</FormLabel>
                  <FormControl>
                    <InputOTP
                      {...field}
                      className="w-full"
                      maxLength={6}
                      render={({ slots }) => (
                        <InputOTPGroup>
                          {slots.map((slot, index) => (
                            <InputOTPSlot key={index} {...slot} />
                          ))}{" "}
                        </InputOTPGroup>
                      )}
                      aria-invalid={fieldState.invalid}
                      aria-describedby="otp-error-message"
                    />
                  </FormControl>
                  <FormMessage id="otp-error-message" aria-live="assertive" />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Verify
            </Button>
          </form>
        </Form>
      }
    />
  );
}
