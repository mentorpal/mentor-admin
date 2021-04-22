/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

/** VIDEOJS DOESN'T WORK IF TYPESCRIPT... */

import React, { useState } from "react";
import { Button } from "@material-ui/core";
import videojs from "video.js";

import { MentorType } from "types";

const videoJsOptions = {
  controls: true,
  bigPlayButton: false,
  fluid: false,
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
}) {
  const [answerId, setAnswerId] = useState(); // string
  const [videoWidth, setVideoWidth] = useState(0); // number
  const [videoHeight, setVideoHeight] = useState(0); // number
  const [videoNode, setVideoNode] = useState(); // HTMLVideoElement
  const [player, setPlayer] = useState(); // VideoJsPlayer
  const [recordedVideo, setRecordedVideo] = useState(); // Blob

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const handleResize = () => {
      let recorderHeight = Math.max(window.innerHeight - 550, 300);
      let recorderWidth = (recorderHeight / 9) * 16;
      if (window.innerHeight > window.innerWidth) {
        recorderWidth = window.innerWidth;
        recorderHeight = (recorderWidth / 16) * 9;
      }
      setVideoHeight(recorderHeight);
      setVideoWidth(recorderWidth);
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
      console.log("onPlayerReady", player);
    });
    player.on("deviceReady", () => {
      console.log("device is ready!");
    });
    player.on("startRecord", function () {
      console.log("started recording!");
    });
    player.on("finishRecord", function () {
      console.log("finished recording: ", player.recordedData);
      setRecordedVideo(player.recordedData);
    });
    player.on("error", (element, error) => {
      console.warn(error);
    });
    player.on("deviceError", () => {
      console.error("device error:", player.deviceErrorCode);
    });
    return () => {
      player?.dispose();
    };
  }, [videoNode]);

  if (!mentorId || mentorType !== MentorType.VIDEO || !curAnswer) {
    return <div />;
  }

  const video = curAnswer.recordedAt
    ? `https://video.mentorpal.org/videos/mentors/${mentorId}/web/${curAnswer._id}.mp4`
    : undefined;

  return (
    <div
      data-vjs-player
      className={classes.block}
      style={{ alignSelf: "center", height: videoHeight, width: videoWidth }}
    >
      <video
        data-cy="video-recorder"
        ref={(e) => setVideoNode(e || undefined)}
        playsInline
        className="video-js vjs-default-skin"
      >
        {video ? <source src={video} type="video/mp4" /> : undefined}
      </video>
      {recordedVideo ? (
        <Button
          data-cy="upload-video"
          variant="contained"
          color="primary"
          disableElevation
          onClick={() => onUpload(recordedVideo)}
        >
          Upload
        </Button>
      ) : undefined}
    </div>
  );
}

export default VideoPlayer;
