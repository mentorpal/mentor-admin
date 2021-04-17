/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import * as api from "api";
import { LoginStatus, User } from "types";

const ACCESS_TOKEN_KEY = "accessToken";

export function accessTokenGet(): string {
  if (typeof window === "undefined") {
    return "";
  }
  return localStorage.getItem(ACCESS_TOKEN_KEY) || "";
}

export function accessTokenStore(accessToken: string): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
}

export function accessTokenClear(): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export interface ContextState {
  accessToken: string;
  loginStatus: LoginStatus;
  user: User | undefined;
}

type ContextType = ContextState & {
  login: (accessToken: string) => void;
  logout: () => void;
};

const CONTEXT_STATE_DEFAULT = {
  user: undefined,
  accessToken: "",
  loginStatus: LoginStatus.NONE,
};

const Context = React.createContext<ContextType>({
  ...CONTEXT_STATE_DEFAULT,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  login: (accessToken: string): Promise<void> => {
    throw new Error("Not implemented");
  },
  logout: () => {
    throw new Error("Not implemented");
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Provider(props: { children: any }): JSX.Element {
  const [contextState, setContextState] = React.useState<ContextState>(
    CONTEXT_STATE_DEFAULT
  );

  function logout(): void {
    accessTokenClear();
    setContextState(CONTEXT_STATE_DEFAULT);
  }

  async function login(accessToken: string): Promise<void> {
    try {
      accessTokenStore(accessToken);
      setContextState({
        ...contextState,
        loginStatus: LoginStatus.IN_PROGRESS,
      });
      const token = await api.login(accessToken);
      if (token?.accessToken) {
        accessTokenStore(token.accessToken);
      }
      setContextState({
        ...contextState,
        user: token.user,
        accessToken: token.accessToken,
        loginStatus:
          token.user && token.accessToken
            ? LoginStatus.AUTHENTICATED
            : LoginStatus.FAILED,
      });
    } catch (err) {
      console.error(err);
      accessTokenClear();
      setContextState({
        ...contextState,
        loginStatus: LoginStatus.FAILED,
      });
    }
  }

  React.useEffect(() => {
    const accessToken = accessTokenGet();
    if (!accessToken) {
      return;
    }
    if (contextState.loginStatus == LoginStatus.NONE) {
      login(accessToken).catch((err) => console.error(err));
    }
  }, [contextState]);

  return (
    <Context.Provider
      value={{
        ...contextState,
        login,
        logout,
      }}
    >
      {props.children}
    </Context.Provider>
  );
}

export default Context;
export { Provider };
