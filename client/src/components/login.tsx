/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useContext } from "react";
import {
  GoogleLogin,
  GoogleLoginResponse,
  GoogleLoginResponseOffline,
} from "react-google-login";
import { AppBar, Button, Toolbar, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { getClientID } from "config";
import { loginGoogle } from "api";
import { UserAccessToken } from "types";
import "styles/layout.css";
import Context from "context";

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
  const context = useContext(Context);
  const [googleClientId, setClientId] = React.useState<string>("");

  React.useEffect(() => {
    let mounted = true;
    getClientID()
      .then((id: string) => {
        if (!mounted) {
          return;
        }
        setClientId(id);
      })
      .catch((err) => console.error(err));
    return () => {
      mounted = false;
    };
  }, []);

  const onGoogleLogin = (
    response: GoogleLoginResponse | GoogleLoginResponseOffline
  ): void => {
    if ((response as GoogleLoginResponseOffline).code !== undefined) {
      return;
    }
    const loginResponse = response as GoogleLoginResponse;
    loginGoogle(loginResponse.accessToken)
      .then((token: UserAccessToken) => {
        context.login(token.accessToken);
      })
      .catch((err) => console.error(err));
  };

  if (!googleClientId) {
    return <div className={classes.root}>ERROR: Failed to load config</div>;
  }

  return (
    <div className={classes.root}>
      <AppBar position="fixed">
        <Toolbar>
          <Typography id="title" variant="h6">
            Mentor Studio
          </Typography>
        </Toolbar>
      </AppBar>
      <div className={classes.toolbar} /> {/* create space below app bar */}
      <Typography variant="h5" className={classes.title}>
        Please sign in to access the Mentor Studio portal
      </Typography>
      {process.env.ACCESS_TOKEN ? (
        <Button
          id="login-button"
          variant="contained"
          color="primary"
          className={classes.button}
          onClick={() => context.login(process.env.ACCESS_TOKEN || "")}
        >
          Test Login
        </Button>
      ) : (
        <GoogleLogin
          clientId={googleClientId}
          onSuccess={onGoogleLogin}
          // cookiePolicy={"single_host_origin"}
          render={(renderProps) => (
            <Button
              id="login-button"
              variant="contained"
              color="primary"
              onClick={renderProps.onClick}
              className={classes.button}
              disabled={renderProps.disabled}
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
