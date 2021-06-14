/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import React from "react";
import ListItem from "./uploading-list-item";
import { Answer } from "types";
import { UploadStatus, UploadTask } from "hooks/graphql/use-with-upload-status";
import { AnswerState } from "hooks/graphql/use-with-record-state";

function UploadingView(props: {
  answers: AnswerState[];
  currentUploads: UploadTask[];
  setAnswerIDx: (id: number) => void;
  curAnswer: Answer;
  cancelledCurAnswer: boolean;
}): JSX.Element {
  const {
    answers,
    setAnswerIDx,
    currentUploads,
    curAnswer,
    cancelledCurAnswer,
  } = props;
  const uploadsToShow = currentUploads.filter(
    (upload) => upload.uploadStatus !== UploadStatus.CANCELLED
  );

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

  function retrieveAnswerTitle(id: string) {
    let i = 0;
    for (; i < answers?.length; i++) {
      if (answers[i]?.answer?.question?._id == id) {
        return answers[i].answer.question.question;
      }
    }
    return "Text Not Found";
  }

  function produceList() {
    return (
      <ul
        style={{
          listStyleType: "none",
          padding: 0,
          margin: 0,
        }}
      >
        {uploadsToShow.map((job, i) => {
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
                cancelledAnswer={
                  curAnswer.question._id == job.question._id &&
                  cancelledCurAnswer
                }
              />
            </div>
          );
        })}
      </ul>
    );
  }

  const height = 150;
  const width = 300;
  return (
    <div
      data-cy="uploading-widget"
      style={{
        visibility: uploadsToShow.length > 0 ? "visible" : "hidden",
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
          {uploadsToShow.length > 0
            ? `Uploading ${uploadsToShow.length} item(s)...`
            : "Uploading Complete"}
        </div>
      </div>
      {produceList()}
    </div>
  );
}

export default UploadingView;
