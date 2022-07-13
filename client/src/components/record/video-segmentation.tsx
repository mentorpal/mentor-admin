/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import * as bodySegmentation from "@tensorflow-models/body-segmentation";
import "@mediapipe/selfie_segmentation";
import { MediaPipeSelfieSegmentationMediaPipeModelConfig } from "@tensorflow-models/body-segmentation";

const videoRecorder = getVideoRecorder();
const canvas = getCanvas();
const opacity = 0.7;
const flipHorizontal = false;
const maskBlurAmount = 0;
const segmentationBinaryMask = convertMaskToImageData(buildVideoSegmenter());

function getVideoRecorder() {
  return document.querySelectorAll(
    "[data-cy=video-recorder]"
  )[1] as HTMLVideoElement;
}

function getCanvas() {
  return document.querySelector("[data-cy=draw-canvas]");
}

async function buildVideoSegmenter() {
  const videoRecorder = getVideoRecorder();
  const canvas = getCanvas();
  if (!videoRecorder) {
    console.log("no video recorder");
    return;
    // throw new Error("No video player found");
  }
  if (!canvas) {
    console.log("no canvas");
    return;
    // throw new Error("No canvas found");
  }
  const model = bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation;
  const segmenterConfig: MediaPipeSelfieSegmentationMediaPipeModelConfig = {
    runtime: "mediapipe", // or 'tfjs'
    solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation",
    modelType: "landscape",
  };
  const segmenter = await bodySegmentation.createSegmenter(
    model,
    segmenterConfig
  );
  const segmentation = await segmenter.segmentPeople(videoRecorder);
  // The mask image is an binary mask image with a 1 where there is a person and
  // a 0 where there is not.
  console.log("segmentation", segmentation);
  const segmentationBinaryMask = await bodySegmentation.toBinaryMask(
    segmentation
  );
  console.log("segmentationBinaryMask", segmentationBinaryMask);
  return segmentationBinaryMask;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function convertMaskToImageData(segmentationBinaryMask: any) {
  return segmentationBinaryMask as ImageData;
}

export function videoSegmentation(): void {
  // Draw the mask image on top of the original image onto a canvas.
  // The colored part image will be drawn semi-transparent, with an opacity of
  // 0.7, allowing for the original image to be visible under.
  bodySegmentation.drawMask(
    canvas as HTMLCanvasElement,
    videoRecorder as HTMLVideoElement,
    segmentationBinaryMask as ImageData,
    opacity,
    maskBlurAmount,
    flipHorizontal
  );
}
