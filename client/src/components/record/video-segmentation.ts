/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import "@mediapipe/selfie_segmentation";
import { useState } from "react";
import { SelfieSegmentation } from "@mediapipe/selfie_segmentation";

export interface UseWithVideoSegmentation {
  segmentVideoAndDrawToCanvas: () => void;
}

export function useWithVideoSegmentation(): UseWithVideoSegmentation {
  const [selfieSegmenter] = useState<SelfieSegmentation>(
    createSelfieSegmentation()
  );

  function getVideoRecorder() {
    return document.querySelectorAll("[data-cy=video-recorder]")[1];
  }

  function getCanvas() {
    return document.querySelector("[data-cy=draw-canvas]");
  }

  function getCanvasContext(
    canvas: HTMLCanvasElement
  ): CanvasRenderingContext2D | null {
    if (canvas == null) {
      return null;
    }
    return canvas.getContext("2d");
  }

  function createSelfieSegmentation(): SelfieSegmentation {
    const selfieSegmentation = new SelfieSegmentation({
      locateFile: (file: string) => {
        console.log(file);
        return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
      },
    });
    selfieSegmentation.setOptions({
      modelSelection: 1,
    });
    selfieSegmentation.onResults(onResults);
    return selfieSegmentation;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function onResults(results: any): void {
    if (!selfieSegmenter) {
      // If no segmenter, try to create it and set to state
      return;
    }
    const canvas = getCanvas() as HTMLCanvasElement;
    const canvasCtx = getCanvasContext(canvas);
    if (canvasCtx == null) {
      return;
    } else {
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
      canvasCtx.drawImage(
        results.segmentationMask,
        0,
        0,
        canvas.width,
        canvas.height
      );

      // Only overwrite existing pixels.
      canvasCtx.globalCompositeOperation = "source-in";
      // canvasCtx.fillStyle = "#00FF00";
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

      // Only overwrite missing pixels.
      // canvasCtx.globalCompositeOperation = "destination-atop";
      canvasCtx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

      canvasCtx.restore();
    }
  }

  async function segmentVideoAndDrawToCanvas(): Promise<void> {
    //const { width: windowWidth, height: windowHeight } = useWithWindowSize();
    if (!selfieSegmenter) {
      // If no segmenter, try to create it and set to state
      return;
    }
    const videoRecorder = getVideoRecorder();
    await selfieSegmenter.send({
      image: videoRecorder as HTMLVideoElement,
    });
  }
  return {
    segmentVideoAndDrawToCanvas,
  };
}
