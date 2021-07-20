/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Tooltip,
  Avatar,
  Grid,
} from "@material-ui/core";
import StageToast from "./stage-toast";
import { makeStyles } from "@material-ui/core/styles";
import { HelpOutline } from "@material-ui/icons";
import { Mentor } from "types";
import { useWithThumbnail } from "hooks/graphql/use-with-thumbnail";
import RecommendedActionButton from "./recommended-action-button";
import { toTitleCase } from "helpers";
import StageProgress from "./stage-progress";
import parseMentor from "./mentor-info";

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

export default function MyMentorCard(props: {
  accessToken: string;
  mentor: Mentor;
  buildAction: () => void;
}): JSX.Element {
  const mentorInfo = parseMentor(props.mentor);
  const classes = useStyles();
  const [thumbnail, updateThumbnail] = useWithThumbnail(
    props.mentor?._id,
    props.accessToken,
    props.mentor?.thumbnail || ""
  );
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
                display="block"
              >
                {mentorInfo.name}
              </Typography>
              <Typography
                variant="h5"
                color="textSecondary"
                data-cy="mentor-card-info"
                display="block"
              >
                Title: {mentorInfo.title}
              </Typography>
              <Grid
                justify="center"
                alignItems="center"
                data-cy="thumbnail-wrapper"
                item
                xs={10}
              >
                {thumbnail ? (
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
                Scope: {mentorInfo.currentStage.name}
              </Typography>
              <Typography
                variant="body1"
                color="textSecondary"
                align="left"
                data-cy="mentor-card-scope-description"
              >
                {mentorInfo.currentStage.description}
              </Typography>
              {mentorInfo.type ? (
                <Typography
                  variant="h6"
                  color="textSecondary"
                  align="left"
                  data-cy="mentor-card-type"
                >
                  {toTitleCase(mentorInfo.type)} Mentor
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
                Last Trained: {mentorInfo.lastTrainedAt.substring(0, 10)}
              </Typography>
            </Grid>
            <Grid item alignItems="center" xs={12} md={3}>
              <Typography
                variant="body1"
                color="textSecondary"
                display="inline"
              >
                Next Goal:{" "}
              </Typography>
              <Typography
                variant="body1"
                color="textSecondary"
                display="inline"
              >
                {mentorInfo.currentStage.next.name}
                {"   "}
                <Tooltip
                  title={
                    <React.Fragment>
                      <Typography color="inherit">
                        {mentorInfo.currentStage.next.name}
                      </Typography>
                      {mentorInfo.currentStage.next.description}
                    </React.Fragment>
                  }
                  data-cy="next-stage-info"
                >
                  <HelpOutline fontSize="small" />
                </Tooltip>
              </Typography>

              {mentorInfo.currentStage.floor != 1000 && (
                <StageProgress
                  value={mentorInfo.value}
                  max={mentorInfo.currentStage.max || 0}
                  percent={mentorInfo.currentStage.percent || 0}
                />
              )}
            </Grid>
            <Grid xs={12} md={2}>
              <RecommendedActionButton
                mentor={props.mentor}
                setThumbnail={updateThumbnail}
                buildAction={props.buildAction}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <StageToast
        value={mentorInfo.value}
        floor={mentorInfo.currentStage.floor}
        name={mentorInfo.currentStage.name}
      />
    </div>
  );
}
