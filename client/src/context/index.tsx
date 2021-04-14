/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import { useCookies } from "react-cookie";
import { login } from "api";
import { User, UserAccessToken } from "types";

type ContextType = {
  user: User | undefined;
};

const Context = React.createContext<ContextType>({
  user: undefined,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Provider(props: { children: any }): JSX.Element {
  const [cookies, setCookie, removeCookie] = useCookies(["accessToken"]);
  const [user, setUser] = React.useState<User>();

  React.useEffect(() => {
    if (!cookies.accessToken) {
      setUser(undefined);
    } else if (!user) {
      login(cookies.accessToken)
        .then((token: UserAccessToken) => {
          setUser(token.user);
          setCookie("accessToken", token.accessToken, { path: "/" });
        })
        .catch((err) => {
          console.error(err);
          removeCookie("accessToken", { path: "/" });
        });
    }
  }, [cookies]);

  return <Context.Provider value={{ user }}>{props.children}</Context.Provider>;
}

export default Context;
export { Provider };
