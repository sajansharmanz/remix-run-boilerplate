import React, { createContext } from "react";

import { UserResponseBody } from "~/types/user.types";

interface Context {
  user: UserResponseBody | null;
  avatar: string | null;
}

const UserContext = createContext<Context>({ user: null, avatar: null });

interface Props {
  user: UserResponseBody | null;
  avatar: string | null;
  children: React.ReactNode;
}

const UserProvider: React.FC<Props> = ({ children, user, avatar }) => {
  return (
    <UserContext.Provider value={{ user: user?.email ? user : null, avatar }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => React.useContext(UserContext);

UserProvider.displayName = "Components:Providers:UserProvider";

export default UserProvider;
