/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import Segmentation from "./segmentation";
import { VideoRecorder } from "./video-recorder";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const SegmentOutput = () => (
  <html>
    <head>
      <meta charset="utf-8" />
      <script
        src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"
        crossOrigin="anonymous"
      ></script>
      <script
        src="https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js"
        crossOrigin="anonymous"
      ></script>
      <script
        src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js"
        crossOrigin="anonymous"
      ></script>
      <script
        src="https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/selfie_segmentation.js"
        crossOrigin="anonymous"
      ></script>
    </head>
    <body>
      <div className="container">
        <VideoRecorder />
        <canvas
          className="output_canvas"
          width="1280px"
          height="720px"
        ></canvas>
        <script src={Segmentation}></script>
      </div>
    </body>
  </html>
);

export default SegmentOutput;
