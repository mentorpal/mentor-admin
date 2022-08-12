/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import React, { useEffect, useState } from "react";
import videojs from "video.js";
import { IconButton, Typography } from "@material-ui/core";
import FiberManualRecordIcon from "@material-ui/icons/FiberManualRecord";
import StopIcon from "@material-ui/icons/Stop";
import useInterval from "hooks/task/use-interval";
import overlay from "images/face-position-white.png";

function VideoRecorder({
  classes,
  height,
  width,
  recordState,
  videoRecorderMaxLength,
  stopRequests,
}) {
  const videoJsOptions = {
    controls: true,
    bigPlayButton: false,
    controlBar: {
      fullscreenToggle: false,
      volumePanel: false,
      recordToggle: false,
    },
    fluid: true,
    aspectRatio: "16:9",
    plugins: {
      record: {
        audio: true,
        video: true,
        debug: true,
        maxLength: videoRecorderMaxLength,
      },
    },
  };
  const { segmentVideoAndDrawToCanvas } = useWithVideoSegmentation();
  const videoRef = useRef();
  const canvasRef = useRef();
  const [videoRecorderRef, setVideoRecorderRef] = useState();
  // can't store these in RecordingState because player.on callbacks
  // snapshot recordState from when player first initializes and doesn't
  // update when changing answers
  const [recordStartCountdown, setRecordStartCountdown] = useState(0);
  const [recordStopCountdown, _setRecordStopCountdown] = useState(0);
  const [recordDurationCounter, setRecordDurationCounter] = useState(0);
  const [recordedVideo, setRecordedVideo] = useState();
  const [isCameraOn, setIsCameraOn] = useState(false);

  //Using refs to access states variables in event handler
  const recordStopCountdownRef = useRef(recordStopCountdown);
  const setRecordStopCountdown = (n: number) => {
    recordStopCountdownRef.current = n;
    _setRecordStopCountdown(n);
  };
  const isRecordingRef = React.useRef(recordState.isRecording);
  useEffect(() => {
    isRecordingRef.current = recordState.isRecording;
  }, [recordState.isRecording]);

  useEffect(() => {
    if (!videoRef || videoRecorderRef) {
      return;
    }
    const player = videojs(videoRef, videoJsOptions, function onPlayerReady() {
      setVideoRecorderRef(player);
    });
    player.on("deviceReady", function () {
      setIsCameraOn(true);
    });
    player.on("startRecord", function () {
      setRecordStartCountdown(0);
      setRecordStopCountdown(0);
      setRecordDurationCounter(0);
    });
    player.on("progressRecord", function () {
      setRecordDurationCounter(player.record().getDuration());
    });
    player.on("finishRecord", function () {
      setRecordedVideo(new File([player.recordedData], "video.mp4"));
      setRecordStartCountdown(0);
      setRecordStopCountdown(0);
      setRecordDurationCounter(0);
      setIsCameraOn(false);
      player.record().reset();
    });
    return () => {
      player?.dispose();
    };
  }, [videoRef]);

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
    videoRecorder?.destroy();
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
        const videoBlob = videoRecorder.getBlob();
        setRecordedVideo(new File([videoBlob], "video.mp4"));
      });
    }
  }, [recordDurationCounter]);

  // When start recording is pressed, this interval begins
  useInterval(
    () => {
      segmentVideoAndDrawToCanvas();
    },
    recordState.isRecording ? 100 : null
  );

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
          const newVideoFile = new File([videoRecorder.getBlob()], "video.mp4");
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
    videoRecorder?.reset();
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
          height={height}
          width={width}
          autoPlay
          playsInline
          ref={(e) => setVideoRef(e || undefined)}
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
          onClick={setupCamera}
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
