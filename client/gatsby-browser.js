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
    !window.location.protocol.toLowerCase().startsWith("https") &&
    !window.location.hostname.toLowerCase() === "localhost"
  ) {
    const redirect = `https://${window.location.host}${window.location.pathname}${window.location.search}`;
    window.location.href = redirect;
  }
};
