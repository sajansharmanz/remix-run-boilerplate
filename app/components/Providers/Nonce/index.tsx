import * as React from "react";

const NonceContext = React.createContext<string>("");

const NonceProvider: React.FC<{ children: React.ReactNode; nonce: string }> = ({
  children,
  nonce,
}) => {
  return (
    <NonceContext.Provider value={nonce}>{children}</NonceContext.Provider>
  );
};

export const useNonce = () => React.useContext(NonceContext);

export default NonceProvider;
