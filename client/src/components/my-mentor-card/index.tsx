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
  Avatar,
  Grid,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  IconButton,
  Modal,
  Fade,
  Button,
} from "@material-ui/core";
import StageToast from "./stage-toast";
import { makeStyles, Theme } from "@material-ui/core/styles";
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
import CreateIcon from "@material-ui/icons/Create";
import Backdrop from "@material-ui/core/Backdrop";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";

import "styles/layout.css";

const useStyles = makeStyles((theme: Theme) => ({
  homeThumbnail: {
    width: "100%",
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
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    maxWidth: "50%",
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
  const [open, setOpen] = React.useState<boolean>(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const modal = (
    <div>
      <IconButton
        data-cy="edit-mentor-data"
        color="primary"
        aria-label="upload picture"
        component="span"
        className="edit-pencil-icon"
        onClick={handleOpen}
      >
        <CreateIcon />
      </IconButton>
      <div className="modal-wrapper">
        <Modal
          aria-labelledby="transition-modal-title"
          aria-describedby="transition-modal-description"
          className={classes.modal}
          open={open}
          onClose={handleClose}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
          }}
          data-cy="edit-mentor-data-modal"
        >
          <Fade in={open}>
            <div className={classes.paper}>
              <Grid item alignItems="center" xs={12} md={12}>
                <TextField
                  data-cy="mentor-name"
                  label="Full Name"
                  value={editedMentor.name}
                  onChange={(e) => editMentor({ name: e.target.value })}
                  className={classes.inputField}
                  disabled={props.editDisabled}
                />
                <TextField
                  data-cy="mentor-job-title"
                  label="Job Title"
                  value={editedMentor.title}
                  onChange={(e) => editMentor({ title: e.target.value })}
                  className={classes.inputField}
                  disabled={props.editDisabled}
                />
                <TextField
                  data-cy="mentor-first-name"
                  label="First Name"
                  value={editedMentor.firstName}
                  onChange={(e) => editMentor({ firstName: e.target.value })}
                  className={classes.inputField}
                  disabled={props.editDisabled}
                />
                <TextField
                  data-cy="mentor-email"
                  label="Email"
                  type="email"
                  value={editedMentor.email}
                  onChange={(e) => editMentor({ email: e.target.value })}
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
                <div
                  className={classes.inputField}
                  style={{ textAlign: "left" }}
                >
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
              </Grid>
              <Button
                onClick={handleClose}
                data-cy="close-modal"
                variant="contained"
                color="primary"
                component="span"
              >
                Close
              </Button>
            </div>
          </Fade>
        </Modal>
      </div>
    </div>
  );

  return (
    <div style={{ marginTop: 2, flexGrow: 1, marginLeft: 25, marginRight: 25 }}>
      <Card data-cy="my-mentor-card">
        <CardContent>
          <Grid alignItems="center" container spacing={3}>
            <Grid
              item
              container
              alignItems="center"
              justify="center"
              xs={12}
              md={4}
            >
              <Grid
                justify="center"
                alignItems="center"
                data-cy="thumbnail-wrapper"
                thumbnail-src={thumbnail}
                item
                xs={10}
                className="thumbnail-wrapper"
              >
                <div className="upload-thumbnail">
                  <label htmlFor="icon-button-file">
                    <IconButton color="primary" component="span">
                      <CloudUploadIcon />
                    </IconButton>
                  </label>
                </div>
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
              <Grid
                alignItems="center"
                data-cy="thumbnail-wrapper"
                thumbnail-src={thumbnail}
                item
                xs={10}
              >
                <Typography
                  gutterBottom
                  variant="h5"
                  component="h2"
                  className="mentorName"
                >
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <b>{editedMentor.name}</b>
                    {modal}
                  </div>
                </Typography>
                <Typography
                  gutterBottom
                  variant="h6"
                  component="h4"
                  className="mentorTitle"
                >
                  {editedMentor.title}
                </Typography>
              </Grid>

              <input
                id="icon-button-file"
                data-cy="upload-file"
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => {
                  e.target.files instanceof FileList
                    ? updateThumbnail(e.target.files[0])
                    : undefined;
                }}
              />
            </Grid>
            <Grid item alignItems="center" xs={12} md={4}>
              <Typography
                variant="h5"
                color="textPrimary"
                data-cy="mentor-card-scope"
              >
                <div className="stage-text">
                  Scope: <b>{mentorInfo.currentStage.name}</b>
                </div>
              </Typography>
              <Typography
                variant="body1"
                color="textSecondary"
                data-cy="mentor-card-scope-description"
                className="stage-text"
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
            </Grid>
            <Grid xs={12} md={3}>
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
