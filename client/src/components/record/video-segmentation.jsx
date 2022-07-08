/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import * as bodySegmentation from "@tensorflow-models/body-segmentation";
import "@tensorflow/tfjs-core";
// Register WebGL backend.
import "@tensorflow/tfjs-backend-webgl";
import "@mediapipe/selfie_segmentation";
import VideoRecorder from "./video-recorder";
import VideoPlayer from "./video-player";

async function videoSegmentation() {
  const video = $("[data-cy=video-player]");
  const segmenter = await bodySegmentation.createSegmenter(
    bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation
  );
  const segmentation = await segmenter.segmentPeople(video);
  // The mask image is an binary mask image with a 1 where there is a person and
  // a 0 where there is not.
  const coloredPartImage = await bodySegmentation.toBinaryMask(segmentation);
  const opacity = 0.7;
  const flipHorizontal = false;
  const maskBlurAmount = 0;
  const canvas = document.getElementById("canvas");
  console.log("canvas:", canvas);
  // Draw the mask image on top of the original image onto a canvas.
  // The colored part image will be drawn semi-transparent, with an opacity of
  // 0.7, allowing for the original image to be visible under.
  const person = bodySegmentation.drawMask(
    canvas,
    video,
    coloredPartImage,
    opacity,
    maskBlurAmount,
    flipHorizontal
  );
  console.log("person:", person);

  return (
    <>
      (
      <div className="container">
        <div>
          <VideoRecorder />
          <div className="canvas-container">
            <canvas
              className="output_canvas"
              width="1280px"
              height="720px"
            ></canvas>
          </div>
          <div className="loading">
            <div className="spinner"></div>
            <div className="message">Loading</div>
          </div>
          <a
            className="abs logo"
            href="http://www.mediapipe.dev"
            target="_blank"
            rel="noreferrer"
          >
            <div style="display: flex;align-items: center;bottom: 0;right: 10px;">
              <img
                className="logo"
                src="logo_white.png"
                alt=""
                style="
                height: 50px;"
              />
              <span className="title">MediaPipe</span>
            </div>
          </a>
        </div>
        <div className="control-panel"></div>
      </div>
      )
    </>
  );
}

export default videoSegmentation;
