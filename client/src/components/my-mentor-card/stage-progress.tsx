/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import "styles/layout.css";

export default function StageProgress(props: {
  value: number;
  max: number;
  percent: number;
}): JSX.Element {
  const progressColor = "#FFE194";
  const completeColor = "#57CC99 ";
  return (
    <Box alignItems="center" className="progress-circle">
      <Box position="relative" display="inline-flex">
        <CircularProgress
          data-cy="stage-progress"
          variant="determinate"
          style={{ color: "lightgrey" }}
          value={100}
          size={90}
        />
        <Box
          top={0}
          left={0}
          bottom={0}
          right={0}
          position="absolute"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <CircularProgress
            data-cy="stage-progress"
            variant="determinate"
            value={props.percent}
            style={
              props.percent < 100
                ? { color: progressColor }
                : { color: completeColor }
            }
            size={90}
          />
        </Box>
        <Box
          top={0}
          left={0}
          bottom={0}
          right={0}
          position="absolute"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Typography variant="h5" component="div" color="textSecondary">
            <div className="progressCircle-text">
              <b style={{ fontSize: 20 }}>
                {props.value}/{props.max}
              </b>
              <p style={{ fontSize: 10 }}>Questions</p>
            </div>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
