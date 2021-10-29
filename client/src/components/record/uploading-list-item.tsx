/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import {
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import {
  PublishRounded,
  CancelRounded,
  CheckCircle,
  WarningRounded,
  AccessTimeRounded,
  Clear,
  CloudUpload,
} from "@material-ui/icons";
import CloseIcon from "@material-ui/icons/Close";
import { UseWithUploadListItem } from "hooks/graphql/use-with-upload-list-item";

function UploadingListItem(props: {
  useWithUploadListItem: UseWithUploadListItem;
  jumpToAnswer: () => void;
}): JSX.Element {
  const {
    upload,
    pollStatusCount,
    cancelling,
    jobTitle,
    isJobFailed,
    isJobDone,
    isJobQueued,
    downloadVideo,
    isDownloadingVideo,
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
  const progressTitle = cancelling
    ? "Cancelling"
    : isJobFailed()
    ? upload.errorMessage || ""
    : isJobQueued()
    ? "Queued"
    : !isJobDone()
    ? `Processing${".".repeat(pollStatusCount % 4)}`
    : needsAttention
    ? "Needs Attention"
    : "Tap to preview";
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
          <CloudUpload />
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
          jobTitle && jobTitle.length > 22
            ? jobTitle.substring(0, 22) + "..."
            : jobTitle
        }
        secondary={progressTitle}
      />

      <Button
        disabled={isDownloadingVideo}
        title={"Download Video"}
        style={{
          minWidth: 0,
          visibility: isJobDone() || cancelling ? "hidden" : "visible",
        }}
        data-cy="download-video-from-list"
        onClick={downloadVideo}
      >
        <PublishRounded
          style={{ cursor: "pointer", transform: "scaleY(-1)", color: "gray" }}
        />
      </Button>
      <Button
        title={"Cancel Upload"}
        style={{
          minWidth: 0,
          visibility: isJobFailed() || cancelling ? "hidden" : "visible",
          color: "gray",
        }}
        data-cy="cancel-upload"
        onClick={onClose}
      >
        <CloseIcon />
      </Button>
    </ListItem>
  );
}

export default UploadingListItem;
