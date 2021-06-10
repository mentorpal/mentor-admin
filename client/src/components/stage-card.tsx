/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import PropTypes from "prop-types";
import {
  Box,
  Card,
  CardContent,
  LinearProgress,
  Typography,
} from "@material-ui/core";
import { createStyles, withStyles } from "@material-ui/core/styles";

const StageProgressBar = withStyles((theme) =>
  createStyles({
    root: {
      height: 10,
      borderRadius: 5,
    },
    colorPrimary: {
      backgroundColor:
        theme.palette.grey[theme.palette.type === "light" ? 200 : 700],
    },
    bar: {
      borderRadius: 5,
      backgroundColor: "#1a90ff",
    },
  })
)(LinearProgress);

function StageCard(props: { value: number }): JSX.Element {
  const percent = Math.round((props.value / 20) * 100);
  return (
    <Box display="flex" width="100%" mt={2} alignItems="center">
      <Box width="33%" alignItems="center"></Box>
      <Card style={{ width: "33%" }} data-cy="stage-card">
        <CardContent>
          <Typography variant="body1" color="textSecondary">
            Scope: Scripted
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Your mentor can respond to questions picked from a list.
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Next Goal: Interactive (?)
          </Typography>
          <StageProgressBar
            data-cy="progress-bar"
            variant="determinate"
            {...{ value: percent }}
          />
          <Typography variant="body2" color="textSecondary">
            {props.value} / {20} ({percent}%)
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

StageCard.propTypes = {
  /**
   * The value of the progress indicator for the determinate and buffer variants.
   * Value between 0 and 100.
   */
  value: PropTypes.number.isRequired,
};

export default StageCard;
