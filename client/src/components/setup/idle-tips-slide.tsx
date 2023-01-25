/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { Typography } from "@mui/material";
import { useWithWindowSize } from "hooks/use-with-window-size";
import React from "react";
import ReactPlayer from "react-player";
import { Slide } from "./slide";
export function IdleTipsSlide(props: {
  classes: Record<string, string>;
  idleTipsVideoUrl: string;
}): JSX.Element {
  const { classes, idleTipsVideoUrl } = props;
  const { width: windowWidth, height: windowHeight } = useWithWindowSize();
  const height =
    windowHeight > windowWidth
      ? windowWidth * (9 / 16)
      : Math.max(windowHeight - 600, 300);
  const width =
    windowHeight > windowWidth
      ? windowWidth
      : Math.max(windowHeight - 600, 300) * (16 / 9);
  return (
    <Slide
      classes={classes}
      title="Recording an idle video."
      content={
        <div>
          <Typography variant="h6" className={classes.text}>
            In this video, you will learn how to record an idle video and why it
            is important.
          </Typography>
          <ReactPlayer
            data-cy="video-player"
            url={idleTipsVideoUrl}
            controls={true}
            playing={false}
            height={height}
            style={{ marginLeft: "auto", marginRight: "auto" }}
            width={width}
            playsinline
            webkit-playsinline="true"
            progressInterval={100}
          />
        </div>
      }
    />
  );
}
