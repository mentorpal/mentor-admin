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
  Typography,
  Tooltip,
  Avatar,
  CircularProgress,
} from "@material-ui/core";
import StageToast from "./stage-toast";
import { makeStyles } from "@material-ui/core/styles";
import { HelpOutline } from "@material-ui/icons";
import { MentorType } from "types";
import { uploadThumbnail } from "api";

function StageProgress(props: { value: number; max: number; percent: number }) {
  return (
    <Box alignItems="center">
      <Box position="relative" display="inline-flex">
        <CircularProgress
          data-cy="stage-progress"
          variant="determinate"
          style={{ color: "lightgrey" }}
          value={100}
          size={80}
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
            size={80}
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
            {props.value}/{props.max}
          </Typography>
        </Box>
      </Box>
      <Typography variant="body1" color="textSecondary">
        {props.percent}%
      </Typography>
    </Box>
  );
}

StageProgress.propTypes = {
  /**
   * The value of the progress indicator for the determinate variant.
   * Value between 0 and 100.
   */
  value: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  percent: PropTypes.number.isRequired,
};
const useStyles = makeStyles(() => ({
  avatar: {
    width: "100%",
    height: "100%",
  },
  square: {
    position: "relative",
    height: "40%",
    "&::before": {
      display: "block",
      content: "''",
      paddingLeft: "100%",
    },
  },
}));
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
export default function MyMentorCard(props: {
  mentorId: string;
  name: string;
  type: MentorType | undefined;
  title: string;
  lastTrainedAt: string;
  value: number;
  thumbnail: string;
}): JSX.Element {
  const currentStage = StageSelect(props.value);
  const classes = useStyles();
  const thumbnailAvailable = props.thumbnail !== "";
  return (
    <div style={{ marginTop: 2, flexGrow: 1, marginLeft: 25, marginRight: 25 }}>
      <Card data-cy="stage-card">
        <CardContent>
          <Box display="flex" width="100%" alignItems="center">
            <Tooltip
              title={
                <input
                  data-cy="upload-file"
                  type="file"
                  accept="image/*"
                  onChange={(e) => uploadThumbnail("", e!.target!.files![0])}
                />
              }
              interactive
              data-cy="upload-tip"
            >
              <Box alignItems="center">
                <Typography
                  variant="h3"
                  color="textSecondary"
                  data-cy="mentor-card-name"
                >
                  {props.name}
                </Typography>
                <Typography
                  variant="h5"
                  color="textSecondary"
                  data-cy="mentor-card-info"
                >
                  Title: {props.title}
                </Typography>
                <Box
                  className={classes.square}
                  alignItems="center"
                  data-cy="thumbnail-wrapper"
                  width="80%"
                >
                  {thumbnailAvailable ? (
                    <Avatar
                      data-cy="uploaded-thumbnail"
                      variant="square"
                      className={classes.avatar}
                      src={props.thumbnail}
                    />
                  ) : (
                    <Avatar
                      data-cy="placeholder-thumbnail"
                      variant="square"
                      className={classes.avatar}
                    />
                  )}
                </Box>
              </Box>
            </Tooltip>
            <Box
              width="33%"
              minWidth={140}
              alignItems="center"
              ml={2}
              textAlign="left"
            >
              <Typography
                variant="h6"
                color="textSecondary"
                data-cy="mentor-card-scope"
              >
                Scope: {currentStage!.name}
              </Typography>
              <Typography
                variant="body1"
                color="textSecondary"
                data-cy="mentor-card-scope-description"
              >
                {currentStage!.description}
              </Typography>
              {props.type ? (
                <Typography
                  variant="h6"
                  color="textSecondary"
                  data-cy="mentor-card-type"
                >
                  {props.type[0].toUpperCase() +
                    props.type.slice(1).toLowerCase()}{" "}
                  Mentor
                </Typography>
              ) : (
                <Typography
                  variant="h6"
                  color="textSecondary"
                  data-cy="mentor-card-type"
                >
                  Invalid Mentor
                </Typography>
              )}

              <Typography
                variant="body1"
                color="textSecondary"
                data-cy="mentor-card-trained"
              >
                Last Trained: {props.lastTrainedAt.substring(0, 10)}
              </Typography>
            </Box>
            <Box width="33%" alignItems="center" ml={2} textAlign="left">
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

              {currentStage!.floor != 1000 && (
                <StageProgress
                  value={props.value}
                  max={currentStage!.max || 0}
                  percent={currentStage!.percent || 0}
                />
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      <StageToast
        value={props.value}
        floor={currentStage!.floor!}
        name={currentStage!.name!}
      />
    </div>
  );
}

MyMentorCard.propTypes = {
  mentorId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  thumbnail: PropTypes.string.isRequired,
};
