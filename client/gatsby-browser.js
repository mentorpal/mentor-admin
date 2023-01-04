import React, { useEffect } from "react";
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

if (process.env.IS_SENTRY_ENABLED === "true") {
  console.log("Loading sentry");
  loadSentry();
}

const theme = createTheme({
  palette: {
    primary: {
      main: "#1b6a9c",
    },
  },
});

const allowedAdminDomains = [
  "newdev.mentorpal.org",
  "v2.mentorpal.org",
  "careerfair.mentorpal.org",
  "devmentorpal.org",
  "qamentorpal.org",
  "mentorpal.org",
];
const App = ({ element }) => {
  useEffect(() => {
    const host = location.hostname;
    if (!allowedAdminDomains.includes(host)) {
      if (host.endsWith("devmentorpal.org")) {
        window.location.hostname = `devmentorpal.org`;
      } else if (host.endsWith("qamentorpal.org")) {
        window.location.hostname = `qamentorpal.org`;
      } else if (host.endsWith("mentorpal.org")) {
        window.location.hostname = `mentorpal.org`;
      }
    }
  }, []);
  return (
    <MuiThemeProvider theme={theme}>
      <Provider store={store}>{element}</Provider>
    </MuiThemeProvider>
  );
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const wrapRootElement = ({ element }) => <App element={element} />;
