/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import { ListItem, ListItemIcon, ListItemText, Button } from "@mui/material";
import { makeStyles } from "tss-react/mui";
import {
  PublishRounded,
  CancelRounded,
  CheckCircle,
  WarningRounded,
  AccessTimeRounded,
  Clear,
  CloudUpload,
} from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import { UseWithUploadListItem } from "hooks/graphql/use-with-upload-list-item";

const useStyles = makeStyles({ name: { UploadingListItem } })(() => ({
  primaryListItemText: {
    fontSize: "0.9em",
  },
  secondaryListItemText: {
    fontSize: "0.7em",
  },
}));

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
    hasOriginalUrl,
    downloadVideo,
    isDownloadingVideo,
    onClose,
    needsAttention,
  } = props.useWithUploadListItem;
  const jumpToAnswer = props.jumpToAnswer;

  const { classes } = useStyles();
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

  function downloadButton() {
    return (
      <Button
        disabled={isDownloadingVideo}
        title={"Download Video"}
        style={{
          minWidth: 0,
          visibility:
            !hasOriginalUrl() || isJobDone() || cancelling
              ? "hidden"
              : "visible",
        }}
        data-cy="download-video-from-list"
        onClick={downloadVideo}
      >
        <PublishRounded
          style={{ cursor: "pointer", transform: "scaleY(-1)", color: "gray" }}
        />
      </Button>
    );
  }

  function clearButton() {
    return (
      <Button
        title={"Clear Upload"}
        style={{
          minWidth: 0,
          color: "gray",
        }}
        data-cy="clear-upload"
        onClick={onClose}
      >
        <CloseIcon />
      </Button>
    );
  }

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
      {hasOriginalUrl() && !isJobDone() && downloadButton()}
      {(isJobDone() || isJobFailed()) && clearButton()}
    </ListItem>
  );
}

export default UploadingListItem;
