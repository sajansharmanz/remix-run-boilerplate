import { zodResolver } from "@hookform/resolvers/zod";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  useActionData,
  useFetcher,
  useLoaderData,
  useSubmit,
} from "@remix-run/react";
import QRCode from "qrcode";
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "~/components/ui/input-otp";

import userController from "~/controllers/user.controller.server";

import { IError } from "~/errors";

import useFormLoading from "~/hooks/useFormLoading";
import useGeneralFormError from "~/hooks/useGeneralFormError";

import userSchemas from "~/schemas/user.schemas";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return await userController.getMe(request);
};

export const action = async ({ request }: ActionFunctionArgs) => {
  return await userController.updateMe(request);
};

export default function MeSecurity() {
  const { user, csrf } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const [generalError, setGeneralError] = useGeneralFormError();
  const actionData = useActionData<typeof action>();
  const loading = useFormLoading();

  const enableOTPFetcher = useFetcher<{ secret: string; url: string }>({
    key: "enable-otp",
  });
  const enableFetcherCalled = React.useRef<boolean>(false);
  const [enableModalOpen, setEnableModalOpen] = React.useState<boolean>(false);
  const [url, setUrl] = React.useState<string | undefined>(undefined);
  const [secret, setSecret] = React.useState<string | undefined>(undefined);
  const [qrCode, setQRCode] = React.useState<string | undefined>(undefined);

  const verifyOTPFetcher = useFetcher<{ success: boolean } | IError>({
    key: "verify-otp",
  });
  const [verifyError, setVerifyError] = useGeneralFormError();

  const disableOTPFetcher = useFetcher<{ success: boolean } | IError>({
    key: "disable-otp",
  });
  const [disableModalOpen, setDisableModalOpen] =
    React.useState<boolean>(false);
  const [disableError, setDisableError] = useGeneralFormError();

  const form = useForm<z.infer<typeof userSchemas.updateMe>>({
    resolver: zodResolver(userSchemas.updateMe),
    defaultValues: {
      password: "",
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
    if (
      !enableFetcherCalled.current &&
      enableModalOpen &&
      url === undefined &&
      secret === undefined &&
      qrCode === undefined
    ) {
      enableOTPFetcher.load("/me/security/otp/generate");
      enableFetcherCalled.current = true;
    }
  }, [enableModalOpen, url, secret, qrCode, enableOTPFetcher]);

  React.useEffect(() => {
    if (actionData) {
      Object.entries(actionData).forEach(([key, value]) => {
        if (key === "password") {
          form.setError("password", { message: value ? value[0] : "" });
        } else {
          setGeneralError(value ? value[0] : "");
        }
      });
    }
  }, [actionData, form, setGeneralError]);

  React.useEffect(() => {
    if (enableOTPFetcher.data) {
      setUrl(enableOTPFetcher.data.url);
      setSecret(enableOTPFetcher.data.secret);

      QRCode.toDataURL(enableOTPFetcher.data.url)
        .then((data) => setQRCode(data))
        .catch(() => setQRCode(undefined));
    }
  }, [enableOTPFetcher.data]);

  React.useEffect(() => {
    if (verifyOTPFetcher.data) {
      if ("success" in verifyOTPFetcher.data) {
        setEnableModalOpen(false);
      } else {
        Object.entries(verifyOTPFetcher.data).forEach(([, value]) => {
          setVerifyError(value ? value[0] : "");
        });
      }
    }
  }, [setVerifyError, verifyOTPFetcher.data]);

  React.useEffect(() => {
    if (disableOTPFetcher.data) {
      if ("success" in disableOTPFetcher.data) {
        setDisableModalOpen(false);
        setUrl(undefined);
        setSecret(undefined);
        setQRCode(undefined);
        enableFetcherCalled.current = false;
      } else {
        Object.entries(disableOTPFetcher.data).forEach(([, value]) => {
          setDisableError(value ? value[0] : "");
        });
      }
    }
  }, [disableOTPFetcher.data, setDisableError]);

  return (
    <>
      <h2 className="text-2xl font-bold">Security</h2>
      <p className="text-muted-foreground">Update your security settings.</p>
      <hr className="my-4" />

      <div className="my-4 space-y-2">
        <ShadcnForm {...form}>
          {generalError ? (
            <FormMessage aria-live="assertive">{generalError}</FormMessage>
          ) : null}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Change Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Password"
                      type="password"
                      required
                      aria-invalid={fieldState.invalid}
                      aria-describedby="password-error-message"
                    />
                  </FormControl>
                  <FormMessage
                    id="password-error-message"
                    aria-live="assertive"
                  />
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

      <div className="mt-8 space-y-2">
        <h3 className="font-semibold">Two Factor Authentication</h3>
        <p>
          Add an extra layer of security to your account by enabling two factor
          authentication - an entirely optional feature. If enabled you will be
          required to enter a variable code generated by an authenticator app
          each time you log in.
        </p>
        {user.otpEnabled ? (
          <AlertDialog
            open={disableModalOpen}
            onOpenChange={setDisableModalOpen}
          >
            <AlertDialogTrigger asChild>
              <Button>Disable 2FA</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Turn off Two-Factor Authentication?
                </AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="flex flex-col items-center justify-center sm:block sm:items-center sm:justify-start">
                    Turning off two factor authentication will reduce the
                    security of your account.
                    <br />
                    <br />
                    If you wish to continue, please enter a token from your
                    authenticator app below and click continue
                    <br />
                    <br />
                    {disableError ? (
                      <>
                        <p className="font-bold">{disableError}</p>
                        <br />
                      </>
                    ) : null}
                    <label htmlFor="token">One-Time Password</label>
                    <InputOTP
                      type="text"
                      name="token"
                      form="disableOtp"
                      maxLength={6}
                      render={({ slots }) => (
                        <InputOTPGroup>
                          {slots.map((slot, index) => (
                            <InputOTPSlot key={index} {...slot} />
                          ))}{" "}
                        </InputOTPGroup>
                      )}
                    />
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <verifyOTPFetcher.Form
                  id="disableOtp"
                  method="post"
                  action="/me/security/otp/disable"
                  className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md bg-primary text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                >
                  <Input type="hidden" name="csrf" value={csrf} />
                  <AlertDialogAction
                    type="submit"
                    onClick={(e) => {
                      e.preventDefault();

                      disableOTPFetcher.submit(e.currentTarget.form, {
                        method: "POST",
                      });
                    }}
                  >
                    Continue
                  </AlertDialogAction>
                </verifyOTPFetcher.Form>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <AlertDialog open={enableModalOpen} onOpenChange={setEnableModalOpen}>
            <AlertDialogTrigger asChild>
              <Button>Enable 2FA</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Enable Two Factor Authentication
                </AlertDialogTitle>
                <AlertDialogDescription asChild>
                  {qrCode && secret ? (
                    <div className="flex flex-col items-center justify-center sm:block sm:items-center sm:justify-start">
                      <strong>Step 1:</strong>
                      <br />
                      Use an authenticator app on your mobile device to scan
                      this QR code
                      <br className="hidden sm:block" />
                      <br />
                      <img src={qrCode} alt="qr-code" />
                      <br />
                      Or enter the following code into the app manually
                      <br />
                      <i>(use time-based if prompted)</i>
                      <br />
                      <br className="hidden sm:block" />
                      <strong>{secret.match(/.{1,4}/g)?.join("-")}</strong>
                      <br />
                      <br className="hidden sm:block" />
                      <strong>Step 2:</strong>
                      <br />
                      Enter the code given by the app on your mobile device
                      <br />
                      <br className="hidden sm:block" />
                      {verifyError ? (
                        <>
                          <p className="font-bold">{verifyError}</p>
                          <br />
                        </>
                      ) : null}
                      <label htmlFor="token">One-Time Password</label>
                      <InputOTP
                        type="text"
                        name="token"
                        form="verifyOtp"
                        maxLength={6}
                        render={({ slots }) => (
                          <InputOTPGroup>
                            {slots.map((slot, index) => (
                              <InputOTPSlot key={index} {...slot} />
                            ))}{" "}
                          </InputOTPGroup>
                        )}
                      />
                    </div>
                  ) : (
                    <p>
                      <strong>Getting things ready please wait...</strong>
                    </p>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <verifyOTPFetcher.Form
                  id="verifyOtp"
                  method="post"
                  action="/me/security/otp/verify"
                  className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md bg-primary text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                >
                  <Input type="hidden" name="csrf" value={csrf} />
                  <AlertDialogAction
                    className="sm:w-full"
                    type="submit"
                    onClick={(e) => {
                      e.preventDefault();

                      verifyOTPFetcher.submit(e.currentTarget.form, {
                        method: "POST",
                      });
                    }}
                  >
                    Verify & Activate
                  </AlertDialogAction>
                </verifyOTPFetcher.Form>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </>
  );
}

export { ErrorBoundary };
