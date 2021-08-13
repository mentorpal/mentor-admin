/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import React, { useState, useEffect } from "react";
import { AppBar, List, ListItem, ListItemText, makeStyles, Toolbar } from "@material-ui/core";
import { Card, Button, Checkbox } from "@material-ui/core";
import { useWithFollowups } from "hooks/graphql/use-with-followups";
import { LoadingDialog } from "components/dialog";
import withAuthorizationOnly from "hooks/wrap-with-authorization-only";
import withLocation from "wrap-with-location";
import { navigate } from "gatsby";
import { NavBar } from "components/nav-bar";
import { copyAndSet } from "helpers";

interface question {
  question: string;
  checked: boolean;
}

const useStyles = makeStyles(() => ({
  root: {
    width: "100%",
    height: "100%",
  },
  footer: {
    top: "auto",
    bottom: 0,
    backgroundColor: "#eee",
    opacity: 0.8,
  },
  row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  nextBtn: {
    position: "absolute",
    right: 0,
  },
}));

function FollowupsPage(props: {
  //insert expected props here
  search: {
    subject: string;
    category: string;
    back?: string;
  };
}): JSX.Element {
  const [seeAll, setSeeAll] = useState(false);
  const [questionList, updateQuestionList] = useState<question[]>([]);
  const {
    subject,
    category
  } = props.search;
  const {mentor, followUpQuestions, saveAndLoadNewFollowups} = useWithFollowups({categoryId: category, subjectId: subject});
  const classes = useStyles();
  const curSubject = mentor?.subjects.find(
    (s) => s._id == props.search.subject
  );
  const subjectTitle = curSubject?.name || "";
  const curCategory = curSubject?.categories.find((c) => c.id == props.search.category)
  const categoryTitle = curCategory?.name || "";
  if(!subject || !category){
    navigate("/")
  }

  useEffect(()=>{
    if(!followUpQuestions.length || questionList.length)
      return;
    setQuestionList(followUpQuestions);
  }, [followUpQuestions])



  if(!followUpQuestions.length || !mentor){
    return (
      <div>
        <LoadingDialog title={"Loading..."} />
      </div>
    );
  }

  function toggleQuestionCheck(i: number) {
    const checkValue = !questionList[i].checked;
    const question = questionList[i].question;
    updateQuestionList(
      copyAndSet(questionList, i, {
        question: question,
        checked: checkValue,
      })
    );
  }

  function setQuestionList(followups: string[]){
    const tempQuestionList = followups.map((followup) => {
      return { question: followup, checked: false };
    });
    updateQuestionList(tempQuestionList);
  }

  function handleDoneButton(){
    const followups = questionList.filter((question)=>question.checked).map(question=>question.question)
    if(!followups.length)
      navigate("/")
    else
      saveAndLoadNewFollowups(followups)
  }

  const renderAmount = !seeAll
    ? 6
    : questionList.length > 20
    ? 20
    : questionList.length;
  return (
    <div className={classes.root}>
      <NavBar         title={
          categoryTitle
            ? `Followups: ${subjectTitle} - ${categoryTitle}`
            : `Followups: ${subjectTitle}`
        } mentorId={mentor._id} />
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
            maxHeight: seeAll ? "450px" : "160px",
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
        <Button
          onClick={() => {
            !seeAll ? setSeeAll(true) : setSeeAll(false);
          }}
          style={{ textTransform: "none" }}
        >
          {!seeAll ? "See All" : "See Less"}
        </Button>
      </Card>
      <AppBar position="fixed" className={classes.footer}>
        <Toolbar className={classes.row} style={{ justifyContent: "center" }}>
          <Button
            data-cy="done-btn"
            variant="contained"
            color="primary"
            disableElevation
            onClick={handleDoneButton}
            className={classes.nextBtn}
          >
            Done
          </Button>
        </Toolbar>
      </AppBar>
    </div>
  );
}

export default withAuthorizationOnly(withLocation(FollowupsPage));
