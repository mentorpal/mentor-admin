import React from "react";
import { withPrefix } from "gatsby";
import { useCookies } from "react-cookie";
import { Router } from "@reach/router";

import Login from "components/login";
import Home from "components/home";
import PrivateRoute from "components/private-route";

/**
 * Redirect to login page if user is not authorized
 * Redirect to home page once logged in
 * TODO: Redirect to setup page if user's first time logging in
 */
function Index(): JSX.Element {
  const [cookies] = useCookies(["accessToken"]);
  return (
    <Router basepath={withPrefix("/app")}>
      <PrivateRoute default={cookies.accessToken} path="/" component={Home} />
      <Login default={!cookies.accessToken} path="/login" />
    </Router>
  );
}

export default Index;
