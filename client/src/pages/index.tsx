import React from "react";
import { useCookies } from "react-cookie";
import { Router } from "@reach/router";

import Login from "components/login";
import Home from "components/home";

/**
 * Redirect to login page if user is not authorized
 * Redirect to home page once logged in
 * TODO: Redirect to setup page if user's first time logging in
 */
function Index() {
  const [cookies] = useCookies(["accessToken"]);
  return (
    <Router basepath="/app">
      <Home default={cookies.accessToken} path="/" />
      <Login default={!cookies.accessToken} path="/login" />
    </Router>
  );
}

export default Index;
