/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import React, { useState, useRef } from "react";
import ReactPlayer from "react-player";
import { Button, Slider, Typography } from "@material-ui/core";

import { useWithWindowSize } from "hooks/use-with-window-size";
import VideoRecorder from "./video-recorder";
import { RecordingState } from "hooks/graphql/recording-reducer";
import { CurAnswerState } from "hooks/graphql/use-with-record-state";

function VideoPlayer(props: {
  classes: Record<string, string>;
  curAnswer: CurAnswerState;
  recordState: RecordingState;
  onUpload: () => void;
  onRerecord: () => void;
  onRecordStart: () => void;
  onRecordStop: (video: File) => void;
  onTrim: (start: number, end: number) => void;
}): JSX.Element {
  const [videoLength, setVideoLength] = useState<number>(0);
  const { windowWidth, windowHeight } = useWithWindowSize();
  const reactPlayerRef = useRef<ReactPlayer>(null);

  const {
    classes,
    curAnswer,
    recordState,
    onUpload,
    onRerecord,
    onRecordStart,
    onRecordStop,
    onTrim,
  } = props;

  React.useEffect(() => {
    setVideoLength(0);
  }, [curAnswer.videoSrc, curAnswer.answer._id]);

  React.useEffect(() => {
    if (!reactPlayerRef?.current || !isFinite(videoLength)) {
      return;
    }
    const startTime = (curAnswer.trim[0] / 100) * videoLength;
    if (reactPlayerRef.current.getCurrentTime() < startTime) {
      reactPlayerRef.current.seekTo(startTime);
    }
  }, [curAnswer.trim]);

  const height =
    windowHeight > windowWidth
      ? windowWidth * (9 / 16)
      : Math.max(windowHeight - 600, 300);
  const width =
    windowHeight > windowWidth
      ? windowWidth
      : Math.max(windowHeight - 600, 300) * (16 / 9);

  function onVideoProgress(state: { played: number }) {
    if (!reactPlayerRef?.current || !isFinite(videoLength)) {
      return;
    }
    const startTime = (curAnswer.trim[0] / 100) * videoLength;
    if (state.played >= curAnswer.trim[1] / 100) {
      reactPlayerRef.current.seekTo(startTime);
    }
  }

  return (
    <div
      className={classes.block}
      style={{
        alignSelf: "center",
        height: height + 50,
        width: width,
      }}
    >
      <VideoRecorder
        classes={classes}
        curAnswer={curAnswer}
        recordState={recordState}
        height={height}
        width={width}
        onRecordStart={onRecordStart}
        onRecordStop={onRecordStop}
      />
      <div
        style={{
          position: "absolute",
          visibility: curAnswer.videoSrc ? "visible" : "hidden",
        }}
      >
        <Typography
          data-cy="warning"
          style={{
            textAlign: "center",
            visibility:
              curAnswer.videoSrc &&
              videoLength < (curAnswer.minVideoLength || 0)
                ? "visible"
                : "hidden",
          }}
        >
          Video should be {curAnswer.minVideoLength} seconds long but is only{" "}
          {videoLength} seconds long.
        </Typography>
        <div
          style={{
            backgroundColor: "#000",
            height: height,
            width: width,
          }}
        >
          <ReactPlayer
            data-cy="video-player"
            ref={reactPlayerRef}
            url={curAnswer.videoSrc}
            controls={true}
            playing={!recordState.isUploading}
            height={height}
            width={width}
            playsinline
            webkit-playsinline="true"
            progressInterval={100}
            onProgress={onVideoProgress}
            onDuration={(d) => setVideoLength(d)}
          />
        </div>
        <Slider
          data-cy="slider"
          value={curAnswer.trim}
          onChange={(e, v) => {
            if (Array.isArray(v)) {
              onTrim(v[0], v[1]);
            }
          }}
          valueLabelDisplay="auto"
          aria-labelledby="range-slider"
          disabled={recordState.isSaving || recordState.isUploading}
          style={{
            visibility: curAnswer.videoSrc ? "visible" : "hidden",
          }}
        />
        <div className={classes.row} style={{ justifyContent: "center" }}>
          <Button
            data-cy="rerecord-video"
            variant="outlined"
            color="primary"
            disableElevation
            disabled={recordState.isUploading}
            className={classes.button}
            onClick={onRerecord}
            style={{ marginRight: 15 }}
          >
            Re-Record
          </Button>
          <Button
            data-cy="upload-video"
            variant="contained"
            color="primary"
            disableElevation
            disabled={!curAnswer.recordedVideo || recordState.isUploading}
            className={classes.button}
            onClick={onUpload}
            style={{ marginRight: 15 }}
          >
            Upload Video
          </Button>
          <Button
            data-cy="trim-video"
            variant="outlined"
            color="primary"
            disableElevation
            disabled={
              !curAnswer.videoSrc ||
              (curAnswer.trim[0] === 0 && curAnswer.trim[1] === 100) ||
              !isFinite(videoLength) ||
              recordState.isSaving ||
              recordState.isUploading
            }
            className={classes.button}
            onClick={onUpload}
          >
            Trim Video
          </Button>
        </div>
      </div>
    </div>
  );
}

export default VideoPlayer;
