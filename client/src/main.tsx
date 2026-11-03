/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "app";
import { loadSentry } from "helpers";

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

if (process.env.IS_SENTRY_ENABLED === "true") {
  console.log("Loading sentry");
  loadSentry();
}

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("root element missing");
}

createRoot(rootEl).render(
  <BrowserRouter basename="/admin">
    <App />
  </BrowserRouter>
);
