/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import {
  createTheme,
  ThemeProvider,
  StyledEngineProvider,
} from "@mui/material/styles";
import { Provider } from "react-redux";
import { store } from "store/store";
import { useAppSelector } from "store/hooks";
import { NotificationDialog } from "components/dialog";
import { appRoutes } from "app-routes";

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

const WarnFailedUpload = ({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element => {
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

const WarnExitPageDuringUpload = ({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element => {
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

  const initBeforeUnLoad = (showExitPrompt: boolean) => {
    window.onbeforeunload = (event) => {
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

export function App(): JSX.Element {
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
            <WarnFailedUpload>
              <Routes>
                {appRoutes.map(({ path, Component }) => (
                  <Route key={path} path={path} element={<Component />} />
                ))}
              </Routes>
            </WarnFailedUpload>
          </WarnExitPageDuringUpload>
        </Provider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}
