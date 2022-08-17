/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import React, { useEffect, useMemo, useRef, useState } from "react";
import RecordRTC, { MediaStreamRecorder, MultiStreamRecorder } from "recordrtc";
import { Button, IconButton, Typography } from "@material-ui/core";
import FiberManualRecordIcon from "@material-ui/icons/FiberManualRecord";
import StopIcon from "@material-ui/icons/Stop";
import useInterval from "hooks/task/use-interval";
import overlay from "images/face-position-white.png";
import { UseWithRecordState } from "types";
import PermCameraMicIcon from "@material-ui/icons/PermCameraMic";
import VirtualBackground from "images/virtual-background.png";
import { useWithVideoSegmentation } from "components/record/video-segmentation";
import { useWithWindowSize } from "hooks/use-with-window-size";

function VideoRecorder(props: {
  classes: Record<string, string>;
  height: number;
  width: number;
  recordState: UseWithRecordState;
  videoRecorderMaxLength: number;
  stopRequests: number;
}): JSX.Element {
  // TODO: This should come from mentor config
  const isVirtualBgMentor = true;

  const { classes, height, width, recordState, stopRequests } = props;
  const [videoRecorder, setVideoRecorder] = useState<RecordRTC>();
  const [recordStartCountdown, setRecordStartCountdown] = useState(0);
  const [recordStopCountdown, _setRecordStopCountdown] = useState(0);
  const [recordDurationCounter, setRecordDurationCounter] = useState(0);
  const [recordedVideo, setRecordedVideo] = useState<File>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { segmentVideoAndDrawToCanvas } = useWithVideoSegmentation();
  const { width: windowWidth, height: windowHeight } = useWithWindowSize();

  const VirtualBg = useMemo<JSX.Element>(
    () => (
      <img
        src={VirtualBackground}
        alt=""
        style={{
          display: "block",
          margin: "auto",
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
        }}
        width={
          windowHeight > windowWidth
            ? windowWidth
            : Math.max(windowHeight - 600, 300) * (16 / 9)
        }
        height={
          windowHeight > windowWidth
            ? windowWidth * (9 / 16)
            : Math.max(windowHeight - 600, 300)
        }
      />
    ),
    [windowHeight, windowWidth]
  );

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
    canvasEle.getContext("2d"); //Firefox require getContext to be called before capture stream
    const canvasStream = canvasEle.captureStream(15); //canvasRef.current.captureStream(15)

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
    // videoRecorder?.destroy();
    setVideoRecorder(undefined);
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
      videoRecorder?.stopRecording(() => {
        const blob = videoRecorder.getBlob();
        setRecordedVideo(
          new File([blob], "video.webm", { type: "video/webm" })
        );
      });
    }
  }, [recordDurationCounter]);

  // When start recording is pressed, this interval begins
  useInterval(
    (isCancelled) => {
      if (isCancelled()) {
        return;
      }
      const counter = recordStartCountdown - 1;
      setRecordStartCountdown(counter);
      if (counter <= 0) {
        recordState.startRecording();
        videoRecorder?.startRecording();
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
    setRecordStartCountdown(3);
  }

  function beginStopRecordingCountdown() {
    if (countdownInProgress) {
      return;
    }
    setRecordStopCountdown(2);
  }

  function recordStateStopRecording(recordedVideo: File) {
    setRecordedVideo(recordedVideo);
    setRecordStartCountdown(0);
    setRecordStopCountdown(0);
    setRecordDurationCounter(0);
    // videoRecorder?.reset();
    setVideoRecorder(undefined);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
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
    isVirtualBgMentor && videoRecorder && videoRef.current?.srcObject
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
          visibility: videoRecorder ? "inherit" : "hidden",
        }}
      >
        Please get into position by facing forward and lining up with the
        outline.
      </Typography>
      <div style={{ height, width, position: "relative" }}>
        <video
          data-cy="video-recorder-component"
          height={height}
          width={width}
          autoPlay
          playsInline
          ref={videoRef}
        />
        {VirtualBg}
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
            visibility: videoRecorder ? "hidden" : "visible",
          }}
          onClick={() => {
            if (!videoRef.current || !canvasRef.current) {
              return;
            }
            setupVideoStream(videoRef.current, canvasRef.current);
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
            visibility: videoRecorder ? "visible" : "hidden",
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
            visibility: videoRecorder ? "visible" : "hidden",
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
          visibility: videoRecorder ? "visible" : "hidden",
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
            if (!e.target.files) {
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
