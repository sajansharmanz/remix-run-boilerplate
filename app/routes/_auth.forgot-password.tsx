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

import userSchemas from "~/schemas/user.schemas";

import { authAlreadyLoggedInRedirect } from "~/utils/auth.utils.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const headers = new Headers();
  const csrf = await csrfCookie.addHeaders(headers);
  await authAlreadyLoggedInRedirect(request);

  return json({ csrf }, { headers });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  return await userController.forgotPassword(request);
};

export const meta: MetaFunction<typeof loader> = () => [
  { title: "Forgot Password - My App" },
  { name: "description", content: "Description" },
];

export default function ForgotPassword() {
  const { csrf } = useLoaderData<typeof loader>();
  const data = useActionData<typeof action>();
  const submit = useSubmit();

  const form = useForm<z.infer<typeof userSchemas.forgotPassword>>({
    resolver: zodResolver(userSchemas.forgotPassword),
    defaultValues: { email: "" },
  });

  const onSubmit = (values: z.infer<typeof userSchemas.forgotPassword>) => {
    const formData = new FormData();
    formData.append("csrf", csrf);

    Object.entries(values).forEach(([key, value]) => {
      formData.append(key, value);
    });

    submit(formData, { method: "POST" });
  };

  if (data?.success !== undefined) {
    return (
      <AuthCard
        title="Forgot Password"
        description="Enter your email below, and we'll email you a link to reset your password"
        mainContent={
          <p className="text-sm">
            If you&apos;re email exists in our system, you will receive an email
            shortly with further instructions.
          </p>
        }
      />
    );
  }

  return (
    <AuthCard
      title="Forgot Password"
      description="Enter your email below, and we'll email you a link to reset your password"
      mainContent={
        <Form {...form}>
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
                  <FormMessage id="email-error-message" aria-live="assertive" />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Send Email
            </Button>
          </form>
        </Form>
      }
      footerContent={
        <p className="text-xs">
          <Link to="/login">Remember your password? Click here to login</Link>
        </p>
      }
    />
  );
}
