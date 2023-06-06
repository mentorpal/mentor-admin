/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { navigate } from "gatsby";
import React from "react";
import { CircularProgress, Typography } from "@mui/material";

import NavBar from "components/nav-bar";
import { useWithLogin } from "store/slices/login/useWithLogin";
import { LoginStatus } from "store/slices/login";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const withAuthorizationOnly = (Component) => (props) => {
  const { state: loginState } = useWithLogin();
  if (loginState.isDisabled) {
    return (
      <div>
        <Typography>
          Your account has been disabled by an administrator. You may no longer
          login to use this system.
        </Typography>
        <Typography>
          If you believe this has been a mistake, please contact support at
          ictlearningsciencesacts+mentorpal@gmail.com
        </Typography>
      </div>
    );
  }
  if (
    loginState.loginStatus === LoginStatus.NONE ||
    loginState.loginStatus === LoginStatus.IN_PROGRESS
  ) {
    return (
      <div>
        <NavBar title="Mentor Studio" />
        <CircularProgress />
      </div>
    );
  }
  if (
    loginState.loginStatus === LoginStatus.NOT_LOGGED_IN &&
    !loginState.accessToken
  ) {
    if (typeof window !== "undefined") {
      navigate("/");
    }
    return <div />;
  }
  return loginState.loginStatus === LoginStatus.AUTHENTICATED ? (
    <Component
      {...props}
      accessToken={loginState.accessToken}
      user={loginState.user}
    />
  ) : (
    <div>
      <NavBar title="Mentor Studio" />
      <CircularProgress />
    </div>
  );
};

export default withAuthorizationOnly;
