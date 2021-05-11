/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

/** VIDEOJS DOESN'T WORK IF TYPESCRIPT... */

import React, { useState, useRef } from "react";
import ReactPlayer from "react-player";
import videojs from "video.js";
import { Button, Slider, Typography } from "@material-ui/core";

import { UPLOAD_ENTRYPOINT } from "api";
import { MentorType } from "types";
import { useWithWindowSize } from "hooks/use-with-window-size";
import useInterval from "hooks/task/use-interval";

const videoJsOptions = {
  controls: true,
  aspectRatio: "16:9",
  fluid: true,
  plugins: {
    record: {
      audio: true,
      video: true,
      debug: true,
      maxLength: 60,
    },
  },
};

function VideoPlayer({
  classes, // Record<string, string>
  mentor, // {id: string, type: MentorType}
  answer, // {id: string, recordedAt: string}
  onUpload, // (params: VideoParams) => void
  onRerecord, // () => void
  isUploading, // boolean
  minLength, // number
}) {
  const [videoRecorderNode, setVideoRecorderNode] = useState(); // HTMLVideoElement
  const [videoRecorder, setVideoRecorder] = useState(); // VideoJsPlayer
  const [recordedVideo, setRecordedVideo] = useState(); // File
  const [videoSrc, setVideoSrc] = useState(undefined); // string
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoCountdown, setVideoCountdown] = useState(minLength);
  const [isRecording, setIsRecording] = useState(false);
  const [sliderValue, setSliderValue] = useState([0, 100]);
  const reactPlayer = useRef(null);

  const { windowWidth, windowHeight } = useWithWindowSize();
  let recorderHeight = Math.max(windowHeight - 600, 300);
  let recorderWidth = (recorderHeight / 9) * 16;
  if (windowHeight > windowWidth) {
    recorderWidth = windowWidth;
    recorderHeight = (recorderWidth / 16) * 9;
  }

  React.useEffect(() => {
    if (!videoRecorderNode || videoRecorder) {
      return;
    }
    const player = videojs(
      videoRecorderNode,
      videoJsOptions,
      function onPlayerReady() {
        setVideoRecorder(player);
      }
    );
    player.on("startRecord", function () {
      setIsRecording(true);
    });
    player.on("finishRecord", function () {
      const file = new File([player.recordedData], "video.mp4");
      setRecordedVideo(file);
      setIsRecording(false);
      player.record().reset();
    });
    return () => {
      player?.dispose();
    };
  }, [videoRecorderNode]);

  React.useEffect(() => {
    videoRecorder?.record().reset();
    setRecordedVideo(undefined);
    setSliderValue([0, 100]);
    setVideoCountdown(minLength);
    setIsRecording(false);
  }, [answer.id]);

  React.useEffect(() => {
    if (recordedVideo) {
      setVideoSrc(URL.createObjectURL(recordedVideo));
    } else if (answer.recordedAt) {
      setVideoSrc(`${UPLOAD_ENTRYPOINT}/mentors/${mentor.id}/${answer.id}.mp4`);
    } else {
      setVideoSrc(undefined);
    }
  }, [answer.recordedAt, recordedVideo]);

  React.useEffect(() => {
    if (isUploading) {
      setSliderValue([0, 100]);
    }
  }, [isUploading]);

  useInterval(
    (isCancelled) => {
      if (isCancelled()) {
        return;
      }
      setVideoCountdown(videoCountdown - 1);
    },
    isRecording ? 1000 : null
  );

  function sliderToVideoDuration() {
    if (!reactPlayer.current) {
      return undefined;
    }
    // getDuration keeps returning infinity sometimes...
    if (!isFinite(videoDuration)) {
      setVideoDuration(reactPlayer.current.getDuration());
      return undefined;
    }
    const startTime = (sliderValue[0] / 100) * videoDuration;
    const endTime = (sliderValue[1] / 100) * videoDuration;
    return [startTime, endTime];
  }

  function onSliderChanged(event, newValue) {
    const duration = sliderToVideoDuration(newValue);
    if (duration) {
      reactPlayer.current.seekTo(duration[0]);
      setSliderValue(newValue);
    }
  }

  function onVideoProgress({ played }) {
    const duration = sliderToVideoDuration(sliderValue);
    if (duration && played >= sliderValue[1] / 100) {
      reactPlayer.current.seekTo(duration[0]);
    }
  }

  function rerecordVideo() {
    videoRecorder?.record().reset();
    setRecordedVideo(undefined);
    setSliderValue([0, 100]);
    setVideoCountdown(minLength);
    setIsRecording(false);
    onRerecord();
  }

  function onFileUploaded(e) {
    const file = e.target.files[0];
    setRecordedVideo(file);
  }

  function trimVideo() {
    if (!isFinite(videoDuration) || !recordedVideo) {
      return;
    }
    const startTime = sliderValue[0] * videoDuration;
    const endTime = sliderValue[1] * videoDuration;
    onUpload(recordedVideo, { start: startTime, end: endTime });
  }

  if (mentor.type !== MentorType.VIDEO) {
    return <div />;
  }

  return (
    <div
      className={classes.block}
      style={{
        alignSelf: "center",
        height: recorderHeight + 50,
        width: recorderWidth,
      }}
    >
      <div
        style={{
          position: "absolute",
          visibility: videoSrc ? "hidden" : "visible",
        }}
      >
        <div
          data-vjs-player
          style={{
            height: recorderHeight,
            width: recorderWidth,
          }}
        >
          <video
            data-cy="video-recorder"
            className="video-js vjs-default-skin"
            playsInline
            ref={(e) => setVideoRecorderNode(e || undefined)}
          />
        </div>
        {isRecording && videoCountdown > 0 ? (
          <Typography
            variant="h2"
            style={{
              color: "red",
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
            }}
          >
            {videoCountdown}
          </Typography>
        ) : undefined}
        <div
          className={classes.row}
          style={{ justifyContent: "center", marginTop: 20 }}
        >
          <input
            data-cy="upload-file"
            type="file"
            accept="audio/*,video/*"
            onChange={onFileUploaded}
          />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          visibility: videoSrc ? "visible" : "hidden",
        }}
      >
        <div
          style={{
            backgroundColor: "#000",
            height: recorderHeight,
            width: recorderWidth,
          }}
        >
          <ReactPlayer
            data-cy="video-player"
            ref={reactPlayer}
            url={videoSrc}
            controls={true}
            playing={!isUploading}
            height={recorderHeight}
            width={recorderWidth}
            playsinline
            webkit-playsinline="true"
            progressInterval={100}
            onProgress={onVideoProgress}
            onDuration={(d) => setVideoDuration(d)}
          />
        </div>
        <Slider
          data-cy="slider"
          value={sliderValue}
          onChange={onSliderChanged}
          valueLabelDisplay="auto"
          aria-labelledby="range-slider"
          disabled={isUploading}
          style={{
            visibility: recordedVideo ? "visible" : "hidden",
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
            onClick={rerecordVideo}
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
              !recordedVideo ||
              isUploading ||
              (isFinite(videoDuration) && videoDuration < minLength)
            }
            className={classes.button}
            onClick={() => onUpload(recordedVideo)}
            style={{ marginRight: 15 }}
          >
            Upload Video
          </Button>
          {recordedVideo ? (
            <Button
              data-cy="trim-video"
              variant="outlined"
              color="primary"
              disableElevation
              disabled={
                (sliderValue[0] == 0 && sliderValue[1] == 100) ||
                !isFinite(videoDuration) ||
                isUploading
              }
              className={classes.button}
              onClick={trimVideo}
            >
              Trim Video
            </Button>
          ) : undefined}
        </div>
        {isFinite(videoDuration) && videoDuration < minLength ? (
          <div style={{ textAlign: "center", color: "red", marginTop: 5 }}>
            Video must be {minLength} seconds long but is only {videoDuration}{" "}
            seconds long
          </div>
        ) : undefined}
      </div>
    </div>
  );
}

export default VideoPlayer;
