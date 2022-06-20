/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "store/hooks";
import { ACCESS_TOKEN_KEY, localStorageGet } from "store/local-storage";
import * as loginActions from ".";

interface UseWithLogin {
  state: loginActions.LoginState;
  login: (accessToken: string) => void;
  userSawSplashScreen: (myMentorSplash: string) => void;
  loginWithGoogle: (googleAccessToken: string) => void;
  logout: () => void;
}

// Gives you a way to interface with the redux store (which has the user information)
export function useWithLogin(): UseWithLogin {
  const dispatch = useAppDispatch();
  const state = useAppSelector((state) => state.login);

  useEffect(() => {
    if (state.accessToken) {
      return;
    }
    const accessToken = localStorageGet(ACCESS_TOKEN_KEY);
    if (accessToken) {
      login(accessToken);
    } else {
      dispatch(loginActions.logout());
    }
  }, []);

  function login(accessToken: string) {
    if (
      state.loginStatus === loginActions.LoginStatus.NONE ||
      state.loginStatus === loginActions.LoginStatus.NOT_LOGGED_IN ||
      state.loginStatus === loginActions.LoginStatus.FAILED
    ) {
      dispatch(loginActions.login(accessToken));
    }
  }

  function loginWithGoogle(googleAccessToken: string) {
    if (
      state.loginStatus === loginActions.LoginStatus.NONE ||
      state.loginStatus === loginActions.LoginStatus.NOT_LOGGED_IN ||
      state.loginStatus === loginActions.LoginStatus.FAILED
    ) {
      dispatch(loginActions.googleLogin(googleAccessToken));
    }
  }

  // Call this function when user clicks close on the dialog
  function userSawSplashScreen(firstTimeTracking: string) {
    // Dispatch userSawSplashScreen action here
    dispatch(loginActions.userSawSplashScreen(firstTimeTracking));
  }

  function logout() {
    if (state.loginStatus === loginActions.LoginStatus.AUTHENTICATED) {
      dispatch(loginActions.logout());
    }
  }

  return {
    state,
    login,
    loginWithGoogle,
    userSawSplashScreen,
    logout,
  };
}
