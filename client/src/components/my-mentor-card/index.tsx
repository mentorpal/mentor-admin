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
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@material-ui/core";
import StageToast from "./stage-toast";
import { makeStyles } from "@material-ui/core/styles";
import { HelpOutline } from "@material-ui/icons";
import { useWithThumbnail } from "hooks/graphql/use-with-thumbnail";
import RecommendedActionButton from "./recommended-action-button";
import StageProgress from "./stage-progress";
import parseMentor, { defaultMentorInfo } from "./mentor-info";
import { ErrorDialog, LoadingDialog } from "components/dialog";
import { MentorType } from "types";
import { UseMentorEdits } from "store/slices/mentor/useMentorEdits";
import useActiveMentor, {
  isActiveMentorLoading,
  isActiveMentorSaving,
} from "store/slices/mentor/useActiveMentor";

const useStyles = makeStyles(() => ({
  homeThumbnail: {
    width: 240,
    height: 180,
  },
  siteThumbnail: {
    width: 180,
    height: 135,
  },
  title: {
    fontWeight: "bold",
  },
  inputField: {
    width: "100%",
    margin: 10,
  },
}));

export default function MyMentorCard(props: {
  editDisabled: boolean;
  continueAction: () => void;
  useMentor: UseMentorEdits;
}): JSX.Element {
  const mentorError = useActiveMentor((ms) => ms.error);
  const isMentorLoading = isActiveMentorLoading();
  const isMentorSaving = isActiveMentorSaving();
  const { editedMentor, editMentor } = props.useMentor;
  const mentorId = useActiveMentor((ms) => ms.data?._id || "");

  if (!mentorId || !editedMentor) {
    return <div />;
  }
  const mentorInfo = useActiveMentor((ms) =>
    ms.data ? parseMentor(ms.data) : defaultMentorInfo
  );
  const classes = useStyles();
  const [thumbnail, updateThumbnail] = useWithThumbnail();

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
              <TextField
                data-cy="mentor-name"
                label="Full Name"
                value={editedMentor.name}
                onChange={(e) => {
                  const caret = e?.target.selectionStart;
                  const element = e.target;
                  window.requestAnimationFrame(() => {
                    element.selectionStart = caret;
                    element.selectionEnd = caret;
                  });
                  editMentor({ name: e.target.value });
                }}
                className={classes.inputField}
                disabled={props.editDisabled}
              />
              <TextField
                data-cy="mentor-job-title"
                label="Job Title"
                value={editedMentor.title}
                onChange={(e) => {
                  const caret = e?.target.selectionStart;
                  const element = e.target;
                  window.requestAnimationFrame(() => {
                    element.selectionStart = caret;
                    element.selectionEnd = caret;
                  });
                  editMentor({ title: e.target.value });
                }}
                className={classes.inputField}
                disabled={props.editDisabled}
              />
              <Grid
                justify="center"
                alignItems="center"
                data-cy="thumbnail-wrapper"
                thumbnail-src={thumbnail}
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
              <TextField
                data-cy="mentor-first-name"
                label="First Name"
                value={editedMentor.firstName}
                onChange={(e) => {
                  const caret = e?.target.selectionStart;
                  const element = e.target;
                  window.requestAnimationFrame(() => {
                    element.selectionStart = caret;
                    element.selectionEnd = caret;
                  });
                  editMentor({ firstName: e.target.value });
                }}
                className={classes.inputField}
                disabled={props.editDisabled}
              />
              <TextField
                data-cy="mentor-email"
                label="Email"
                type="email"
                value={editedMentor.email}
                onChange={(e) => {
                  const caret = e?.target.selectionStart;
                  const element = e.target;
                  window.requestAnimationFrame(() => {
                    element.selectionStart = caret;
                    element.selectionEnd = caret;
                  });
                  editMentor({ email: e.target.value });
                }}
                className={classes.inputField}
                disabled={props.editDisabled}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={editedMentor.allowContact}
                    onChange={() =>
                      editMentor({
                        allowContact: !editedMentor.allowContact,
                      })
                    }
                    color="secondary"
                    disabled={props.editDisabled}
                  />
                }
                label="Allow people to contact me"
                style={{ width: "100%", marginLeft: 10, marginRight: 10 }}
              />
              <div className={classes.inputField}>
                <FormControl>
                  <InputLabel>Mentor Type</InputLabel>
                  <Select
                    data-cy="select-chat-type"
                    label="Mentor Type"
                    disabled={props.editDisabled}
                    value={editedMentor.mentorType}
                    style={{ width: 200 }}
                    onChange={(
                      event: React.ChangeEvent<{
                        name?: string | undefined;
                        value: unknown;
                      }>
                    ) => {
                      editMentor({
                        mentorType: event.target.value as MentorType,
                      });
                    }}
                  >
                    <MenuItem data-cy="chat" value={MentorType.CHAT}>
                      Chat
                    </MenuItem>
                    <MenuItem data-cy="video" value={MentorType.VIDEO}>
                      Video
                    </MenuItem>
                  </Select>
                </FormControl>
              </div>

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
                variant="h6"
                color="textSecondary"
                data-cy="mentor-card-scope"
              >
                Scope: {mentorInfo.currentStage.name}
              </Typography>
              <Typography
                variant="body1"
                color="textSecondary"
                data-cy="mentor-card-scope-description"
              >
                {mentorInfo.currentStage.description}
              </Typography>

              {mentorInfo.currentStage.floor != 1000 && (
                <StageProgress
                  value={mentorInfo.value}
                  max={mentorInfo.currentStage.max || 0}
                  percent={mentorInfo.currentStage.percent || 0}
                />
              )}
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
            </Grid>
            <Grid xs={12} md={2}>
              <RecommendedActionButton
                setThumbnail={updateThumbnail}
                continueAction={props.continueAction}
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
      <LoadingDialog
        title={isMentorLoading ? "Loading" : isMentorSaving ? "Saving" : ""}
      />
      <ErrorDialog error={mentorError} />
    </div>
  );
}
