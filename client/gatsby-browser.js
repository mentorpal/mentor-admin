import React from "react";
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core/styles";
import { Provider } from "./src/context";

import "video.js/dist/video-js.css";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import videojs from "video.js";
import "webrtc-adapter";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import RecordRTC from "recordrtc";
import "videojs-record/dist/css/videojs.record.css";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Record from "videojs-record/dist/videojs.record.js";

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#1b6a9c",
    },
  },
});

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const wrapRootElement = ({ element }) => (
  <MuiThemeProvider theme={theme}>
    <Provider>{element}</Provider>
  </MuiThemeProvider>
);
