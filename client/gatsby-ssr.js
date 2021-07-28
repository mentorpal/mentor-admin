import React from "react";
import { createTheme, MuiThemeProvider } from "@material-ui/core/styles";
import { Provider } from "react-redux";
import { store } from "store/store";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1b6a9c",
    },
  },
});

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const wrapRootElement = ({ element }) => (
  <MuiThemeProvider theme={theme}>
    <Provider store={store}>{element}</Provider>
  </MuiThemeProvider>
);
