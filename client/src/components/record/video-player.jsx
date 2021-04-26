/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

/** VIDEOJS DOESN'T WORK IF TYPESCRIPT... */

import React, { useState, useRef } from "react";
import { Button, Slider } from "@material-ui/core";
import videojs from "video.js";
import ReactPlayer from "react-player";

import { MentorType } from "types";
import { VIDEO_ENTRYPOINT } from "api";

const videoJsOptions = {
  controls: true,
  plugins: {
    record: {
      audio: true,
      video: true,
      maxLength: 60,
      debug: true,
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
  const [videoDims, setVideoDims] = useState({ height: 0, width: 0 });
  const [videoNode, setVideoNode] = useState(); // HTMLVideoElement
  const [player, setPlayer] = useState(); // VideoJsPlayer
  const [recordedVideo, setRecordedVideo] = useState(); // Blob
  const [sliderValue, setSliderValue] = React.useState([0, 100]); // slider value
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
      setVideoDims({ height: recorderHeight, width: recorderWidth });
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  React.useEffect(() => {
    if (curAnswer._id != answerId) {
      if (player) {
        player.reset();
        setRecordedVideo(undefined);
      }
      setAnswerId(curAnswer._id);
    }
  }, [curAnswer]);

  React.useEffect(() => {
    if (!videoNode || !curAnswer) {
      return;
    }
    const player = videojs(videoNode, videoJsOptions, function onPlayerReady() {
      setPlayer(player);
    });
    player.on("finishRecord", function () {
      setRecordedVideo(player.recordedData);
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
  }, [videoNode]);

  function onSliderChanged(event, newValue) {
    if (reactPlayer.current) {
      setSliderValue(newValue);
      reactPlayer.current.seekTo(newValue[0] / 100, "fraction");
    }
  }

  function onVideoProgress({ played }) {
    if (reactPlayer.current && played >= sliderValue[1] / 100) {
      reactPlayer.current.seekTo(sliderValue[0] / 100, "fraction");
    }
  }

  function rerecordVideo() {
    setRecordedVideo(undefined);
    onRerecord();
  }

  if (!mentorId || mentorType !== MentorType.VIDEO || !curAnswer) {
    return <div />;
  }

  const video = curAnswer.recordedAt
    ? `${VIDEO_ENTRYPOINT}/mentors/${mentorId}/${curAnswer._id}.mp4`
    : undefined;

  if (video) {
    return (
      <div
        className={classes.block}
        style={{
          alignSelf: "center",
          height: videoDims.height,
          width: videoDims.width,
        }}
      >
        <ReactPlayer
          data-cy="video-player"
          ref={reactPlayer}
          className={classes.video}
          url={video}
          controls={true}
          playing={true}
          height={videoDims.height - 40}
          width={videoDims.width}
          playsinline
          webkit-playsinline="true"
          onProgress={onVideoProgress}
        />
        <Slider
          data-cy="slider"
          value={sliderValue}
          onChange={onSliderChanged}
          valueLabelDisplay="auto"
          aria-labelledby="range-slider"
        />
        <div className={classes.row} style={{ justifyContent: "center" }}>
          <Button
            data-cy="rerecord-video"
            variant="contained"
            color="primary"
            disableElevation
            onClick={rerecordVideo}
            style={{ marginRight: 15 }}
          >
            Re-Record
          </Button>
          <Button
            data-cy="trim-video"
            variant="outlined"
            color="primary"
            className={classes.button}
            disableElevation
          >
            Trim Video
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={classes.block}
      style={{
        alignSelf: "center",
        height: videoDims.height + 40,
      }}
    >
      <div
        data-vjs-player
        style={{
          height: videoDims.height,
          width: videoDims.width,
        }}
      >
        <video
          data-cy="video-recorder"
          className="video-js vjs-default-skin"
          playsInline
          ref={(e) => setVideoNode(e || undefined)}
        />
      </div>
      <div
        className={classes.row}
        style={{ justifyContent: "center", marginTop: 20 }}
      >
        <Button
          data-cy="upload-video"
          variant="contained"
          color="primary"
          className={classes.button}
          disabled={!recordedVideo}
          disableElevation
          onClick={() => onUpload(recordedVideo)}
        >
          Upload Video
        </Button>
      </div>
    </div>
  );
}

export default VideoPlayer;
