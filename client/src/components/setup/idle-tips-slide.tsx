/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { Paper, Typography } from "@material-ui/core";
import { useWithWindowSize } from "hooks/use-with-window-size";
import React from "react";
import ReactPlayer from "react-player";
export function IdleTipsSlide(props: {
  classes: Record<string, string>;
}): JSX.Element {
  const { classes } = props;
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
    <Paper className={classes.card}>
      <Typography variant="h3" className={classes.title}>
        Recording an idle video.
      </Typography>
      <div className={classes.column}>
        <Typography variant="h6" className={classes.text}>
          In this video, you will learn how to record an idle video and why it
          is important.
        </Typography>
      </div>
      <div
        className={classes.block}
        style={{
          alignSelf: "center",
          height: height + 50,
          width: width,
        }}
      >
        <div
          style={{
            position: "absolute",
          }}
        >
          <div
            style={{
              backgroundColor: "#000",
              height: height,
              width: width,
              color: "white",
            }}
          >
            <ReactPlayer
              data-cy="video-player"
              url={
                "https://static-v2.mentorpal.org/videos/60bad2ab733e6a54b909a351/6098b41257ab183da46cf777/20210629T002928Z/web.mp4"
              }
              controls={true}
              playing={true}
              height={height}
              width={width}
              playsinline
              webkit-playsinline="true"
              progressInterval={100}
            />
          </div>
        </div>
      </div>
    </Paper>
  );
}
