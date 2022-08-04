/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
/** VIDEOJS DOESN'T WORK IF TYPESCRIPT... */

import React, { useEffect, useRef, useState } from "react";
// import videojs from "video.js";
import RecordRTC, { MediaStreamRecorder } from "recordrtc";
import { IconButton, Typography } from "@material-ui/core";
import FiberManualRecordIcon from "@material-ui/icons/FiberManualRecord";
import StopIcon from "@material-ui/icons/Stop";
import useInterval from "hooks/task/use-interval";
import overlay from "images/face-position-white.png";
import { UseWithRecordState } from "types";

function VideoRecorder(props: {
  classes: Record<string, string>;
  height: number;
  width: number;
  recordState: UseWithRecordState;
  videoRecorderMaxLength: number;
  stopRequests: number;
}): JSX.Element {
  const {
    classes,
    height,
    width,
    recordState,
    videoRecorderMaxLength,
    stopRequests,
  } = props;
  const [videoRecorder, setVideoRecorder] = useState<RecordRTC>();
  // const [videoRecorderRef, setVideoRecorderRef] = useState();
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
  const isRecordingRef = useRef(recordState.isRecording);
  useEffect(() => {
    isRecordingRef.current = recordState.isRecording;
  }, [recordState.isRecording]);

  function getVideoRecorder() {
    return document.querySelectorAll("[data-cy=video-recorder]")[1];
  }

  function getCanvas() {
    return document.querySelector("[data-cy=draw-canvas]");
  }

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {
        // IF USER DOES NOT WANT VIRTUAL BACKGROUND TO BE USED
        // if (!useVirtualBackground) {
        setVideoRecorder(
          new RecordRTC(stream, {
            type: "video",
            mimeType: "video/webm",
            // MediaStreamRecorder, StereoAudioRecorder, WebAssemblyRecorder
            // CanvasRecorder, GifRecorder, WhammyRecorder
            recorderType: MediaStreamRecorder,
            timeSlice: 1000,
            ondataavailable: function (blob) {},
            checkForInactiveTracks: true,
            onTimeStamp: function (timestamp) {},
            previewStream: function (stream) {},
          })
        );

        // ELSE IF USER WANTS VIRTUAL BACKGROUND TO BE USED
        // const recorder = new RecordRTC(stream, {
        //   type: 'canvas',
        //   mimeType: 'video/webm',
        //   recorderType: CanvasRecorder,
        //   timeSlice: 1000,
        //   ondataavailable: function(blob) {},
        //   checkForInactiveTracks: true,
        //   onTimeStamp: function(timestamp) {},
        //   previewStream: function(stream) {},
        // });

        setIsCameraOn(true);
      });
  }, []);

  useEffect(() => {
    if (!videoRecorder) {
      return;
    }
    // player.on("deviceReady", function () {
    // });

    videoRecorder.onStateChanged((state) => {});
    // player.on("progressRecord", function () {
    // });
    // player.on("finishRecord", function () {
    // });

    return () => {
      videoRecorder?.destroy();
    };
  }, [videoRecorder]);

  useEffect(() => {
    if (recordedVideo) {
      // if you put onRecordStop directly into player.on("finishRecord")
      // it overwrite with the state from whatever the first question was
      recordState.stopRecording(recordedVideo);
      setRecordedVideo(undefined);
    }
  }, [recordedVideo]);

  useEffect(() => {
    if (!recordState) {
      return;
    }
    videoRecorder?.reset();
    setRecordStartCountdown(0);
    setRecordStopCountdown(0);
    setRecordDurationCounter(0);
    setIsCameraOn(false);
  }, [recordState?.curAnswer?.answer._id]);

  useEffect(() => {
    if (!recordState.isRecording || !recordState?.curAnswer?.minVideoLength) {
      return;
    }
    if (recordDurationCounter > recordState?.curAnswer?.minVideoLength) {
      videoRecorder?.stopRecording();
    }
  }, [recordDurationCounter]);

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

  useInterval(
    (isCancelled) => {
      if (isCancelled()) {
        return;
      }
      const counter = recordStopCountdown - 1;
      setRecordStopCountdown(counter);
      if (counter <= 0) {
        videoRecorder?.stopRecording();
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
    stopRecording();
  }, [stopRequests]);

  function startRecording() {
    if (countdownInProgress) {
      return;
    }
    setRecordStartCountdown(3);
  }

  function stopRecording() {
    if (countdownInProgress) {
      return;
    }
    setRecordStopCountdown(2);
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
      stopRecording();
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
      data-cy="recorder"
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
          visibility: isCameraOn ? "inherit" : "hidden",
        }}
      >
        Please get into position by facing forward and lining up with the
        outline.
      </Typography>
      <div data-vjs-player style={{ height, width }}>
        <video
          data-cy="video-recorder"
          className="video-js vjs-default-skin"
          playsInline
          ref={(e) => setVideoRef(e || undefined)}
        />
        <div
          data-cy="outline"
          className={classes.overlay}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            opacity: recordState.isRecording ? 0.5 : 0.75,
            visibility: isCameraOn ? "visible" : "hidden",
            backgroundImage: `url(${overlay})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "contain",
          }}
        />
        <Typography
          data-cy="countdown-message"
          variant="h2"
          align="center"
          style={{
            color: "white",
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
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
          visibility: isCameraOn ? "visible" : "hidden",
        }}
      >
        <IconButton
          onClick={recordState.isRecording ? stopRecording : startRecording}
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
            if (e.target.files === null) {
              return;
            } else {
              recordState.stopRecording(e.target.files[0]);
            }
          }}
        />
      </div>
    </div>
  );
}

export default VideoRecorder;
