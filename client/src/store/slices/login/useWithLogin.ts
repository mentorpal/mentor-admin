/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "store/hooks";
import { ACCESS_TOKEN_KEY, localStorageGet } from "store/local-storage";
import * as loginActions from ".";
import { LoginType } from "types";
import {
  OAuthProvider,
  getAuth,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyBU6GZrVegxgpTefmG0gKS4T87lbTRBPWA", // NOT a secret, does NOT grant access to anything, just helps identify the project
  authDomain: "mentorpal.firebaseapp.com",
  projectId: "mentorpal",
  storageBucket: "mentorpal.appspot.com",
  messagingSenderId: "74006070443",
  appId: "1:74006070443:web:deff11e732e0ae05fc63ee",
  measurementId: "G-PLBFTQJFFD",
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

interface UseWithLogin {
  state: loginActions.LoginState;
  login: (accessToken: string) => void;
  userSawSplashScreen: (accessToken: string) => void;
  userSawTooltips: (accessToken: string) => void;
  loginWithGoogle: (
    googleAccessToken: string,
    signupCode?: string,
    loginType?: LoginType
  ) => void;
  logout: () => void;
  firebasePopupLogin: (signupCode?: string, loginType?: LoginType) => void;
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

  function loginWithGoogle(
    googleAccessToken: string,
    signupCode?: string,
    loginType?: LoginType
  ) {
    if (
      state.loginStatus === loginActions.LoginStatus.NONE ||
      state.loginStatus === loginActions.LoginStatus.NOT_LOGGED_IN ||
      state.loginStatus === loginActions.LoginStatus.FAILED
    ) {
      dispatch(
        loginActions.googleLogin({
          accessToken: googleAccessToken,
          signupCode,
          loginType,
        })
      );
    }
  }

  function firebasePopupLogin(signupCode?: string, loginType?: LoginType) {
    const provider = new OAuthProvider("microsoft.com");
    provider.addScope("User.Read");
    signInWithPopup(auth, provider).then(async (result) => {
      const userToken = await result.user.getIdToken();
      if (!userToken) {
        throw new Error("No userToken");
      }
      loginWithFirebase(userToken, signupCode, loginType);
    });
  }

  function loginWithFirebase(
    firebaseAccessToken: string,
    signupCode?: string,
    loginType?: LoginType
  ) {
    if (
      state.loginStatus === loginActions.LoginStatus.NONE ||
      state.loginStatus === loginActions.LoginStatus.NOT_LOGGED_IN ||
      state.loginStatus === loginActions.LoginStatus.FAILED
    ) {
      dispatch(
        loginActions.firebaseLogin({
          signupCode,
          loginType,
          accessToken: firebaseAccessToken,
        })
      );
    }
  }

  // Call this function when user clicks close on the dialog
  function userSawSplashScreen(accessToken: string) {
    // Dispatch userSawSplashScreen action here
    dispatch(loginActions.userSawSplashScreen(accessToken));
  }

  function userSawTooltips(accessToken: string) {
    // Dispatch userSawTooltips action here
    dispatch(loginActions.userSawTooltips(accessToken));
  }

  function logout() {
    if (state.loginStatus === loginActions.LoginStatus.AUTHENTICATED) {
      dispatch(loginActions.logout());
      signOut(auth);
    }
  }

  return {
    state,
    login,
    loginWithGoogle,
    firebasePopupLogin,
    userSawSplashScreen,
    userSawTooltips,
    logout,
  };
}
