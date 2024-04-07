import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  useActionData,
  useFetcher,
  useLoaderData,
  useSubmit,
} from "@remix-run/react";
import React, { useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Avatar, AvatarImage } from "~/components/ui/avatar";
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

import profileController from "~/controllers/profile.controller.server";

import { IError } from "~/errors";

import useFormLoading from "~/hooks/useFormLoading";
import useGeneralFormError from "~/hooks/useGeneralFormError";

import profileSchemas from "~/schemas/profile.schemas";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return await profileController.get(request);
};

export const action = async ({ request }: ActionFunctionArgs) => {
  return await profileController.update(request);
};

export default function MeProfile() {
  const { profile, csrf, avatar } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();
  const [generalError, setGeneralError] = useGeneralFormError();
  const loading = useFormLoading();

  const form = useForm<z.infer<typeof profileSchemas.update>>({
    resolver: zodResolver(profileSchemas.update),
    defaultValues: {
      firstName: profile.firstName ?? "",
      lastName: profile.lastName ?? "",
    },
  });

  const updateAvatarInputRef = useRef<HTMLInputElement>(null);
  const updateAvatarFetcher = useFetcher<{ avatar: string } | IError>({
    key: "avatar-upload",
  });
  const [uploadError, setUploadError] = useGeneralFormError();

  const deleteAvatarFetcher = useFetcher<{ avatar: string } | IError>({
    key: "avatar-delete",
  });
  const [deleteError, setDeleteError] = useGeneralFormError();

  const onSubmit = (values: z.infer<typeof profileSchemas.update>) => {
    const formData = new FormData();
    formData.append("csrf", csrf);

    Object.entries(values).forEach(([key, value]) => {
      if (value !== null && value !== "") {
        formData.append(key, value);
      }
    });

    submit(formData, { method: "POST" });
  };

  const onEditAvatar = () => {
    if (updateAvatarInputRef.current) {
      updateAvatarInputRef.current.click();
    }
  };

  const onDeleteAvatar = () => {
    if (avatar) {
      const formData = new FormData();
      formData.append("csrf", csrf);

      deleteAvatarFetcher.submit(formData, {
        method: "DELETE",
        action: "/me/profile/avatar",
      });
    }
  };

  React.useEffect(() => {
    if (actionData) {
      Object.entries(actionData).forEach(([key, value]) => {
        if (key === "firstName") {
          form.setError("firstName", { message: value ? value[0] : "" });
        } else if (key === "lastName") {
          form.setError("lastName", { message: value ? value[0] : "" });
        } else {
          setGeneralError(value ? value[0] : "");
        }
      });
    }
  }, [actionData, form, setGeneralError]);

  React.useEffect(() => {
    if (updateAvatarFetcher.data) {
      if (!("avatar" in updateAvatarFetcher.data)) {
        Object.entries(updateAvatarFetcher.data).forEach(([, value]) => {
          setUploadError(value ? value[0] : "");
        });
      } else {
        setUploadError("");
      }
    }
  }, [setUploadError, updateAvatarFetcher.data]);

  React.useEffect(() => {
    if (deleteAvatarFetcher.data) {
      if (!("avatar" in deleteAvatarFetcher.data)) {
        Object.entries(deleteAvatarFetcher.data).forEach(([, value]) => {
          setDeleteError(value ? value[0] : "");
        });
      } else {
        setDeleteError("");
      }
    }
  }, [setDeleteError, deleteAvatarFetcher.data]);

  return (
    <>
      <h2 className="text-2xl font-bold">Profile</h2>
      <p className="text-muted-foreground">
        This is how others will see you on the site.
      </p>
      <hr className="my-4" />

      <updateAvatarFetcher.Form
        method="post"
        action="/me/profile/avatar"
        encType="multipart/form-data"
      >
        <Input type="hidden" name="csrf" value={csrf} />
        <Input
          ref={updateAvatarInputRef}
          type="file"
          name="avatar"
          id="avatar"
          className="hidden"
          onChange={(e) => {
            e.preventDefault();
            updateAvatarFetcher.submit(e.currentTarget.form);
          }}
        />
      </updateAvatarFetcher.Form>

      <span className="text-sm font-semibold">Avatar</span>
      {uploadError || deleteError ? (
        <>
          <br />
          <span className="text-sm font-bold text-red-500">
            {uploadError || deleteError}
          </span>
        </>
      ) : null}
      <div className="relative my-4 w-fit space-y-2">
        <Avatar className="h-20 w-20  ">
          <AvatarImage src={avatar ?? "/icons/user.png"} />
        </Avatar>
        <button
          className="absolute right-2 top-2/3 rounded-full bg-primary p-1"
          onClick={onEditAvatar}
        >
          <Pencil1Icon className="text-white" />
        </button>
        <button
          className="absolute -right-3 top-1/4 rounded-full bg-red-500 p-1"
          onClick={onDeleteAvatar}
        >
          <TrashIcon className="text-white" />
        </button>
      </div>

      <div className="my-4 mt-8 space-y-2">
        <Form {...form}>
          {generalError ? (
            <FormMessage aria-live="assertive">{generalError}</FormMessage>
          ) : null}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="First Name"
                      type="text"
                      aria-invalid={fieldState.invalid}
                      aria-describedby="firstName-error-message"
                    />
                  </FormControl>
                  <FormMessage
                    id="firstName-error-message"
                    aria-live="assertive"
                  />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Surname</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="Surname"
                      type="text"
                      aria-invalid={fieldState.invalid}
                      aria-describedby="surname-error-message"
                    />
                  </FormControl>
                  <FormMessage
                    id="surname-error-message"
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
        </Form>
      </div>
    </>
  );
}
