/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import React from "react";
import ListItem from "./uploading-list-item";
import { Answer } from "types";
import { UploadStatus } from "hooks/graphql/use-with-upload-status";
import { UseWithRecordState } from "hooks/graphql/use-with-record-state";
import { Typography, List, Button } from "@material-ui/core";
import Close from "@material-ui/icons/Close";

function UploadingView(props: {
  recordState: UseWithRecordState;
  curAnswer: Answer;
  cancelledAnswerID: string;
  cancelAnswerUpload: (s: string) => void;
  visible: boolean;
  setUploadWidgetVisible: (b: boolean) => void;
}): JSX.Element {
  const {
    recordState,
    curAnswer,
    cancelAnswerUpload,
    visible,
    setUploadWidgetVisible,
    cancelledAnswerID,
  } = props;
  const { answers, setAnswerIDx, uploads } = recordState;
  const uploadsToShow = uploads.filter(
    (upload) => upload.uploadStatus !== UploadStatus.CANCELLED
  );
  const uploadsInProgress = uploadsToShow.filter(
    (upload) =>
      upload.uploadStatus !== UploadStatus.DONE &&
      upload.uploadStatus !== UploadStatus.UPLOAD_FAILED
  );
  const height = 250;
  const width = 350;

  //the IDx of an answer corresponds to its position within the answers array
  function retrieveAnswerIDx(id: string) {
    let i = 0;
    for (; i < answers?.length; i++) {
      if (answers[i].answer.question._id == id) {
        return i;
      }
    }
    //Default case
    return 0;
  }

  function produceList() {
    return (
      <List
        style={{
          listStyleType: "none",
          padding: 0,
          margin: 0,
          maxHeight: "213px",
          overflow: "scroll",
        }}
      >
        {uploadsToShow.map((upload, i) => {
          return (
            <div
              key={`upload-card-${i}`}
              data-cy={`upload-card-${i}`}
              style={
                curAnswer.question._id == upload.question._id
                  ? { background: "#FFFBCC" }
                  : {}
              }
            >
              <ListItem
                upload={upload}
                cancelAnswerUpload={cancelAnswerUpload}
                representsCurrentAnswer={
                  curAnswer.question._id == upload.question._id
                }
                setAnswerIDx={setAnswerIDx}
                answerIDx={retrieveAnswerIDx(upload.question._id)}
                jobTitle={upload.question.question}
                cancelledAnswer={cancelledAnswerID == upload.question._id}
              />
            </div>
          );
        })}
      </List>
    );
  }

  return (
    <div
      data-cy="uploading-widget"
      style={{
        display: uploadsToShow.length > 0 && visible ? "block" : "none",
        position: "absolute",
        right: 10,
        borderRadius: "5px",
        marginTop: 200,
        boxShadow: "1px 1px 1px 1px",
        width: width,
        height: height,
      }}
    >
      <div
        data-cy="uploading-widget-title"
        style={{
          width: "100%",
          height: height * 0.15,
          backgroundColor: "#303030",
          color: "white",
          borderRadius: "5px 5px 0px 0px",
        }}
      >
        <div style={{ paddingTop: height * 0.03 }}>
          <Button
            onClick={() => {
              setUploadWidgetVisible(!visible);
            }}
            data-cy="close-uploads-widget-button"
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              cursor: "pointer",
            }}
          >
            <Close style={{ color: "White" }} />
          </Button>
          <Typography>
            {uploadsInProgress.length > 0
              ? `Uploading ${uploadsInProgress.length} item(s)...`
              : "Uploading Complete"}
          </Typography>
        </div>
      </div>
      {produceList()}
    </div>
  )
}

export default UploadingView;