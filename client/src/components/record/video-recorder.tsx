/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import React, { useEffect, useRef, useState } from "react";
import RecordRTC, { MediaStreamRecorder } from "recordrtc";
import { Button, IconButton, Typography } from "@material-ui/core";
import FiberManualRecordIcon from "@material-ui/icons/FiberManualRecord";
import StopIcon from "@material-ui/icons/Stop";
import useInterval from "hooks/task/use-interval";
import overlay from "images/face-position-white.png";
import { UseWithRecordState } from "types";
import PermCameraMicIcon from "@material-ui/icons/PermCameraMic";
import { useWithVideoSegmentation } from "components/record/video-segmentation";
import { useWithImage } from "hooks/graphql/use-with-image";

function VideoRecorder(props: {
  classes: Record<string, string>;
  height: number;
  width: number;
  recordState: UseWithRecordState;
  isVirtualBgMentor: boolean;
  virtualBackgroundUrl: string;
  videoRecorderMaxLength: number;
  stopRequests: number;
}): JSX.Element {
  const {
    classes,
    height,
    width,
    recordState,
    stopRequests,
    isVirtualBgMentor,
    virtualBackgroundUrl,
  } = props;
  const [videoRecorder, setVideoRecorder] = useState<RecordRTC>();
  const [cameraIsOn, setCameraIsOn] = useState<boolean>(false);
  const [recordStartCountdown, setRecordStartCountdown] = useState(0);
  const [recordStopCountdown, _setRecordStopCountdown] = useState(0);
  const [recordDurationCounter, setRecordDurationCounter] = useState(0);
  const [recordedVideo, setRecordedVideo] = useState<File>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { segmentVideoAndDrawToCanvas } = useWithVideoSegmentation();
  const { aspectRatio: vbgAspectRatio } = useWithImage(virtualBackgroundUrl);

  //Using refs to access states variables in event handler
  const recordStopCountdownRef = useRef(recordStopCountdown);
  const setRecordStopCountdown = (n: number) => {
    recordStopCountdownRef.current = n;
    _setRecordStopCountdown(n);
  };
  const isRecordingRef = useRef(recordState.isRecording);
  useEffect(() => {
    isRecordingRef.current = recordState.isRecording;
  }, [recordState.isRecording]);

  async function setupVideoStream(
    videoEle: HTMLVideoElement,
    canvasEle: HTMLCanvasElement
  ) {
    const audioStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    const videoStream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });
    videoEle.muted = true;
    videoEle.volume = 0;
    videoEle.srcObject = videoStream;
    const canvasStream = canvasEle.captureStream(30);
    const finalStream = new MediaStream();
    audioStream.getAudioTracks().forEach((track) => {
      finalStream.addTrack(track);
    });
    if (isVirtualBgMentor) {
      canvasStream.getVideoTracks().forEach((track) => {
        finalStream.addTrack(track);
      });
    } else {
      videoStream.getVideoTracks().forEach((track) => {
        finalStream.addTrack(track);
      });
    }

    const recorder = new RecordRTC(finalStream, {
      type: "video",
      mimeType: "video/webm;codecs=vp9", //;codecs=vp9
      recorderType: MediaStreamRecorder,
      timeSlice: 1000,
      ondataavailable: function () {
        setRecordDurationCounter((prevState) => prevState + 1);
      },
      checkForInactiveTracks: true,
      videoBitsPerSecond: 256000,
    });
    setVideoRecorder(recorder);
    setCameraIsOn(true);
  }

  // When a recordedVideo gets set in this files state, add it to record state
  useEffect(() => {
    if (recordedVideo) {
      recordState.stopRecording(recordedVideo);
      setRecordedVideo(undefined);
    }
  }, [recordedVideo]);

  // When we change questions, reset everything
  useEffect(() => {
    if (!recordState) {
      return;
    }
    setCameraIsOn(false);
    videoRecorder?.reset();

    setRecordStartCountdown(0);
    setRecordStopCountdown(0);
    setRecordDurationCounter(0);
  }, [recordState?.curAnswer?.answer._id]);

  // Making sure we don't record over minVideoLength
  useEffect(() => {
    if (!recordState.isRecording || !recordState?.curAnswer?.minVideoLength) {
      return;
    }
    if (recordDurationCounter > recordState?.curAnswer?.minVideoLength) {
      setCameraIsOn(false);
      videoRecorder?.stopRecording(() => {
        const blob = videoRecorder.getBlob();
        setRecordedVideo(
          new File([blob], "video.webm", { type: "video/webm" })
        );
      });
    }
  }, [recordDurationCounter]);

  useEffect(() => {
    if (!cameraIsOn && canvasRef.current) {
      clearCanvas(canvasRef.current);
    }
  }, [cameraIsOn]);

  // When start recording is pressed, this interval begins
  useInterval(
    (isCancelled) => {
      if (isCancelled()) {
        return;
      }
      const counter = recordStartCountdown - 1;
      setRecordStartCountdown(counter);
      if (counter <= 0) {
        videoRecorder?.stopRecording();
        videoRecorder?.reset();
        videoRecorder?.startRecording();
        recordState.startRecording();
      }
    },
    recordStartCountdown > 0 ? 1000 : null
  );

  // When stop recording is pressed, this interval begins
  useInterval(
    (isCancelled) => {
      if (isCancelled()) {
        return;
      }
      const counter = recordStopCountdown - 1;
      setRecordStopCountdown(counter);
      if (counter <= 0) {
        // countdown is finished, time to stop recording
        videoRecorder?.stopRecording(() => {
          setCameraIsOn(false);
          const blob = videoRecorder.getBlob();
          const newVideoFile = new File([blob], "video.webm", {
            type: "video/webm",
          });
          recordStateStopRecording(newVideoFile);
        });
      }
    },
    recordStopCountdown > 0 ? 1000 : null
  );

  const countdownInProgress =
    recordStartCountdown > 0 ||
    (recordStopCountdown > 0 && recordState.isRecording);

  useEffect(() => {
    if (stopRequests == 0) {
      return;
    }
    beginStopRecordingCountdown();
  }, [stopRequests]);

  function beginStartRecordingCountdown() {
    if (countdownInProgress) {
      return;
    }
    //Note: This is a workaround and is not the actaul start of the recording.
    // First frame of subsequent recordings contains last frame of previous recording, so we need to start recording, stop, then start again right when the user expectes it to start.
    videoRecorder?.startRecording();
    setRecordStartCountdown(3);
  }

  function beginStopRecordingCountdown() {
    if (countdownInProgress) {
      return;
    }
    setRecordStopCountdown(2);
  }

  function recordStateStopRecording(recordedVideo: File) {
    setCameraIsOn(false);
    setRecordedVideo(recordedVideo);
    setRecordStartCountdown(0);
    setRecordStopCountdown(0);
    setRecordDurationCounter(0);
    if (canvasRef.current) {
      clearCanvas(canvasRef.current);
    }
    videoRecorder?.reset();
  }

  function clearCanvas(canvasEle: HTMLCanvasElement) {
    const canvasCtx = canvasEle.getContext("2d");
    if (!canvasCtx) {
      return;
    }
    canvasCtx.clearRect(0, 0, canvasEle.width, canvasEle.height);
  }

  const spaceBarStopRecording = (event: {
    keyCode: number;
    preventDefault: () => void;
  }) => {
    if (
      event.keyCode === 32 &&
      recordStopCountdownRef.current == 0 &&
      isRecordingRef.current
    ) {
      event.preventDefault();
      beginStopRecordingCountdown();
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", spaceBarStopRecording, false);
    return () => {
      document.removeEventListener("keydown", spaceBarStopRecording, false);
    };
  }, []);

  // When start recording is pressed, this interval begins
  useInterval(
    () => {
      segmentVideoAndDrawToCanvas();
    },
    isVirtualBgMentor &&
      videoRecorder &&
      cameraIsOn &&
      videoRef.current?.srcObject
      ? 33
      : null
  );

  function getRecordTimeText(recordTime: number): string {
    const minutes = Math.trunc(recordTime / 60);
    const seconds = Math.trunc(recordTime % 60);
    const minutesString =
      minutes < 10 ? `0${minutes.toString()}` : `${minutes.toString()}`;
    const secondsString =
      Number(seconds / 10) < 1
        ? `0${seconds.toString()}`
        : `${seconds.toString()}`;
    return `${minutesString}:${secondsString}`;
  }

  const backgroundImageStyling: React.CSSProperties = isVirtualBgMentor
    ? {
        backgroundImage: `url(${virtualBackgroundUrl})`,
        backgroundSize: vbgAspectRatio >= 1.77 ? "auto 100%" : "100% auto",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }
    : {};

  return (
    <div
      data-cy="video-recorder"
      style={{
        position: "absolute",
        visibility:
          recordState?.curAnswer?.videoSrc ||
          recordState?.curAnswer?.isUploading
            ? "hidden"
            : "visible",
      }}
    >
      <Typography
        data-cy="instruction"
        style={{
          textAlign: "center",
          visibility: cameraIsOn ? "inherit" : "hidden",
        }}
      >
        Please get into position by facing forward and lining up with the
        outline.
      </Typography>
      <div
        data-cy="video-recorder-background"
        style={{
          height,
          width,
          position: "relative",
          backgroundColor: "black",
          ...backgroundImageStyling,
        }}
      >
        <video
          data-cy="video-recorder-component"
          height={height}
          width={width}
          autoPlay
          playsInline
          ref={videoRef}
          style={{ visibility: cameraIsOn ? "visible" : "hidden" }}
        />
        <canvas
          data-cy="draw-canvas"
          id="canvas"
          ref={canvasRef}
          style={{
            display: "block",
            margin: "auto",
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
          }}
          width={width}
          height={height}
        />
        <Button
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            width: "100%",
            color: "white",
            visibility:
              cameraIsOn ||
              (!cameraIsOn && recordState.curAnswer?.videoSrc) ||
              recordState.curAnswer?.isUploading
                ? "hidden"
                : "visible",
          }}
          onClick={() => {
            if (!videoRef.current || !canvasRef.current) {
              return;
            }
            if (!videoRecorder) {
              setupVideoStream(videoRef.current, canvasRef.current);
            } else {
              setCameraIsOn(true);
            }
          }}
        >
          <PermCameraMicIcon style={{ width: "30%", height: "auto" }} />
        </Button>
        <div
          data-cy="outline"
          className={classes.overlay}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            width: width,
            height: height,
            opacity: recordState.isRecording ? 0.5 : 0.75,
            visibility: cameraIsOn ? "visible" : "hidden",
            backgroundImage: `url(${overlay})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "contain",
          }}
        />
        <span
          data-cy="video-timer"
          style={{
            position: "absolute",
            bottom: "10px",
            left: "10px",
            width: "fit-content",
            height: "fit-content",
            visibility: cameraIsOn ? "visible" : "hidden",
            color: "white",
            background: "rgba(0, 0, 0, 0.3)",
          }}
        >
          {getRecordTimeText(recordDurationCounter)}
        </span>
        <Typography
          data-cy="countdown-message"
          variant="h2"
          align="center"
          style={{
            color: "white",
            position: "absolute",
            top: "20px",
            bottom: 0,
            left: 0,
            right: 0,
            width: width,
            height: height,
            visibility: countdownInProgress ? "visible" : "hidden",
          }}
        >
          {recordStartCountdown
            ? "Recording starts in"
            : recordStopCountdown
            ? "Recording ends in"
            : Math.max(
                Math.ceil(
                  (recordState?.curAnswer?.minVideoLength || 0) -
                    recordDurationCounter
                ),
                0
              )
            ? "Video ends in"
            : ""}
        </Typography>
        <Typography
          data-cy="countdown"
          variant="h2"
          align="center"
          style={{
            color: "white",
            position: "absolute",
            top: height / 2,
            bottom: height / 2,
            left: width / 2,
            right: width / 2,
            visibility: countdownInProgress ? "visible" : "hidden",
          }}
        >
          {recordStartCountdown ||
            recordStopCountdown ||
            Math.max(
              Math.ceil(
                (recordState?.curAnswer?.minVideoLength || 0) -
                  recordDurationCounter
              ),
              0
            ) ||
            ""}
        </Typography>
      </div>
      <div
        data-cy="controls"
        className={classes.row}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          visibility: cameraIsOn ? "visible" : "hidden",
        }}
      >
        <IconButton
          onClick={
            recordState.isRecording
              ? beginStopRecordingCountdown
              : beginStartRecordingCountdown
          }
          style={{ color: "red" }}
        >
          {recordState.isRecording ? <StopIcon /> : <FiberManualRecordIcon />}
        </IconButton>
      </div>
      <div
        className={classes.row}
        style={{ justifyContent: "center", marginTop: 20 }}
      >
        <input
          data-cy="upload-file"
          type="file"
          accept="audio/*,video/*"
          onChange={(e) => {
            if (!e.target.files?.length) {
              return;
            } else {
              recordStateStopRecording(e.target.files[0]);
            }
          }}
        />
      </div>
    </div>
  );
}

export default VideoRecorder;
