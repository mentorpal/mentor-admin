import React from "react";
import { createTheme, MuiThemeProvider } from "@material-ui/core/styles";
import { Provider } from "react-redux";
import { store } from "store/store";
import { useWithLogin } from "store/slices/login/useWithLogin";

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

const theme = createTheme({
  palette: {
    primary: {
      main: "#1b6a9c",
    },
  },
});

const App = ({ element }) => {
  const useLogin = useWithLogin();
  return element;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const wrapRootElement = ({ element }) => (
  <MuiThemeProvider theme={theme}>
    <Provider store={store}>
      <App element={element} />
    </Provider>
  </MuiThemeProvider>
);
