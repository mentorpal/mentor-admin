/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useState, useRef } from "react";
import ReactPlayer from "react-player";
import {
  Button,
  Slider,
  CircularProgress,
  Typography,
} from "@material-ui/core";
import { useWithWindowSize } from "hooks/use-with-window-size";
import { UseWithRecordState } from "hooks/graphql/use-with-record-state";
import VideoRecorder from "./video-recorder";
import overlay from "images/face-position-white.png";
import { equals } from "helpers";

function VideoPlayer(props: {
  classes: Record<string, string>;
  recordState: UseWithRecordState;
}): JSX.Element {
  const reactPlayerRef = useRef<ReactPlayer>(null);
  const [trim, setTrim] = useState([0, 100]);
  const [trimInProgress, setTrimInProgress] = useState<boolean>(false);
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
  const upload = recordState.uploads.find(
    (u) => u.question._id === recordState.curAnswer?.answer.question._id
  );
  const isCancelling = upload ? upload.isCancelling : false;
  const isUploading = recordState.curAnswer?.isUploading;
  const isTrimming =
    isFinite(videoLength) && !(trim[0] === 0 && trim[1] === 100);
  type StartAndEnd = [number, number];

  React.useEffect(() => {
    setVideoLength(0);
    setTrim([0, 100]);
  }, [recordState.curAnswer?.videoSrc, recordState.curAnswer?.answer._id]);
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
    if (duration && state.played >= trim[1] / 100 && !trimInProgress) {
      reactPlayerRef.current.seekTo(duration[0]);
    }
  }

  function onUpdateTrim(newTrimValues: StartAndEnd): void {
    if (!trimInProgress) setTrimInProgress(true);
    if (!reactPlayerRef?.current || equals(trim, newTrimValues)) {
      return;
    }
    const duration = sliderToVideoDuration();
    if (duration) {
      reactPlayerRef.current.seekTo(
        duration[newTrimValues[1] !== trim[1] ? 1 : 0]
      );
      setTrim(newTrimValues);
    }
  }

  return (
    <div
      className={classes.block}
      style={{
        marginLeft: "auto",
        marginRight: "auto",
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
          visibility:
            recordState.curAnswer?.videoSrc || isUploading
              ? "visible"
              : "hidden",
        }}
      >
        <Typography
          data-cy="warning"
          style={{
            textAlign: "center",
            visibility:
              videoLength < (recordState.curAnswer?.minVideoLength || 0)
                ? "visible"
                : "hidden",
          }}
        >
          Video should be {recordState.curAnswer?.minVideoLength} seconds long
          but is only {videoLength} seconds long.
        </Typography>
        <div
          style={{
            backgroundColor: "#000",
            height: height,
            width: width,
            color: "white",
          }}
        >
          <div
            data-cy="upload-in-progress-notifier"
            style={{
              width: "100%",
              height: "100%",
              textAlign: "center",
              position: "absolute",
              justifyContent: "center",
              top: "25%",
              visibility: isUploading ? "visible" : "hidden",
            }}
          >
            <CircularProgress />
            <p></p>
            {isCancelling ? "Cancelling your upload." : "Upload in progress"}
            <p></p>
            {!isCancelling
              ? "You may continue to record other questions."
              : undefined}
          </div>
          <ReactPlayer
            data-cy="video-player"
            ref={reactPlayerRef}
            url={recordState.curAnswer?.videoSrc}
            controls={true}
            playing={!isUploading && !trimInProgress}
            height={height}
            width={width}
            playsinline
            webkit-playsinline="true"
            progressInterval={100}
            onProgress={onVideoProgress}
            onDuration={(d) => setVideoLength(d)}
            style={{
              visibility: isUploading ? "hidden" : "inherit",
            }}
          />
          <div
            data-cy="outline"
            className={classes.overlay}
            style={{
              width: width,
              height: height,
              position: "absolute",
              top: 25,
              bottom: 0,
              left: 0,
              right: 0,
              opacity: recordState.isRecording ? 0.5 : 0.75,
              visibility: trimInProgress ? "visible" : "hidden",
              backgroundImage: `url(${overlay})`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              backgroundSize: "contain",
            }}
          />
        </div>
        <Slider
          data-cy="slider"
          valueLabelDisplay="on"
          valueLabelFormat={(x) => {
            if (!isFinite(videoLength)) {
              return x;
            }
            const seconds = (x / 100) * videoLength;
            const date = new Date(0);
            date.setSeconds(seconds);
            return date.toISOString().substr(15, 4);
          }}
          aria-labelledby="range-slider"
          getAriaValueText={sliderText}
          value={trim}
          onChange={(e, v) => {
            if (Array.isArray(v) && v.length === 2) onUpdateTrim([v[0], v[1]]);
          }}
          onChangeCommitted={() => {
            setTrimInProgress(false);
          }}
          disabled={isUploading}
          style={{
            visibility: recordState.curAnswer?.videoSrc ? "visible" : "hidden",
          }}
        />
        <div className={classes.row} style={{ justifyContent: "center" }}>
          <Button
            data-cy="rerecord-video"
            variant="outlined"
            color="primary"
            disableElevation
            disabled={isUploading}
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
              isUploading
                ? false
                : isTrimming
                ? false
                : !recordState.curAnswer?.recordedVideo
            }
            className={classes.button}
            onClick={() => {
              if (isUploading) {
                recordState.cancelUpload(upload!);
              } else if (isTrimming) {
                const trimStart = (trim[0] / 100) * videoLength;
                const trimEnd = (trim[1] / 100) * videoLength;
                recordState.uploadVideo({ start: trimStart, end: trimEnd });
              } else {
                recordState.uploadVideo();
              }
            }}
            style={{ marginRight: 15 }}
          >
            {isUploading
              ? "Cancel"
              : isTrimming
              ? "Trim Video"
              : "Upload Video"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default VideoPlayer;
