import { Context, createContext, useContext, useMemo, useState } from 'react';
import { User } from '@/types/user';
import { getDecodedToken, setToken } from '@/util/token';

const exampleUser: User = {
  username: '',
  role: '',
  iat: 1,
  exp: 1,
};

export type UserContextType = {
  value: User;
  setValue: (token: string) => void;
};

const UserContext: Context<UserContextType> = createContext({
  value: exampleUser,
  setValue: (token: string) => {
  },
});

export function UserDataProvider({ children }: { children: React.ReactNode }) {
  const decodedToken = useMemo(() => getDecodedToken(), [getDecodedToken]);
  const [user, setUser] = useState(decodedToken ? decodedToken : exampleUser);

  const setUserWithToken = (token: string) => {
    setToken(token);
    const decodedToken = getDecodedToken();
    setUser(decodedToken ? decodedToken : exampleUser);
  };

  return <UserContext.Provider value={{ value: user, setValue: setUserWithToken }}>{children}</UserContext.Provider>;
}

export function useUserContext() {
  return useContext(UserContext);
}
