/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { navigate } from "gatsby";
import React, { useContext } from "react";
import { useCookies } from "react-cookie";
import {
  GoogleLogin,
  GoogleLoginResponse,
  GoogleLoginResponseOffline,
} from "react-google-login";
import { Button, CircularProgress, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import NavBar from "components/nav-bar";
import Context from "context";
import { getClientID } from "config";
import { loginGoogle } from "api";
import { UserAccessToken } from "types";
import "styles/layout.css";

const useStyles = makeStyles((theme) => ({
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
  const [cookies, setCookie] = useCookies(["accessToken"]);
  const [googleClientId, setClientId] = React.useState<string>("");

  React.useEffect(() => {
    getClientID().then((id: string) => {
      setClientId(id);
    });
    // USED FOR TEST PURPOSES ONLY
    if (process.env.ACCESS_TOKEN) {
      setCookie("accessToken", process.env.ACCESS_TOKEN, { path: "/" });
    }
  }, []);

  React.useEffect(() => {
    if (context.user) {
      /**
       * TODO:
       * - only go to setup if still things to set up
       * - otherwise, go to home page
       */
      navigate("/setup");
    }
  }, [context.user]);

  const onGoogleLogin = (
    response: GoogleLoginResponse | GoogleLoginResponseOffline
  ): void => {
    if ((response as GoogleLoginResponseOffline).code !== undefined) {
      return;
    }
    const loginResponse = response as GoogleLoginResponse;
    loginGoogle(loginResponse.accessToken).then((token: UserAccessToken) => {
      setCookie("accessToken", token.accessToken, { path: "/" });
    });
  };

  if (cookies.accessToken) {
    return (
      <div className={classes.root}>
        <NavBar title="Mentor Studio" />
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <NavBar title="Mentor Studio" />
      <Typography variant="h5" className={classes.title}>
        Please sign in to access the Mentor Studio portal
      </Typography>
      {googleClientId ? (
        <GoogleLogin
          clientId={googleClientId}
          onSuccess={onGoogleLogin}
          cookiePolicy={"single_host_origin"}
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
      ) : (
        <Button
          id="login-button"
          variant="contained"
          color="primary"
          disabled={true}
          className={classes.button}
        >
          Sign in
        </Button>
      )}
    </div>
  );
}

export default LoginPage;
