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
  Grid,
} from "@material-ui/core";
import StageToast from "./stage-toast";
import { makeStyles } from "@material-ui/core/styles";
import { HelpOutline } from "@material-ui/icons";
import { MentorType } from "types";
import { useWithThumbnail } from "hooks/graphql/use-with-thumbnail";
import BashButton from "./bash-button";

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
  homeThumbnail: {
    width: 240,
    height: 180,
  },
  siteThumbnail: {
    width: 180,
    height: 135,
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
  let currentStage = stages.find((stage) => {
    return stage.max - 1 >= value;
  });
  if (!currentStage) currentStage = stages[0];
  return {
    ...currentStage,
    ...{
      next: stages[currentStage.index + 1],
      percent: Math.round((value / currentStage.max) * 100),
    },
  };
};
export default function MyMentorCard(props: {
  accessToken: string;
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
  const [thumbnail, updateThumbnail] = useWithThumbnail(
    props.mentorId,
    props.accessToken,
    props.thumbnail
  );
  const thumbnailAvailable = thumbnail !== "";
  return (
    <div style={{ marginTop: 2, flexGrow: 1, marginLeft: 25, marginRight: 25 }}>
      <Card data-cy="my-mentor-card">
        <CardContent>
          <Grid alignItems="center" container xs={12}>
            <Grid
              item
              container
              alignItems="center"
              justify="center"
              xs={12}
              md={4}
            >
              <Typography
                variant="h4"
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
              <Grid
                justify="center"
                alignItems="center"
                data-cy="thumbnail-wrapper"
                item
                xs={10}
              >
                {thumbnailAvailable ? (
                  <Avatar
                    data-cy="uploaded-thumbnail"
                    variant="rounded"
                    className={classes.homeThumbnail}
                    src={thumbnail}
                  />
                ) : (
                  <Avatar
                    data-cy="placeholder-thumbnail"
                    variant="square"
                    className={classes.homeThumbnail}
                  />
                )}
              </Grid>
              <input
                data-cy="upload-file"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  e.target.files instanceof FileList
                    ? updateThumbnail(e.target.files[0])
                    : undefined;
                }}
              />
            </Grid>
            <Grid item alignItems="center" xs={12} md={3}>
              <Typography
                variant="h6"
                color="textSecondary"
                align="left"
                data-cy="mentor-card-scope"
              >
                Scope: {currentStage.name}
              </Typography>
              <Typography
                variant="body1"
                color="textSecondary"
                align="left"
                data-cy="mentor-card-scope-description"
              >
                {currentStage.description}
              </Typography>
              {props.type ? (
                <Typography
                  variant="h6"
                  color="textSecondary"
                  align="left"
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
                  align="left"
                  data-cy="mentor-card-type"
                >
                  Invalid Mentor
                </Typography>
              )}

              <Typography
                variant="body1"
                color="textSecondary"
                align="left"
                data-cy="mentor-card-trained"
              >
                Last Trained: {props.lastTrainedAt.substring(0, 10)}
              </Typography>
            </Grid>
            <Grid item alignItems="center" xs={12} md={3}>
              <Typography variant="body1" color="textSecondary">
                Next Goal: {currentStage.next.name}
                {"   "}
                <Tooltip
                  title={
                    <React.Fragment>
                      <Typography color="inherit">
                        {currentStage.next.name}
                      </Typography>
                      {currentStage.next.description}
                    </React.Fragment>
                  }
                  data-cy="next-stage-info"
                >
                  <HelpOutline fontSize="small" />
                </Tooltip>
              </Typography>

              {currentStage.floor != 1000 && (
                <StageProgress
                  value={props.value}
                  max={currentStage.max || 0}
                  percent={currentStage.percent || 0}
                />
              )}
            </Grid>
            <Grid xs={12} md={2}>
              <BashButton
                accessToken={props.accessToken}
                setThumbnail={updateThumbnail}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <StageToast
        value={props.value}
        floor={currentStage.floor}
        name={currentStage.name}
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
