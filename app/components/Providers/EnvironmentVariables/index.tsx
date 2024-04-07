import React from "react";

interface Context {
  APP_NAME?: string;
  GOOGLE_OAUTH_CLIENT_ID?: string;
  APPLE_OAUTH_CLIENT_ID?: string;
}

const EnvironmentVariablesContext = React.createContext<Context>({
  APP_NAME: "",
  GOOGLE_OAUTH_CLIENT_ID: "",
  APPLE_OAUTH_CLIENT_ID: "",
});

interface IProps {
  variables: Context;
  children: React.ReactNode;
}

const EnvironmentVariablesProvider: React.FC<IProps> = ({
  variables,
  children,
}) => {
  return (
    <EnvironmentVariablesContext.Provider value={variables}>
      {children}
    </EnvironmentVariablesContext.Provider>
  );
};

export const useEnvironmentVariables = () =>
  React.useContext(EnvironmentVariablesContext);

EnvironmentVariablesProvider.displayName =
  "Components:Providers:EnvironmentVariablesProvider";

export default EnvironmentVariablesProvider;
