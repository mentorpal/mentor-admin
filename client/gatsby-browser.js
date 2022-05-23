import React from "react";
import { createTheme, MuiThemeProvider } from "@material-ui/core/styles";
import { Provider } from "react-redux";
import { store } from "store/store";

import "video.js/dist/video-js.css";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import videojs from "video.js";
import "webrtc-adapter";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import RecordRTC from "recordrtc";
import "videojs-record/dist/css/videojs.record.css";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Record from "videojs-record/dist/videojs.record.js";
import "styles/layout.css";
import { loadSentry } from "./src/helpers";

loadSentry();

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
