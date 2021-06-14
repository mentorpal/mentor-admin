/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useState } from "react";
import { UploadStatus } from "hooks/graphql/use-with-upload-status";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import { makeStyles } from "@material-ui/core/styles";
import PublishRoundedIcon from "@material-ui/icons/PublishRounded";
import CancelRoundedIcon from "@material-ui/icons/CancelRounded";
import DoneIcon from "@material-ui/icons/Done";
import CloseIcon from "@material-ui/icons/Close";

function UploadingListItem(props: {
  jobTitle: string;
  jobStatus: string;
  setAnswerIDx: (id: number) => void;
  answerIDx: number;
  cancelledAnswer: boolean;
}): JSX.Element {
  const {
    jobTitle,
    setAnswerIDx,
    answerIDx,
    jobStatus,
    cancelledAnswer,
  } = props;
  const [cancelling, setCancelling] = useState(false);
  const useStyles = makeStyles(() => ({
    primaryListItemText: {
      fontSize: "0.9em",
    },
    secondaryListItemText: {
      fontSize: "0.7em",
    },
  }));
  const classes = useStyles();
  return (
    <ListItem divider={true} dense={true} alignItems={"center"}>
      <ListItemIcon style={{ minWidth: 0, paddingRight: 15 }}>
        {jobStatus == UploadStatus.DONE ? (
          <DoneIcon />
        ) : jobStatus == UploadStatus.UPLOAD_FAILED ? (
          <CancelRoundedIcon />
        ) : (
          <PublishRoundedIcon />
        )}
      </ListItemIcon>
      <ListItemText
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
          cancelling || cancelledAnswer
            ? "Cancelling"
            : jobStatus === UploadStatus.TRANSCRIBE_FAILED
            ? "Transcribe Failed"
            : jobStatus === UploadStatus.UPLOAD_FAILED
            ? "Upload Failed"
            : jobStatus === UploadStatus.DONE
            ? "Complete"
            : "Uploading"
        }
      />
      <ListItemIcon
        style={{
          minWidth: 0,
          visibility:
            jobStatus == UploadStatus.DONE ||
            jobStatus == UploadStatus.UPLOAD_FAILED
              ? "hidden"
              : "visible",
        }}
        data-cy="cancel-upload"
      >
        <CloseIcon
          onClick={() => {
            setCancelling(true);
          }}
          style={{ cursor: "pointer" }}
        />
      </ListItemIcon>
    </ListItem>
  );
}

export default UploadingListItem;
