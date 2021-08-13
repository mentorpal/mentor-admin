/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import {
  LinearProgress,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import {
  PublishRounded,
  CancelRounded,
  CheckCircle,
  WarningRounded,
  AccessTimeRounded,
  Clear,
} from "@material-ui/icons";
import CloseIcon from "@material-ui/icons/Close";
import { UseWithUploadListItem } from "hooks/graphql/use-with-upload-list-item";
import { UploadStatus } from "hooks/graphql/use-with-upload-status";

function UploadingListItem(props: {
  useWithUploadListItem: UseWithUploadListItem;
  jumpToAnswer: () => void;
}): JSX.Element {
  const {
    upload,
    jobStatus,
    pollStatusCount,
    cancelling,
    jobTitle,
    isJobFailed,
    isJobDone,
    isJobQueued,
    onClose,
    needsAttention,
  } = props.useWithUploadListItem;
  const jumpToAnswer = props.jumpToAnswer;
  const useStyles = makeStyles(() => ({
    primaryListItemText: {
      fontSize: "0.9em",
    },
    secondaryListItemText: {
      fontSize: "0.7em",
    },
  }));
  const classes = useStyles();
  const progressTitle = cancelling ? (
    "Cancelling"
  ) : isJobFailed() ? (
    upload.errorMessage || ""
  ) : jobStatus === UploadStatus.PENDING ||
    jobStatus === UploadStatus.UPLOAD_IN_PROGRESS ? (
    <LinearProgress
      data-cy="progress-bar"
      variant={"determinate"}
      value={upload.uploadProgress}
    />
  ) : isJobQueued() ? (
    "Queued"
  ) : jobStatus === UploadStatus.TRIM_IN_PROGRESS ? (
    "Trimming video"
  ) : jobStatus !== UploadStatus.DONE ? (
    `Processing${".".repeat(pollStatusCount % 4)}`
  ) : needsAttention ? (
    "Needs Attention"
  ) : (
    "Tap to preview"
  );
  return (
    <ListItem divider={true} dense={true} alignItems={"center"}>
      <ListItemIcon
        style={{
          minWidth: 0,
          paddingRight: 15,
          color: isJobFailed()
            ? "#ff0000"
            : isJobDone()
            ? "green"
            : needsAttention
            ? "#CCCC00"
            : "black",
        }}
      >
        {cancelling ? (
          <Clear />
        ) : isJobDone() ? (
          <CheckCircle />
        ) : isJobFailed() ? (
          <CancelRounded />
        ) : isJobQueued() ? (
          <AccessTimeRounded />
        ) : needsAttention ? (
          <WarningRounded />
        ) : (
          <PublishRounded />
        )}
      </ListItemIcon>
      <ListItemText
        style={{ cursor: "pointer" }}
        data-cy="card-answer-title"
        onClick={jumpToAnswer}
        classes={{
          primary: classes.primaryListItemText,
          secondary: classes.secondaryListItemText,
        }}
        primary={
          jobTitle && jobTitle.length > 25
            ? jobTitle.substring(0, 25) + "..."
            : jobTitle
        }
        secondary={progressTitle}
      />
      <ListItemIcon
        style={{
          minWidth: 0,
          visibility: isJobFailed() || cancelling ? "hidden" : "visible",
        }}
        data-cy="cancel-upload"
      >
        <CloseIcon
          onClick={onClose}
          style={{ cursor: "pointer", paddingRight: 5 }}
        />
      </ListItemIcon>
    </ListItem>
  );
}

export default UploadingListItem;
