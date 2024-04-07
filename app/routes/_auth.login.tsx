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

import userSchemas from "~/schemas/user.schemas";

import { authAlreadyLoggedInRedirect } from "~/utils/auth.utils.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const headers = new Headers();
  const csrf = await csrfCookie.addHeaders(headers);
  await authAlreadyLoggedInRedirect(request);

  return json({ csrf }, { headers });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  return await userController.login(request);
};

export const meta: MetaFunction<typeof loader> = () => [
  { title: "Login - My App" },
  { name: "description", content: "Description" },
];

export default function SignIn() {
  const { csrf } = useLoaderData<typeof loader>();
  const data = useActionData<typeof action>();
  const submit = useSubmit();
  const [generalError, setGeneralError] = useGeneralFormError();

  const form = useForm<z.infer<typeof userSchemas.login>>({
    resolver: zodResolver(userSchemas.login),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (values: z.infer<typeof userSchemas.login>) => {
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

  return (
    <AuthCard
      title="Sign In"
      description="Enter your email to sign in to your account"
      mainContent={
        <>
          <Form {...form}>
            {generalError ? (
              <FormMessage aria-live="assertive">{generalError}</FormMessage>
            ) : null}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                Sign In
              </Button>
            </form>
          </Form>

          <br />
          <GoogleAuthButton csrf={csrf} setError={setGeneralError} />
        </>
      }
      footerContent={
        <div className="flex flex-col items-center justify-center">
          <p className="mb-2 text-xs">
            <Link to="/forgot-password">Forgot Password</Link>
          </p>

          <p className="text-xs">
            <Link to="/signup">
              Don&apos;t have an account? Click here to sign up
            </Link>
          </p>
        </div>
      }
    />
  );
}
