import React, { useEffect, useState } from "react";
import {
  createTheme,
  ThemeProvider,
  StyledEngineProvider,
} from "@mui/material/styles";
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
import { useAppSelector } from "store/hooks";
import { NotificationDialog } from "components/dialog";

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
  spacing: 8,
});

const allowedAdminDomains = [
  "newdev.mentorpal.org",
  "v2.mentorpal.org",
  "careerfair.mentorpal.org",
  "devmentorpal.org",
  "qamentorpal.org",
  "mentorpal.org",
];

const WarnFailedUpload = ({ children }) => {
  const [userClosed, setUserClosed] = useState(false);
  const fileFailed = useAppSelector((state) => state.uploads.warnFailedUpload);

  return (
    <>
      {children}
      <NotificationDialog
        title={
          "One or more of your uploads have failed to upload, please review the upload queue and download your failed videos for safekeeping."
        }
        open={fileFailed && !userClosed}
        closeDialog={() => {
          setUserClosed(true);
        }}
      />
    </>
  );
};

const WarnExitPageDuringUpload = ({ children }) => {
  const [displayLeavingDialog, setDisplayLeavingDialog] = useState(false);
  const uploadsInitializing = useAppSelector(
    (state) => state.uploads.uploadsInitializing
  );
  window.onload = function () {
    initBeforeUnLoad(uploadsInitializing.length > 0);
  };

  useEffect(() => {
    initBeforeUnLoad(uploadsInitializing.length > 0);
  }, [uploadsInitializing]);

  const initBeforeUnLoad = (showExitPrompt) => {
    window.onbeforeunload = (event) => {
      // Show prompt based on state
      if (showExitPrompt) {
        setDisplayLeavingDialog(true);
        const e = event || window.event;
        e.preventDefault();
        if (e) {
          e.returnValue = "";
        }
        return "";
      }
    };
  };

  return (
    <>
      {children}
      <NotificationDialog
        title={
          uploadsInitializing.length > 0
            ? `You have ${uploadsInitializing.length} uploads initializing, please wait for their intializations to complete before closing this browser...`
            : "You may now safely close this browser."
        }
        open={displayLeavingDialog}
        closeDialog={() => {
          setDisplayLeavingDialog(false);
        }}
      />
    </>
  );
};

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
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <WarnExitPageDuringUpload>
            <WarnFailedUpload>{element}</WarnFailedUpload>
          </WarnExitPageDuringUpload>
        </Provider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const wrapRootElement = ({ element }) => {
  return <App element={element} />;
};
