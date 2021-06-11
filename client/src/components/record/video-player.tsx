/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import React, { useState, useRef } from "react";
import ReactPlayer from "react-player";
import { Button, Slider, Typography } from "@material-ui/core";

import { useWithWindowSize } from "hooks/use-with-window-size";
import { RecordingState } from "hooks/graphql/recording-reducer";
import {
  CurAnswerState,
  UseWithRecordState,
} from "hooks/graphql/use-with-record-state";
import VideoRecorder from "./video-recorder";

function VideoPlayer(props: {
  classes: Record<string, string>;
  recordState: UseWithRecordState;
}): JSX.Element {
  const reactPlayerRef = useRef<ReactPlayer>(null);
  // can't store trim and videoLength in RecordingState because updating recordState will force ReactPlayer to re-render
  const [trim, setTrim] = useState([0, 100]);
  const [videoLength, setVideoLength] = useState<number>(0);
  const { width: windowWidth, height: windowHeight } = useWithWindowSize();
  const { classes, recordState } = props;
  const height =
    windowHeight > windowWidth
      ? windowWidth * (9 / 16)
      : Math.max(windowHeight - 600, 300);
  const width =
    windowHeight > windowWidth
      ? windowWidth
      : Math.max(windowHeight - 600, 300) * (16 / 9);

  React.useEffect(() => {
    setVideoLength(0);
    setTrim([0, 100]);
  }, [recordState.curAnswer.videoSrc, recordState.curAnswer.answer._id]);

  function sliderToVideoDuration(): number[] | undefined {
    if (!reactPlayerRef?.current) {
      return undefined;
    }
    if (!isFinite(videoLength)) {
      setVideoLength(reactPlayerRef.current.getDuration());
      return undefined;
    }
    const startTime = (trim[0] / 100) * videoLength;
    const endTime = (trim[1] / 100) * videoLength;
    return [startTime, endTime];
  }

  function sliderText(value: number, index: number): string {
    const duration = sliderToVideoDuration();
    if (!duration) {
      return "";
    }
    return new Date(duration[index] * 1000).toISOString().substr(14, 5);
  }

  function onVideoProgress(state: { played: number }): void {
    if (!reactPlayerRef?.current) {
      return;
    }
    const duration = sliderToVideoDuration();
    if (duration && state.played >= trim[1] / 100) {
      reactPlayerRef.current.seekTo(duration[0]);
    }
  }

  function onUpdateTrim(value: number | number[]): void {
    if (!Array.isArray(value) || !reactPlayerRef?.current) {
      return;
    }
    const duration = sliderToVideoDuration();
    if (duration) {
      reactPlayerRef.current.seekTo(duration[0]);
      setTrim(value);
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
        height={height}
        width={width}
        recordState={recordState}
      />
      <div
        style={{
          position: "absolute",
          visibility: recordState.curAnswer.videoSrc ? "visible" : "hidden",
        }}
      >
        <Typography
          data-cy="warning"
          style={{
            textAlign: "center",
            visibility:
              recordState.curAnswer.videoSrc &&
              videoLength < (recordState.curAnswer.minVideoLength || 0)
                ? "visible"
                : "hidden",
          }}
        >
          Video should be {recordState.curAnswer.minVideoLength} seconds long
          but is only {videoLength} seconds long.
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
            url={recordState.curAnswer.videoSrc}
            controls={true}
            playing={!recordState.curAnswer.isUploading}
            height={height}
            width={width}
            playsinline
            webkit-playsinline="true"
            progressInterval={100}
            onProgress={onVideoProgress}
            onDuration={(d) => setVideoLength(d)}
            style={{
              visibility: recordState.curAnswer.isUploading
                ? "hidden"
                : "inherit",
            }}
          />
        </div>
        <Slider
          data-cy="slider"
          valueLabelDisplay="auto"
          aria-labelledby="range-slider"
          getAriaValueText={sliderText}
          value={trim}
          onChange={(e, v) => onUpdateTrim(v)}
          disabled={recordState.curAnswer.isUploading}
          style={{
            visibility: recordState.curAnswer.videoSrc ? "visible" : "hidden",
          }}
        />
        <div className={classes.row} style={{ justifyContent: "center" }}>
          <Button
            data-cy="rerecord-video"
            variant="outlined"
            color="primary"
            disableElevation
            disabled={recordState.curAnswer.isUploading}
            className={classes.button}
            onClick={recordState.rerecord}
            style={{ marginRight: 15 }}
          >
            Re-Record
          </Button>
          <Button
            data-cy="upload-video"
            variant="contained"
            color="primary"
            disableElevation
            disabled={
              !recordState.curAnswer.recordedVideo ||
              recordState.curAnswer.isUploading
            }
            className={classes.button}
            onClick={() => recordState.uploadVideo()}
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
              !recordState.curAnswer.videoSrc ||
              (trim[0] === 0 && trim[1] === 100) ||
              !isFinite(videoLength) ||
              recordState.curAnswer.isUploading
            }
            className={classes.button}
            onClick={() =>
              recordState.uploadVideo({ start: trim[0], end: trim[1] })
            }
          >
            Trim Video
          </Button>
        </div>
      </div>
    </div>
  );
}

export default VideoPlayer;
