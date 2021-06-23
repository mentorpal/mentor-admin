/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import { UploadStatus, UploadTask } from "hooks/graphql/use-with-upload-status";
import {
  LinearProgress,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { PublishRounded, CancelRounded, CheckCircle } from "@material-ui/icons";
import CloseIcon from "@material-ui/icons/Close";
import { UseWithRecordState } from "hooks/graphql/use-with-record-state";

function UploadingListItem(props: {
  upload: UploadTask;
  jobTitle: string;
  setAnswerIDx: (id: number) => void;
  answerIDx: number;
  recordState: UseWithRecordState;
}): JSX.Element {
  const { upload, jobTitle, setAnswerIDx, answerIDx, recordState } = props;
  const useStyles = makeStyles(() => ({
    primaryListItemText: {
      fontSize: "0.9em",
    },
    secondaryListItemText: {
      fontSize: "0.7em",
    },
  }));
  const jobStatus = upload.uploadStatus;
  const jobDone = jobStatus == UploadStatus.DONE;
  const jobFailed = jobStatus == UploadStatus.UPLOAD_FAILED;
  const cancelling =
    jobStatus === UploadStatus.CANCEL_IN_PROGRESS ||
    jobStatus === UploadStatus.CANCEL_PENDING ||
    jobStatus === UploadStatus.CANCELLED;
  const classes = useStyles();

  return (
    <ListItem divider={true} dense={true} alignItems={"center"}>
      <ListItemIcon
        style={{
          minWidth: 0,
          paddingRight: 15,
          color: jobFailed ? "#ff0000" : jobDone ? "green" : "black",
        }}
      >
        {jobDone ? (
          <CheckCircle />
        ) : jobFailed ? (
          <CancelRounded />
        ) : (
          <PublishRounded />
        )}
      </ListItemIcon>
      <ListItemText
        style={{ cursor: "pointer" }}
        data-cy="card-answer-title"
        onClick={() => {
          setAnswerIDx(answerIDx);
        }}
        classes={{
          primary: classes.primaryListItemText,
          secondary: classes.secondaryListItemText,
        }}
        primary={
          jobTitle && jobTitle.length > 35
            ? jobTitle.substring(0, 35) + "..."
            : jobTitle
        }
        secondary={
          cancelling ? (
            "Cancelling"
          ) : jobStatus === UploadStatus.TRANSCRIBE_FAILED ? (
            "Transcribe Failed"
          ) : jobFailed ? (
            "Upload Failed"
          ) : jobStatus === UploadStatus.PENDING ||
            jobStatus == UploadStatus.UPLOAD_IN_PROGRESS ? (
            <LinearProgress
              data-cy="progress-bar"
              variant={"determinate"}
              value={upload.uploadProgress}
            />
          ) : jobStatus == UploadStatus.TRIM_IN_PROGRESS ? (
            "Trimming video"
          ) : jobStatus !== UploadStatus.DONE ? (
            "Processing"
          ) : (
            "Tap to preview"
          )
        }
      />
      <ListItemIcon
        style={{
          minWidth: 0,
          visibility: jobFailed ? "hidden" : "visible",
        }}
        data-cy="cancel-upload"
      >
        <CloseIcon
          onClick={() => {
            if (jobDone) {
              recordState.removeCompletedTask(upload);
            } else {
              recordState.cancelUpload(upload);
            }
          }}
          style={{ cursor: "pointer", paddingRight: 5 }}
        />
      </ListItemIcon>
    </ListItem>
  );
}

export default UploadingListItem;
