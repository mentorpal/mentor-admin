/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

/** VIDEOJS DOESN'T WORK IF TYPESCRIPT... */

import React, { useState, useRef } from "react";
import ReactPlayer from "react-player";
import videojs from "video.js";
import { Button, Slider } from "@material-ui/core";

import { UPLOAD_ENTRYPOINT } from "api";
import { MentorType } from "types";

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
  mentorId, // string | undefined
  mentorType, // MentorType | undefined
  curAnswer, // Answer | undefined
  onUpload, // (video: File) => void
  onRerecord, // () => void
  onTrim, // (video: File, startTime: number, endTime: number) => void
  isUploading, // boolean
}) {
  const [answerId, setAnswerId] = useState(); // string
  const [videoDimension, setVideoDimension] = useState({ height: 0, width: 0 });
  const [videoRecorderNode, setVideoRecorderNode] = useState(); // HTMLVideoElement
  const [videoRecorder, setVideoRecorder] = useState(); // VideoJsPlayer
  const [recordedVideo, setRecordedVideo] = useState(); // File
  const [videoSrc, setVideoSrc] = useState(undefined); // string
  const [videoDuration, setVideoDuration] = useState(0);
  const [sliderValue, setSliderValue] = useState([0, 100]);
  const reactPlayer = useRef(null);

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const handleResize = () => {
      let recorderHeight = Math.max(window.innerHeight - 600, 300);
      let recorderWidth = (recorderHeight / 9) * 16;
      if (window.innerHeight > window.innerWidth) {
        recorderWidth = window.innerWidth;
        recorderHeight = (recorderWidth / 16) * 9;
      }
      setVideoDimension({ height: recorderHeight, width: recorderWidth });
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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
    player.on("finishRecord", function () {
      const file = new File([player.recordedData], "video.mp4");
      setRecordedVideo(file);
      player.record().reset();
    });
    player.on("error", (element, error) => {
      console.warn(error);
    });
    player.on("deviceError", () => {
      console.error("device error: ", player.deviceErrorCode);
    });
    return () => {
      player?.dispose();
    };
  }, [videoRecorderNode]);

  React.useEffect(() => {
    if (curAnswer._id === answerId) {
      return;
    }
    videoRecorder?.record().reset();
    setRecordedVideo(undefined);
    setAnswerId(curAnswer._id);
    setSliderValue([0, 100]);
  }, [curAnswer]);

  React.useEffect(() => {
    if (recordedVideo) {
      setVideoSrc(URL.createObjectURL(recordedVideo));
    } else if (curAnswer.recordedAt) {
      setVideoSrc(
        `${UPLOAD_ENTRYPOINT}/mentors/${mentorId}/${curAnswer._id}.mp4`
      );
    } else {
      setVideoSrc(undefined);
    }
  }, [curAnswer.recordedAt, recordedVideo]);

  React.useEffect(() => {
    if (isUploading) {
      setSliderValue([0, 100]);
    }
  }, [isUploading]);

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
    onTrim(recordedVideo, startTime, endTime);
  }

  if (!mentorId || mentorType !== MentorType.VIDEO || !curAnswer) {
    return <div />;
  }

  return (
    <div
      className={classes.block}
      style={{
        alignSelf: "center",
        height: videoDimension.height + 50,
        width: videoDimension.width,
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
            height: videoDimension.height,
            width: videoDimension.width,
          }}
        >
          <video
            data-cy="video-recorder"
            className="video-js vjs-default-skin"
            playsInline
            ref={(e) => setVideoRecorderNode(e || undefined)}
          />
        </div>
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
            height: videoDimension.height,
            width: videoDimension.width,
          }}
        >
          <ReactPlayer
            data-cy="video-player"
            ref={reactPlayer}
            url={videoSrc}
            controls={true}
            playing={!isUploading}
            height={videoDimension.height}
            width={videoDimension.width}
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
            disabled={!recordedVideo || isUploading}
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
      </div>
    </div>
  );
}

export default VideoPlayer;
