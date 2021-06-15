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
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";

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
  const stages = [
    {
      name: "Incomplete",
      index: 0,
      description: "This Mentor can't be built yet.",
      floor: 0,
      max: 5,
    },
    {
      name: "Scripted",
      index: 1,
      description: "This Mentor can select questions from a list",
      floor: 5,
      max: 20,
    },
    {
      name: "Interactive",
      index: 2,
      description: "This Mentor can respond to simple questions.",
      floor: 20,
      max: 50,
    },
    {
      name: "Specialist",
      index: 3,
      description: "This mentor can answer questions within a specific topic.",
      floor: 50,
      max: 150,
    },
    {
      name: "Conversational",
      index: 4,
      description: "This mentor can respond to questions with some nuance.",
      floor: 150,
      max: 250,
    },
    {
      name: "Full-Subject",
      index: 5,
      description:
        "Your mentor is equipped to answer questions within a broad subject.",
      floor: 250,
      max: 1000,
    },
    {
      name: "Life-Story",
      index: 6,
      description:
        "Your mentor can hold a natural conversation. Congratulations!",
      floor: 1000,
      max: value + 1,
    },
    {
      name: "None",
      index: 7,
      description: "you've reached the final stage",
      floor: value,
      max: value,
    },
  ];
  const currentStage = stages.find((stage) => {
    return stage.max - 1 >= value;
  });
  return {
    ...currentStage,
    ...{
      next: stages[currentStage!.index + 1],
      percent: Math.round((value / currentStage!.max) * 100),
    },
  };
};
export default function StageCard(props: { value: number }): JSX.Element {
  const currentStage = StageSelect(props.value);
  const [open, setOpen] = React.useState(currentStage.floor == props.value);

  return (
    <div>
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

            {currentStage!.max != props.value + 1 && (
              <div>
                <StageProgressBar
                  data-cy="progress-bar"
                  variant="determinate"
                  {...{ value: currentStage!.percent }}
                />
                <Typography variant="body2" color="textSecondary">
                  {props.value} / {currentStage!.max} ({currentStage!.percent}%)
                </Typography>
              </div>
            )}
          </CardContent>
        </Card>
      </Box>
      <Snackbar
        open={open}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        autoHideDuration={6000}
        onClose={() => {
          setOpen(false);
        }}
      >
        <MuiAlert elevation={6} variant="filled" severity="success">
          <Typography variant="body1">
            Your mentor has reached the {currentStage.name} stage!
          </Typography>
          <Typography variant="body2">
            You have {props.value} total questions.
          </Typography>
        </MuiAlert>
      </Snackbar>
    </div>
  );
}

StageCard.propTypes = {
  value: PropTypes.number.isRequired,
};
