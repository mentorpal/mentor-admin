/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";

import LoginPage from "components/login";
import HomePage from "components/home";
import { useWithLogin } from "store/slices/login/useWithLogin";
import { LoginStatus } from "store/slices/login";

import { useGoogleLogin } from "@react-oauth/google";

/**
 * Separate functional component in order for useGoogleLogin to be nested under GoogleOAuthProvider (This provider did not want to work in gatsby-browser, bug reported by others)
 */
function PrimaryDisplayHolder(): JSX.Element {
  const { state: loginState, loginWithGoogle } = useWithLogin();
  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      loginWithGoogle(tokenResponse.access_token);
    },
  });
  if (loginState.loginStatus === LoginStatus.AUTHENTICATED) {
    return <HomePage />;
  } else {
    return <LoginPage onGoogleLogin={login} />;
  }
}

function IndexPage(): JSX.Element {
  return <PrimaryDisplayHolder />;
}

export default IndexPage;
