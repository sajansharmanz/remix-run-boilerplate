import { zodResolver } from "@hookform/resolvers/zod";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useSubmit,
} from "@remix-run/react";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import ErrorBoundary from "~/components/ErrorBoundary";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form as ShadcnForm,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";

import userController from "~/controllers/user.controller.server";

import useFormLoading from "~/hooks/useFormLoading";
import useGeneralFormError from "~/hooks/useGeneralFormError";

import userSchemas from "~/schemas/user.schemas";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return await userController.getMe(request);
};

export const action = async ({ request }: ActionFunctionArgs) => {
  return await userController.updateMe(request);
};

export default function MeAccount() {
  const { user, csrf } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();
  const [generalError, setGeneralError] = useGeneralFormError();
  const loading = useFormLoading();

  const form = useForm<z.infer<typeof userSchemas.updateMe>>({
    resolver: zodResolver(userSchemas.updateMe),
    defaultValues: {
      email: user.email,
    },
  });

  const onSubmit = (values: z.infer<typeof userSchemas.updateMe>) => {
    const formData = new FormData();
    formData.append("csrf", csrf);

    Object.entries(values).forEach(([key, value]) => {
      formData.append(key, value);
    });

    submit(formData, { method: "POST" });
  };

  React.useEffect(() => {
    if (actionData) {
      Object.entries(actionData).forEach(([key, value]) => {
        if (key === "email") {
          form.setError("email", { message: value ? value[0] : "" });
        } else {
          setGeneralError(value ? value[0] : "");
        }
      });
    }
  }, [actionData, form, setGeneralError]);

  return (
    <>
      <h2 className="text-2xl font-bold">Account</h2>
      <p className="text-muted-foreground">Update your account settings.</p>
      <hr className="my-4" />

      <div className="my-4 space-y-2">
        <ShadcnForm {...form}>
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
                  <FormMessage id="email-error-message" aria-live="assertive" />
                </FormItem>
              )}
            />
            <div className="flex- flex items-center justify-start">
              <Button type="submit">Save</Button>
              {loading}
            </div>
          </form>
        </ShadcnForm>
      </div>

      <div className="mt-20 space-y-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Permanently Delete Account</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Form
                action="delete"
                method="delete"
                className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md bg-primary text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              >
                <AlertDialogAction type="submit">Continue</AlertDialogAction>
              </Form>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}

export { ErrorBoundary };
