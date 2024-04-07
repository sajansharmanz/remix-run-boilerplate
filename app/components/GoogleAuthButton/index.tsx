import { GoogleLogin } from "@react-oauth/google";
import { useFetcher } from "@remix-run/react";
import React from "react";

import { IError } from "~/errors";

interface IProps {
  csrf: string;
  setError: React.Dispatch<React.SetStateAction<string>>;
}

const GoogleAuthButton: React.FC<IProps> = ({ csrf, setError }) => {
  const fetcher = useFetcher<IError>();

  React.useEffect(() => {
    if (fetcher.data) {
      Object.entries(fetcher.data).forEach(([, value]) =>
        setError(value ? value[0] : ""),
      );
    }
  }, [fetcher.data, setError]);

  return (
    <GoogleLogin
      onSuccess={(credentialResponse) => {
        const formData = new FormData();
        formData.append("csrf", csrf);
        formData.append("credential", credentialResponse.credential ?? "");

        fetcher.submit(formData, { method: "POST", action: "/login/google" });
      }}
      onError={() => setError("Authentication error")}
      useOneTap
    />
  );
};

GoogleAuthButton.displayName = "Components:GoogleAuthButton";

export default GoogleAuthButton;
