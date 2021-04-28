/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

/** VIDEOJS DOESN'T WORK IF TYPESCRIPT... */

import React, { useState, useRef } from "react";
import FFMPEG from "react-ffmpeg";
import ReactPlayer from "react-player";
import videojs from "video.js";
import { Button, Slider } from "@material-ui/core";

import { VIDEO_ENTRYPOINT } from "api";
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
  onUpload, // (video: Blob) => void
  onRerecord, // () => void
}) {
  const [answerId, setAnswerId] = useState(); // string
  const [videoDimension, setVideoDimension] = useState({ height: 0, width: 0 });
  const [videoRecorderNode, setVideoRecorderNode] = useState(); // HTMLVideoElement
  const [videoRecorder, setVideoRecorder] = useState(); // VideoJsPlayer
  const [recordedVideo, setRecordedVideo] = useState(); // File
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

  function onSliderChanged(event, newValue) {
    if (!reactPlayer.current) {
      return;
    }
    // getDuration and onDuration keep returning infinity sometimes...
    if (!isFinite(videoDuration)) {
      setVideoDuration(reactPlayer.current.getDuration());
      return;
    }
    reactPlayer.current.seekTo((newValue[0] / 100) * videoDuration);
    setSliderValue(newValue);
  }

  function onVideoProgress({ played }) {
    if (!reactPlayer.current) {
      return;
    }
    // getDuration and onDuration keep returning infinity sometimes...
    if (!isFinite(videoDuration)) {
      setVideoDuration(reactPlayer.current.getDuration());
      return;
    }
    if (played >= sliderValue[1] / 100) {
      reactPlayer.current.seekTo((sliderValue[0] / 100) * videoDuration);
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

  async function trimVideo() {
    if (!isFinite(videoDuration) || !recordedVideo) {
      return;
    }
    await FFMPEG.process(
      recordedVideo,
      `-ss ${(sliderValue[0] / 100) * videoDuration} -t ${
        (sliderValue[1] / 100) * videoDuration
      } -c:v copy -c:a copy`,
      function (e) {
        const video = e.result;
        console.log(video);
        setRecordedVideo(video);
        setSliderValue([0, 100]);
      }.bind(this)
    );
  }

  if (!mentorId || mentorType !== MentorType.VIDEO || !curAnswer) {
    return <div />;
  }
  let videoSrc = undefined;
  if (recordedVideo) {
    videoSrc = URL.createObjectURL(recordedVideo);
  } else if (curAnswer.recordedAt) {
    videoSrc = `${VIDEO_ENTRYPOINT}/mentors/${mentorId}/${curAnswer._id}.mp4`;
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
        <ReactPlayer
          data-cy="video-player"
          ref={reactPlayer}
          url={videoSrc}
          controls={true}
          playing={true}
          height={videoDimension.height}
          width={videoDimension.width}
          playsinline
          webkit-playsinline="true"
          onProgress={onVideoProgress}
          onDuration={(d) => setVideoDuration(d)}
        />
        <Slider
          data-cy="slider"
          value={sliderValue}
          onChange={onSliderChanged}
          valueLabelDisplay="auto"
          aria-labelledby="range-slider"
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
            disabled={!recordedVideo}
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
                !isFinite(videoDuration)
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
