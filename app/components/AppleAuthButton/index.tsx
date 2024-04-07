import React from "react";

import { useEnvironmentVariables } from "~/components/Providers/EnvironmentVariables";
import { useNonce } from "~/components/Providers/Nonce";

import { Scope } from "~/types/apple.types";

interface IProps {
  scope?: Scope;
  redirectURI: string;
  state?: string;
  usePopup?: boolean;
  color?: "black" | "white";
}

const AppleAuthButton: React.FC<IProps> = ({
  scope = "",
  redirectURI,
  state = "",
  usePopup = false,
  color = "white",
}) => {
  const nonce = useNonce();
  const { APPLE_OAUTH_CLIENT_ID } = useEnvironmentVariables();

  React.useEffect(() => {
    if (APPLE_OAUTH_CLIENT_ID) {
      window?.AppleID.auth.init({
        clientId: APPLE_OAUTH_CLIENT_ID,
        scope,
        redirectURI,
        state,
        nonce,
        usePopup,
      });
    }
  }, [APPLE_OAUTH_CLIENT_ID, nonce, redirectURI, scope, state, usePopup]);

  if (!APPLE_OAUTH_CLIENT_ID) {
    return null;
  }

  return (
    <div
      id="appleid-signin"
      data-color={color}
      data-border="true"
      data-type="sign in"
      className="h-[40px] w-full"
    ></div>
  );
};

AppleAuthButton.displayName = "Components:AppleAuthButton";
export default AppleAuthButton;
