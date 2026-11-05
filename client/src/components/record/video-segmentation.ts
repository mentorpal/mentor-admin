/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useCallback, useEffect, useRef } from "react";
import type { DrawingUtils, ImageSegmenter } from "@mediapipe/tasks-vision";

const WASM_ROOT =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.2/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter_landscape/float16/1/selfie_segmenter_landscape.tflite";

export interface UseWithVideoSegmentation {
  segmentVideoAndDrawToCanvas: (videoElement: HTMLVideoElement) => void;
}

export function useWithVideoSegmentation(
  enabled = true
): UseWithVideoSegmentation {
  const resources = useRef<{
    segmenter: ImageSegmenter;
    drawing: DrawingUtils;
    canvas: HTMLCanvasElement;
    lastTimestamp: number;
  }>();

  useEffect(() => {
    if (!enabled) {
      return;
    }
    let cancelled = false;
    let segmenter: ImageSegmenter | undefined;
    let drawing: DrawingUtils | undefined;

    async function initialize(): Promise<void> {
      const canvas = document.querySelector<HTMLCanvasElement>(
        "[data-cy=draw-canvas]"
      );
      const context = canvas?.getContext("2d");
      if (!canvas || !context) {
        return;
      }
      const { FilesetResolver, ImageSegmenter, DrawingUtils } = await import(
        "@mediapipe/tasks-vision"
      );
      if (cancelled) {
        return;
      }
      const files = await FilesetResolver.forVisionTasks(WASM_ROOT);
      if (cancelled) {
        return;
      }
      const inferenceCanvas = document.createElement("canvas");
      const gpuContext = inferenceCanvas.getContext("webgl2");
      if (!gpuContext) {
        throw new Error("Video segmentation requires WebGL 2");
      }
      const created = await ImageSegmenter.createFromOptions(files, {
        canvas: inferenceCanvas,
        baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
        runningMode: "VIDEO",
        outputConfidenceMasks: true,
        outputCategoryMask: false,
      });
      if (cancelled) {
        created.close();
        return;
      }
      segmenter = created;
      drawing = new DrawingUtils(context, gpuContext);
      resources.current = { segmenter, drawing, canvas, lastTimestamp: -1 };
    }

    initialize().catch((error) => {
      if (!cancelled) {
        console.error("Failed to initialize video segmentation", error);
      }
    });
    return () => {
      cancelled = true;
      resources.current = undefined;
      drawing?.close();
      segmenter?.close();
    };
  }, [enabled]);

  const segmentVideoAndDrawToCanvas = useCallback(
    (videoElement: HTMLVideoElement): void => {
      const current = resources.current;
      if (
        !current ||
        videoElement.readyState < HTMLMediaElement.HAVE_CURRENT_DATA
      ) {
        return;
      }
      // MediaPipe requires strictly increasing timestamps (can't be the same)
      const timestamp = Math.floor(performance.now());
      if (timestamp <= current.lastTimestamp) {
        return;
      }
      current.lastTimestamp = timestamp;
      current.segmenter.segmentForVideo(videoElement, timestamp, (result) => {
        const foregroundMask = result.confidenceMasks?.[0];
        if (!foregroundMask) {
          return;
        }
        const context = current.canvas.getContext("2d");
        context?.clearRect(0, 0, current.canvas.width, current.canvas.height);
        current.drawing.drawConfidenceMask(
          foregroundMask,
          [0, 0, 0, 0],
          videoElement
        );
      });
    },
    []
  );

  return { segmentVideoAndDrawToCanvas };
}
