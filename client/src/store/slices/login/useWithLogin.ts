/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAppSelector } from "store/hooks";
import * as loginActions from "./actions";
import * as loginState from ".";

interface UseWithLogin {
  state: loginState.LoginState;
  login: (accessToken: string) => void;
  loginWithGoogle: (googleAccessToken: string) => void;
  logout: () => void;
}

export function useWithLogin(): UseWithLogin {
  const dispatch = useDispatch();
  const state = useAppSelector((state) => state.login);

  useEffect(() => {
    if (state.accessToken) {
      return;
    }
    const accessToken = loginActions.accessTokenGet();
    if (accessToken) {
      login(accessToken);
    } else {
      dispatch(loginActions.logout());
    }
  }, []);

  function login(accessToken: string) {
    if (
      state.loginStatus === loginState.LoginStatus.NONE ||
      state.loginStatus === loginState.LoginStatus.NOT_LOGGED_IN ||
      state.loginStatus === loginState.LoginStatus.FAILED
    ) {
      dispatch(loginActions.login(accessToken));
    }
  }

  function loginWithGoogle(googleAccessToken: string) {
    if (
      state.loginStatus === loginState.LoginStatus.NONE ||
      state.loginStatus === loginState.LoginStatus.NOT_LOGGED_IN ||
      state.loginStatus === loginState.LoginStatus.FAILED
    ) {
      dispatch(loginActions.googleLogin(googleAccessToken));
    }
  }

  function logout() {
    if (state.loginStatus === loginState.LoginStatus.AUTHENTICATED) {
      dispatch(loginActions.logout());
    }
  }

  return {
    state,
    login,
    loginWithGoogle,
    logout,
  };
}
