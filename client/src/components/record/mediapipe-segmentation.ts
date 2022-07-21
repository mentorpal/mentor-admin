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
import { Camera } from "@mediapipe/camera_utils";
import { useWithWindowSize } from "hooks/use-with-window-size";
import { SelfieSegmentation } from "@mediapipe/selfie_segmentation";

const { width: windowWidth, height: windowHeight } = useWithWindowSize();

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

  ////////////////////////////////////////////////////////////////////////////////
  function createSelfieSegmenter() {
    const selfieSegmentation = new SelfieSegmentation({
      locateFile: (file: string) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
      },
    });
    selfieSegmentation.setOptions({
      modelSelection: 1,
    });
    selfieSegmentation.onResults(onResults);
  }
  ////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////
  function onResults(results) {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(
      results.segmentationMask,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );

    // Only overwrite existing pixels.
    canvasCtx.globalCompositeOperation = "source-in";
    canvasCtx.fillStyle = "#00FF00";
    canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);

    // Only overwrite missing pixels.
    canvasCtx.globalCompositeOperation = "destination-atop";
    canvasCtx.drawImage(
      results.image,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );

    canvasCtx.restore();
  }
  ////////////////////////////////////////////////////////////////////////////////

  async function segmentVideoToBinaryMask(
    segmenter: bodySegmentation.BodySegmenter,
    videoElement: HTMLVideoElement
  ) {
    const foreground: Color = { r: 0, g: 0, b: 0, a: 0 };
    const background: Color = { r: 0, g: 255, b: 0, a: 255 };
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

    const camera = new Camera(videoRecorder as HTMLVideoElement, {
      onFrame: async () => {
        await selfieSegmentation.send({ image: videoRecorder });
      },
      width:
        windowHeight > windowWidth
          ? windowWidth
          : Math.max(windowHeight - 600, 300) * (16 / 9),
      height:
        windowHeight > windowWidth
          ? windowWidth * (9 / 16)
          : Math.max(windowHeight - 600, 300),
    });
    camera.start();
  }

  return {
    segmentVideoAndDrawToCanvas,
  };
}
