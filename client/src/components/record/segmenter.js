/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import * as bodySegmentation from "@tensorflow-models/body-segmentation";
import "@tensorflow/tfjs-core";
// Register WebGL backend.
import "@tensorflow/tfjs-backend-webgl";
import "@mediapipe/selfie_segmentation";

const model = bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation;
const segmenterConfig = {
  runtime: "mediapipe",
  solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation",
  modelType: "landscape",
};
const segmenter = await bodySegmentation.createSegmenter(
  model,
  segmenterConfig
);

const videoRecorder = $("[data-cy=video-recorder]");
// const videoPlayer = $("[data-cy=video-player]");
const segmentationConfig = { flipHorizontal: false };
const people = await segmenter.segmentPeople(videoRecorder, segmentationConfig); // Only returns the one person in video

export default function segmentVideo() {
  return [
    {
      maskValueToLabel: (maskValue) => {
        return "person";
      },
      mask: {
        // toCanvasImageSource(): ...
        // toImageData(): ...
        // toTensor(): ...
        // getUnderlyingType(): ...
      },
    },
  ];
}
