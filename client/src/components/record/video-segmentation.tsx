/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useState, useEffect } from "react";
import * as bodySegmentation from "@tensorflow-models/body-segmentation";
import "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import "@mediapipe/selfie_segmentation";
import VideoPlayer from "./video-player";
import { MediaPipeSelfieSegmentationMediaPipeModelConfig } from "@tensorflow-models/body-segmentation";
// import VideoRecorder from "./video-recorder";

async function buildVideoSegmenter(videoRecorder: HTMLVideoElement) {
  const model = bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation;
  const segmenterConfig: MediaPipeSelfieSegmentationMediaPipeModelConfig = {
    runtime: "mediapipe", // or 'tfjs'
    solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation",
    modelType: "general",
  };
  const segmenter = await bodySegmentation.createSegmenter(
    model,
    segmenterConfig
  );
  const segmentation = await segmenter.segmentPeople(videoRecorder);
  // The mask image is an binary mask image with a 1 where there is a person and
  // a 0 where there is not.
  const segmentationBinaryMask = await bodySegmentation.toBinaryMask(
    segmentation
  );
  return segmentationBinaryMask;
}

export function videoSegmentation() {
  const videoRecorder = document.querySelector("[data-cy=video-player]") as HTMLVideoElement;
  const canvas = document.querySelector("[data-cy=draw-canvas]") as HTMLCanvasElement;
  if (videoRecorder === null) {
    console.log("no video recorder")
    return
    // throw new Error("No video player found");
  }
  if (canvas === null) {
    console.log("no canvas")
    return
    // throw new Error("No canvas found");
  }
  console.log("videoRecorder:", videoRecorder);
  console.log("canvas:", canvas);
  buildVideoSegmenter(videoRecorder).then((segBinaryMask)=>{
    const opacity = 0.7;
    const flipHorizontal = false;
    const maskBlurAmount = 0;
    // Draw the mask image on top of the original image onto a canvas.
    // The colored part image will be drawn semi-transparent, with an opacity of
    // 0.7, allowing for the original image to be visible under.
  
    // setPerson()
    bodySegmentation.drawMask(
      canvas,
      videoRecorder,
      segBinaryMask,
      opacity,
      maskBlurAmount,
      flipHorizontal
    )
    console.log("videoRecorder:", videoRecorder);
    console.log("canvas:", canvas);
  })
  
}