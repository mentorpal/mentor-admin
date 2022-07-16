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
import { useEffect, useState } from "react";
import { Color } from "@tensorflow-models/body-segmentation/dist/shared/calculators/interfaces/common_interfaces";

export interface UseWithVideoSegmentation {
  segmentVideoAndDrawToCanvas: () => void;
}

export function useWithVideoSegmentation(): UseWithVideoSegmentation {
  const [segmenter, setSegmenter] = useState<bodySegmentation.BodySegmenter>();

  useEffect(() => {
    buildVideoSegmenter()
      .then((segmenter) => {
        setSegmenter(segmenter);
      })
      .catch((err) => {
        console.error("Failed to build segmenter", err);
      });
  }, []);

  const opacity = 1;
  const flipHorizontal = false;
  const maskBlurAmount = 0;

  function getVideoRecorder() {
    return document.querySelectorAll("[data-cy=video-recorder]")[1];
  }

  function getCanvas() {
    return document.querySelector("[data-cy=draw-canvas]");
  }

  async function buildVideoSegmenter(): Promise<bodySegmentation.BodySegmenter> {
    const model = bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation;
    const segmenterConfig: MediaPipeSelfieSegmentationMediaPipeModelConfig = {
      runtime: "mediapipe",
      solutionPath:
        "https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation",
      modelType: "landscape",
    };
    return await bodySegmentation.createSegmenter(model, segmenterConfig);
  }

  async function segmentVideoToBinaryMask(
    segmenter: bodySegmentation.BodySegmenter,
    videoElement: HTMLVideoElement
  ) {
    const foreground: Color = { r: 0, g: 0, b: 0, a: 0 };
    const background: Color = { r: 74, g: 255, b: 20, a: 254 };
    const drawContour = false;
    const foregroundThresholdProbability = 0.5;
    const segmentation = await segmenter.segmentPeople(videoElement);
    const segmentationBinaryMask = await bodySegmentation.toBinaryMask(
      segmentation,
      foreground,
      background,
      drawContour,
      foregroundThresholdProbability
    );
    return segmentationBinaryMask;
  }

  async function segmentVideoAndDrawToCanvas(): Promise<void> {
    if (!segmenter) {
      // If no segmenter, try to create it and set to state
      return;
    }
    const videoRecorder = getVideoRecorder();
    const canvas = getCanvas();
    if (!videoRecorder) {
      throw new Error("No video player found");
    }
    if (!canvas) {
      throw new Error("No canvas found");
    }
    const segmentationBinaryMask = await segmentVideoToBinaryMask(
      segmenter,
      videoRecorder as HTMLVideoElement
    );
    bodySegmentation.drawMask(
      canvas as HTMLCanvasElement,
      videoRecorder as HTMLVideoElement,
      segmentationBinaryMask as ImageData,
      opacity,
      maskBlurAmount,
      flipHorizontal
    );
  }

  return {
    segmentVideoAndDrawToCanvas,
  };
}
