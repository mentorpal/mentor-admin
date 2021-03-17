import React from "react";
import { CookiesProvider } from "react-cookie";
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core/styles";
import { Provider } from "./src/context";

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#1b6a9c",
    },
  },
});

export const wrapRootElement = ({ element }) => (
  <MuiThemeProvider theme={theme}>
    <CookiesProvider>
      <Provider>{element}</Provider>
    </CookiesProvider>
  </MuiThemeProvider>
);

export const onRouteUpdate = ({ location, prevLocation }) => {
  if (
    typeof window !== "undefined" &&
    !window.location.protocol.toLowerCase().startsWith("https")
  ) {
    const port = window.location.port ? `:${window.location.port}` : "";
    const redirect = `https://${window.location.hostname}${port}${window.location.pathname}${window.location.search}`;
    console.log(redirect);
    window.location.href = redirect;
  }
};
