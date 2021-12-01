/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import React, { useEffect, useState } from "react";
import ListItem from "./uploading-list-item";
import { UseWithRecordState } from "hooks/graphql/use-with-record-state";
import {
  Typography,
  List,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
} from "@material-ui/core";
import Close from "@material-ui/icons/Close";
import { useWithUploadListItem } from "hooks/graphql/use-with-upload-list-item";
import {
  areAllTasksDone,
  isATaskCancelled,
} from "hooks/graphql/upload-status-helpers";
import { navigate } from "gatsby-link";
import { urlBuild } from "helpers";
import { UploadTask } from "types";

function UploadingView(props: {
  recordState: UseWithRecordState;
  visible: boolean;
  onRecordPage: boolean;
  setUploadWidgetVisible: (b: boolean) => void;
}): JSX.Element {
  const [navigateQuestionId, setNavigateQuestionId] = useState<string>("");
  const [warningPopupOpen, setWarningPopupOpen] = useState<boolean>(false);
  const { recordState, visible, onRecordPage, setUploadWidgetVisible } = props;
  const { curAnswer, answers, setAnswerIdx, uploads, mentorSubjects } =
    recordState;
  const uploadsToShow = uploads.filter((upload) => !isATaskCancelled(upload));
  const uploadsInProgress = uploadsToShow.filter(
    (upload) => !areAllTasksDone(upload)
  );
  const curRecordingSetUploads: UploadTask[] = uploadsToShow.filter((upload) =>
    answers.find((a) => a.answer.question === upload.question)
  );
  const otherUploads: UploadTask[] = uploadsToShow.filter(
    (upload) => !answers.find((a) => a.answer.question === upload.question)
  );

  const height = 250;
  const width = 350;

  useEffect(() => {
    if (!navigateQuestionId) return;
    const answerIdx = retrieveAnswerIdx(navigateQuestionId);
    if (answerIdx !== -1 && onRecordPage) {
      setAnswerIdx(answerIdx);
    } else {
      setWarningPopupOpen(true);
    }
  }, [navigateQuestionId]);

  function navigateToRecordQuestion(questionId: string) {
    if (onRecordPage) {
      setNavigateQuestionId(questionId);
    } else {
      navigateToQuestionsRecordingPage(questionId);
    }
  }

  function retrieveAnswerIdx(id: string) {
    for (let i = 0; i < answers?.length; i++) {
      if (answers[i].answer.question == id) {
        return i;
      }
    }
    //Default case
    return -1;
  }

  function navigateToQuestionsRecordingPage(questionId: string) {
    const questionsSubject = mentorSubjects.find((subject) =>
      subject.questions.find((subjq) => subjq.question === questionId)
    );
    const subjectQuestion = questionsSubject?.questions.find(
      (question) => question.question === questionId
    );
    if (!questionsSubject) {
      console.error(`Failed to find a subject for question: ${questionId}`);
      return;
    }
    const url: string = subjectQuestion?.category
      ? urlBuild("/record", {
          category: subjectQuestion.category.id,
          subject: questionsSubject._id,
          videoId: questionId,
        })
      : urlBuild("/record", {
          subject: questionsSubject._id,
          videoId: questionId,
        });
    recordState.reloadMentorData();
    navigate(url);
    setNavigateQuestionId("");
  }

  function produceList() {
    return (
      <List
        style={{
          listStyleType: "none",
          padding: 0,
          margin: 0,
          maxHeight: "213px",
          overflow: "auto",
        }}
      >
        {curRecordingSetUploads.map((upload, i) => {
          return (
            <div
              key={`active-upload-card-${i}`}
              data-cy={`active-upload-card-${i}`}
              style={
                onRecordPage && curAnswer?.answer.question == upload.question
                  ? { background: "#FFFBCC" }
                  : {}
              }
            >
              <ListItem
                useWithUploadListItem={useWithUploadListItem(
                  recordState,
                  upload
                )}
                jumpToAnswer={() => {
                  navigateToRecordQuestion(upload.question);
                }}
              />
            </div>
          );
        })}
        {otherUploads.length && curRecordingSetUploads.length ? (
          <div
            data-cy={"uploads-split"}
            style={{ backgroundColor: "gray", height: "5px" }}
          ></div>
        ) : undefined}
        {otherUploads.length
          ? otherUploads.map((upload, i) => {
              return (
                <div
                  style={{ color: "gray" }}
                  key={`grayed-upload-card-${i}`}
                  data-cy={`grayed-upload-card-${i}`}
                >
                  <ListItem
                    useWithUploadListItem={useWithUploadListItem(
                      recordState,
                      upload
                    )}
                    jumpToAnswer={() => {
                      navigateToRecordQuestion(upload.question);
                    }}
                  />
                </div>
              );
            })
          : undefined}
      </List>
    );
  }

  function navigationWarningPopup() {
    return (
      <Dialog data-cy="navigation-warning" open={warningPopupOpen}>
        <DialogTitle>{"Navigating Away"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {
              "The upload you selected belongs to a different subject, would you like to navigate to that subjects recording page?"
            }
          </DialogContentText>
        </DialogContent>
        <DialogContent>
          <Button
            data-cy="do-not-navigate-button"
            onClick={() => {
              setNavigateQuestionId("");
              setWarningPopupOpen(false);
            }}
          >
            NO
          </Button>
          <Button
            data-cy="navigate-to-question-button"
            onClick={() => {
              navigateToQuestionsRecordingPage(navigateQuestionId);
              setWarningPopupOpen(false);
            }}
          >
            YES
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div
      data-cy="uploading-widget"
      style={{
        display: uploadsToShow.length > 0 && visible ? "block" : "none",
        position: "fixed",
        right: 10,
        borderRadius: "5px",
        marginTop: 200,
        boxShadow: "1px 1px 1px 1px",
        width: width,
        height: height,
        zIndex: 1,
        backgroundColor: "white",
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
      {navigationWarningPopup()}
    </div>
  );
}

export default UploadingView;
