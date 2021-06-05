/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

/** VIDEOJS DOESN'T WORK IF TYPESCRIPT... */

import React, { useEffect, useState } from "react";
import videojs from "video.js";
import { Button, IconButton, Typography } from "@material-ui/core";
import FiberManualRecordIcon from "@material-ui/icons/FiberManualRecord";
import StopIcon from "@material-ui/icons/Stop";

import useInterval from "hooks/task/use-interval";
import overlay from "images/face-position-white.png";

const videoJsOptions = {
  fluid: true,
  aspectRatio: "16:9",
  controls: true,
  bigPlayButton: false,
  controlBar: {
    fullscreenToggle: false,
    volumePanel: false,
    recordToggle: false,
    deviceButton: false,
  },
  plugins: {
    record: {
      audio: true,
      video: true,
      debug: true,
      maxLength: 60,
    },
  },
};

function VideoRecorder({
  classes,
  curAnswer,
  recordState,
  height,
  width,
  onRecordStart,
  onRecordStop,
}) {
  const [videoRef, setVideoRef] = useState();
  const [videoRecorderRef, setVideoRecorderRef] = useState();
  const [recordStartCountdown, setRecordStartCountdown] = useState(0);
  const [recordStopCountdown, setRecordStopCountdown] = useState(0);
  const [recordDurationCounter, setRecordDurationCounter] = useState(0);
  const [recordedVideo, setRecordedVideo] = useState();
  const [isCameraOn, setIsCameraOn] = useState(false);

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

  useEffect(() => {
    if (recordedVideo) {
      onRecordStop(recordedVideo);
      setRecordedVideo(undefined);
    }
  }, [recordedVideo]);

  useEffect(() => {
    videoRecorderRef?.record().reset();
    setRecordStartCountdown(0);
    setRecordStopCountdown(0);
    setRecordDurationCounter(0);
    setIsCameraOn(false);
  }, [curAnswer.answer._id]);

  useEffect(() => {
    if (!recordState.isRecording || !curAnswer.minVideoLength) {
      return;
    }
    if (recordDurationCounter > curAnswer.minVideoLength) {
      videoRecorderRef?.record().stop();
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
        videoRecorderRef?.record().start();
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
        videoRecorderRef?.record().stop();
      }
    },
    recordStopCountdown > 0 ? 1000 : null
  );

  function startRecording() {
    onRecordStart();
    setRecordStartCountdown(3);
  }

  function stopRecording() {
    setRecordStopCountdown(2);
  }

  function renderOverlays() {
    return (
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "black",
          opacity: 0.25,
        }}
      >
        <Button></Button>
        <div
          data-cy="outline"
          style={{
            width: "100%",
            height: "100%",
            // opacity: recordState.isRecording ? 0.5 : 0.75,
            visibility: isCameraOn ? "visible" : "hidden",
            backgroundImage: `url(${overlay})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "contain",
          }}
        ></div>
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
            visibility: recordState.isRecording ? "visible" : "hidden",
          }}
        >
          {recordStartCountdown
            ? "Recording starts in"
            : recordStopCountdown
            ? "Recording ends in"
            : Math.max(
                Math.ceil(
                  (curAnswer.minVideoLength || 0) - recordDurationCounter
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
            visibility: recordState.isRecording ? "visible" : "hidden",
          }}
        >
          {recordStartCountdown ||
            recordStopCountdown ||
            Math.max(
              Math.ceil(
                (curAnswer.minVideoLength || 0) - recordDurationCounter
              ),
              0
            ) ||
            ""}
        </Typography>
      </div>
    );
  }

  return (
    <div
      data-cy="recorder"
      style={{
        position: "absolute",
        visibility: curAnswer.videoSrc ? "hidden" : "visible",
      }}
    >
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
        {renderOverlays()}
      </div>
      <div
        data-cy="controls"
        className={classes.row}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          // visibility: isCameraOn ? "visible" : "hidden",
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
        style={{ justifyContent: "center", marginTop: 10 }}
      >
        <Button
          variant="outlined"
          color="primary"
          disableElevation
          className={classes.button}
        >
          Upload File
          <input
            hidden
            data-cy="upload-file"
            type="file"
            accept="audio/*,video/*"
            onChange={(e) => onRecordStop(e.target.files[0])}
          />
        </Button>
      </div>
    </div>
  );
}

export default VideoRecorder;
