/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useState, useEffect } from "react";
import * as bodySegmentation from "@tensorflow-models/body-segmentation";
import "@tensorflow/tfjs-core";
// Register WebGL backend.
import "@tensorflow/tfjs-backend-webgl";
import "@mediapipe/selfie_segmentation";
//import VideoPlayer from "./video-player";

const video = document.querySelectorAll("[data-cy=video-recorder]");
const canvas = document.getElementById("canvas");

const model = bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation;
const segmenterConfig = {
  runtime: "mediapipe", // or 'tfjs'
  solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation",
  modelType: "general",
};

async function buildVideoSegmenter(video) {
  const segmenter = await bodySegmentation.createSegmenter(
    model,
    segmenterConfig
  );
  const segmentation = await segmenter.segmentPeople(video);
  // The mask image is an binary mask image with a 1 where there is a person and
  // a 0 where there is not.
  const segmentationBinaryMask = await bodySegmentation.toBinaryMask(
    segmentation
  );
  return segmentationBinaryMask;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function videoSegmentation() {
  const [person, setPerson] = useState();
  useEffect(() => {
    if (video === null) {
      throw new Error("No video recorder found");
    }
    const segmentationBinaryMask = buildVideoSegmenter(video);
    const opacity = 0.7;
    const flipHorizontal = false;
    const maskBlurAmount = 0;
    // Draw the mask image on top of the original image onto a canvas.
    // The colored part image will be drawn semi-transparent, with an opacity of
    // 0.7, allowing for the original image to be visible under.
    setPerson(
      bodySegmentation.drawMask(
        canvas,
        video,
        segmentationBinaryMask,
        opacity,
        maskBlurAmount,
        flipHorizontal
      )
    );
    console.log("video:", video);
    console.log("person:", person);
    console.log("canvas:", canvas);

    return () => {
      person;
    };
  }, []);

  return (
    //JSX to be rendered
    <>
      <div>{video}</div>;
    </>
  );
}

export default videoSegmentation;
