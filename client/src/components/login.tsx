/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import {
  GoogleLogin,
  GoogleLoginResponse,
  GoogleLoginResponseOffline,
} from "react-google-login";
import {
  AppBar,
  Button,
  CircularProgress,
  Toolbar,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import { useWithConfig } from "store/slices/config/useWithConfig";
import { ConfigStatus } from "store/slices/config/configSlice";
import { useWithLogin } from "store/slices/login/useWithLogin";

const useStyles = makeStyles((theme) => ({
  toolbar: theme.mixins.toolbar,
  root: {
    display: "flex",
    flexFlow: "column",
    textAlign: "center",
    alignContent: "center",
    alignItems: "center",
  },
  title: {
    margin: 25,
  },
  button: {
    margin: theme.spacing(1),
    width: 300,
  },
}));

function LoginPage(): JSX.Element {
  const classes = useStyles();
  const { state: configState, loadConfig } = useWithConfig();
  const { loginWithGoogle, login } = useWithLogin();

  function onGoogleLogin(
    response: GoogleLoginResponse | GoogleLoginResponseOffline
  ): void {
    if ((response as GoogleLoginResponseOffline).code !== undefined) {
      return;
    }
    const loginResponse = response as GoogleLoginResponse;
    loginWithGoogle(loginResponse.accessToken);
  }

  if (
    configState.status === ConfigStatus.NONE ||
    configState.status === ConfigStatus.IN_PROGRESS
  ) {
    // app never shows any component until config is loaded
    return <CircularProgress />;
  }
  if (!configState.config || configState.status === ConfigStatus.FAILED) {
    // displays some error with retry option if config fails to load
    return (
      <div>
        <AppBar position="fixed">
          <Toolbar>
            <Typography variant="h6">Mentor Studio</Typography>
          </Toolbar>
        </AppBar>
        <Typography>Failed to load config</Typography>
        <Button color="primary" variant="contained" onClick={loadConfig}>
          Retry
        </Button>
      </div>
    );
  }
  return (
    <div className={classes.root}>
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6">Mentor Studio</Typography>
        </Toolbar>
      </AppBar>
      <div className={classes.toolbar} /> {/* create space below app bar */}
      <Typography variant="h5" className={classes.title}>
        Please sign in to access the Mentor Studio portal
      </Typography>
      {process.env.ACCESS_TOKEN ? (
        <Button
          variant="contained"
          color="primary"
          className={classes.button}
          onClick={() => login(process.env.ACCESS_TOKEN || "")}
          data-cy="login-btn"
        >
          Test Login
        </Button>
      ) : (
        <GoogleLogin
          clientId={configState.config.googleClientId}
          onSuccess={onGoogleLogin}
          render={(renderProps) => (
            <Button
              variant="contained"
              color="primary"
              onClick={renderProps.onClick}
              className={classes.button}
              disabled={renderProps.disabled}
              data-cy="login-btn"
            >
              Sign in with Google
            </Button>
          )}
        />
      )}
    </div>
  );
}

export default LoginPage;
