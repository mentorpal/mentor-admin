import React, { useContext } from "react";
import { Router } from "@reach/router";

import Login from "components/login";
import Home from "components/home";
import Context from "context";

/**
 * Redirect to login page if user is not authorized
 * Redirect to home page once logged in
 * TODO: Redirect to setup page if user's first time logging in
 */
function Index() {
  const context = useContext(Context);
  return (
    <Router basepath="/app">
      <Home default={context.user} path="/" />
      <Login default={!context.user} path="/login" />
    </Router>
  );
}

export default Index;
