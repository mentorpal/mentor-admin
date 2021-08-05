/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import React, { useState, useEffect } from "react";
import { List, ListItem, ListItemText } from "@material-ui/core";
import { Card, Button, Checkbox } from "@material-ui/core";
import { copyAndSet } from "helpers";
import { Subject, SubjectQuestion } from "types";
import { NewQuestionArgs } from "hooks/graphql/use-with-subject";

function FollowUpQuestionsWidget(props: {
  //insert expected props here
  questions: string[];
  categoryId: string;
  mentorId: string;
  addQuestion: (q: NewQuestionArgs) => void;
  removeQuestion: (val: SubjectQuestion) => void;
  editedData?: Subject;
  setFollowUpQs: (qs: string[]) => void;
}): JSX.Element {
  const [seeAll, setSeeAll] = useState(false);
  const [questionList, setQuestionList] = useState<question[]>([]);
  const {
    questions,
    categoryId,
    setFollowUpQs,
    addQuestion,
    removeQuestion,
    editedData,
    mentorId,
  } = props;

  interface question {
    question: string;
    checked: boolean;
  }

  function toggleQuestionCheck(i: number) {
    if (!editedData) return;
    const newCheckValue = !questionList[i].checked;
    const question = questionList[i].question;
    if (newCheckValue == true) {
      addQuestion({
        question: question,
        categoryId: categoryId,
        mentorId: mentorId,
      });
    } else {
      let questionObject = undefined;
      for (let i = 0; i < editedData.questions.length; i++) {
        if (editedData.questions[i].question.question === question)
          questionObject = editedData.questions[i];
      }
      if (questionObject) {
        removeQuestion(questionObject);
      }
    }
    const newQuestionList = copyAndSet(questionList, i, {
      question: question,
      checked: newCheckValue,
    });
    setQuestionList(newQuestionList);
    setFollowUpQs(
      newQuestionList.filter((q) => q.checked).map((q) => q.question)
    );
  }

  if (questionList.length !== questions.length) {
    const tempQuestionList = questions.map((question) => {
      return { question: question, checked: false };
    });
    setQuestionList(tempQuestionList);
  }
  const renderAmount = !seeAll
    ? 6
    : questionList.length > 20
    ? 20
    : questionList.length;
  return (
    <Card
      data-cy="follow-up-q-widget"
      style={{ width: "100%", height: "100%" }}
    >
      <h3>Follow Up Questions</h3>
      <div>
        {" "}
        Pick 2-10 follow up questions that you&apos;d like to answer to improve
        your mentor.{" "}
      </div>
      <List
        style={{
          maxHeight: seeAll ? "100%" : "450px",
          overflow: "scroll",
          overflowX: "hidden",
        }}
      >
        {questionList.slice(0, renderAmount).map((question, i) => {
          return (
            <div key={i}>
              <ListItem divider={true} dense={true} alignItems={"center"}>
                <Checkbox
                  onClick={() => {
                    toggleQuestionCheck(i);
                  }}
                  checked={question.checked}
                />
                <ListItemText
                  primary={question.question}
                  data-cy={`follow-up-question-${i}`}
                />
              </ListItem>
            </div>
          );
        })}
      </List>
      {questionList.length >= 6 ? (
        <Button
          onClick={() => {
            !seeAll ? setSeeAll(true) : setSeeAll(false);
          }}
          style={{ textTransform: "none" }}
        >
          {!seeAll ? "See All" : "See Less"}
        </Button>
      ) : undefined}
    </Card>
  );
}

export default FollowUpQuestionsWidget;
