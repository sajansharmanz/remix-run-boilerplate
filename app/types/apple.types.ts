export type Scope = "" | "name" | "email" | "name email";

interface ClientConfig {
  clientId: string;
  redirectURI: string;
  scope: Scope;
  state: string;
  nonce: string;
  usePopup: boolean;
}

interface Name {
  firstName: string;
  lastName: string;
}

interface User {
  email: string;
  name: Name;
}

interface Authorization {
  code: string;
  id_token: string;
  state: string;
}

interface SignInResponse {
  user: User;
  authorization: Authorization;
}

interface SignInError {
  error: string;
}

declare global {
  interface Window {
    AppleID: {
      auth: {
        init: (config: ClientConfig) => void;
        signIn: (
          config?: ClientConfig,
        ) => Promise<SignInResponse | SignInError>;
        renderButton: () => void;
      };
    };
  }
}
