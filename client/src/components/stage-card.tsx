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
  Tooltip,
} from "@material-ui/core";
import { createStyles, withStyles } from "@material-ui/core/styles";
import { HelpOutline } from "@material-ui/icons";

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
const StageSelect = (value: number) => {
  var stages = [
    {
      name: "Incomplete",
      index: 0,
      description: "This Mentor can't be built yet.",
      max: 5,
    },
    {
      name: "Minimal",
      index: 1,
      description: "This Mentor can select questions from a list",
      max: 8,
    },
    {
      name: "Good As Can Be",
      index: 2,
      description: "This Mentor is as good as it gets",
      max: value,
    },
    {
      name: "None",
      index: 3,
      description: "you've reached the final stage",
      max: value,
    },
  ];
  var currentStage = stages.find((stage) => {
    return stage.max >= value;
  });
  return {
    ...currentStage,
    ...{
      next: stages[currentStage!.index + 1],
      percent: Math.round((value / currentStage!.max) * 100),
    },
  };
};
function StageCard(props: { value: number }): JSX.Element {
  const currentStage = StageSelect(props.value);

  return (
    <Box display="flex" width="100%" mt={2} alignItems="center">
      <Box width="33%" alignItems="center"></Box>
      <Card style={{ width: "33%" }} data-cy="stage-card">
        <CardContent>
          <Typography variant="body1" color="textSecondary">
            Scope: {currentStage!.name}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            {currentStage!.description}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Next Goal: {currentStage!.next!.name}
            {"   "}
            <Tooltip
              title={
                <React.Fragment>
                  <Typography color="inherit">
                    {currentStage!.next!.name}
                  </Typography>
                  {currentStage!.next!.description}
                </React.Fragment>
              }
              data-cy="next-stage-info"
            >
              <HelpOutline fontSize="small" />
            </Tooltip>
          </Typography>
          <StageProgressBar
            data-cy="progress-bar"
            variant="determinate"
            {...{ value: currentStage!.percent }}
          />
          <Typography variant="body2" color="textSecondary">
            {props.value} / {currentStage!.max} ({currentStage!.percent}%)
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
