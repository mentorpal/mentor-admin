/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import React, { useState, useRef } from "react";
import { useWithWindowSize } from "hooks/use-with-window-size";
import ListItem from "./uploading-list-item";
import { Answer } from "types";
import { UploadStatus, UploadTask } from "hooks/graphql/use-with-upload-status";
import { AnswerState } from "hooks/graphql/use-with-record-state";

function UploadingView(props: {
  answers: AnswerState[];
  currentUploads: UploadTask[];
  setAnswerIDx: (id: number) => void;
  curAnswer: Answer;
}): JSX.Element {
  const { width: windowWidth, height: windowHeight } = useWithWindowSize();
  const { answers, setAnswerIDx, currentUploads, curAnswer } = props;
  const uploadsInProgress = currentUploads.filter(
    (u) =>
      u.uploadStatus !== UploadStatus.TRANSCRIBE_FAILED &&
      u.uploadStatus !== UploadStatus.UPLOAD_FAILED &&
      u.uploadStatus !== UploadStatus.DONE
  );
  const uploadsDone = currentUploads.filter(
    (u) => u.uploadStatus == UploadStatus.DONE
  );

  //the IDx of an answer corresponds to its position within the answers array
  function retrieveAnswerIDx(id: string) {
    let i = 0;
    for (; i < props.answers?.length; i++) {
      if (props.answers[i].answer.question._id == id) {
        return i;
      }
    }
    //Default case
    return 0;
  }

  function retrieveAnswerTitle(id: string) {
    let i = 0;
    for (; i < props.answers?.length; i++) {
      if (props.answers[i]?.answer?.question?._id == id) {
        return props.answers[i].answer.question.question;
      }
    }
    return "Text Not Found";
  }

  //this objects state will re render when record.tsx passes in new info from its query.
  function produceList() {
    return (
      <ul
        style={{
          listStyleType: "none",
          padding: 0,
          margin: 0,
        }}
      >
        {currentUploads.map((job, i) => {
          return (
            <div
              key={`upload-card-${i}`}
              data-cy={`upload-card-${i}`}
              style={
                curAnswer.question._id == job.question._id
                  ? { background: "yellow" }
                  : {}
              }
            >
              <ListItem
                setAnswerIDx={setAnswerIDx}
                answerIDx={retrieveAnswerIDx(job.question._id)}
                jobStatus={job.uploadStatus}
                jobTitle={retrieveAnswerTitle(job.question._id)}
              />
            </div>
          );
        })}
      </ul>
    );
  }

  //TODO: taller height + scrolling?
  const height = 150;
  const width = 300;
  return (
    <div
      data-cy="uploading-widget"
      style={{
        visibility:
          uploadsInProgress.length > 0 || uploadsDone.length > 0
            ? "visible"
            : "hidden",
        position: "absolute",
        right: 50,
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
          height: height * 0.2,
          backgroundColor: "#303030",
          color: "white",
        }}
      >
        <div style={{ paddingTop: height * 0.03 }}>
          {uploadsInProgress.length > 0
            ? `Uploading ${uploadsInProgress.length} item(s)...`
            : "Uploading Complete"}
        </div>
      </div>
      {produceList()}
    </div>
  );
}

export default UploadingView;
