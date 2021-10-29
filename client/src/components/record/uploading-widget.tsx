/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import React from "react";
import ListItem from "./uploading-list-item";
import { UseWithRecordState } from "hooks/graphql/use-with-record-state";
import { Typography, List, Button } from "@material-ui/core";
import Close from "@material-ui/icons/Close";
import { useWithUploadListItem } from "hooks/graphql/use-with-upload-list-item";
import {
  areAllTasksDone,
  isATaskCancelled,
} from "hooks/graphql/upload-status-helpers";
import { navigate } from "gatsby-link";
import { urlBuild } from "helpers";
import useActiveMentor from "store/slices/mentor/useActiveMentor";
import { Subject, UploadTask } from "types";

function UploadingView(props: {
  recordState: UseWithRecordState;
  visible: boolean;
  onRecordPage: boolean;
  setUploadWidgetVisible: (b: boolean) => void;
}): JSX.Element {
  const { recordState, visible, onRecordPage, setUploadWidgetVisible } = props;
  const { curAnswer, answers, setAnswerIdx, uploads } = recordState;

  const uploadsToShow = uploads.filter((upload) => !isATaskCancelled(upload));
  const uploadsInProgress = uploadsToShow.filter(
    (upload) => !areAllTasksDone(upload)
  );
  const height = 250;
  const width = 350;

  const mentorSubjects = useActiveMentor((state) => state.data?.subjects);

  interface SubjectUploads{
    subject: Subject;
    uploads: UploadTask[];
  }
  function buildSubjectUploadLists(){
    if(!mentorSubjects){
      return;
    }
    let subjectUploads: SubjectUploads[] = mentorSubjects.map((subject)=>{ return{subject: subject, uploads: []}});
    console.log(mentorSubjects)
    uploadsToShow.forEach((upload)=>{
      subjectUploads.forEach((subjUpload)=>{
        const containsQuestion = subjUpload.subject.questions.find((subjQuestion) =>subjQuestion.question == upload.question)
        if(containsQuestion){
          subjUpload.uploads.push();
        }
      })
    })
    return subjectUploads;
  }
  console.log(buildSubjectUploadLists())


  function retrieveAnswerIdx(id: string) {
    for (let i = 0; i < answers?.length; i++) {
      if (answers[i].answer.question == id) {
        return i;
      }
    }
    //Default case
    return -1;
  }

  async function jumpToAnswer(id: string) {
    const answerIdx = retrieveAnswerIdx(id);
    if (answerIdx !== -1 && onRecordPage) {
      console.log("setting answerIdx: " + answerIdx);
      setAnswerIdx(answerIdx);
    } else {
      console.log("navigating to record page");
      navigate(
        urlBuild("/record", {
          videoId: id,
        })
      );
    }
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
        {uploadsToShow.map((upload, i) => {
          return (
            <div
              key={`upload-card-${i}`}
              data-cy={`upload-card-${i}`}
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
                  jumpToAnswer(upload.question);
                }}
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
    </div>
  );
}

export default UploadingView;
