/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import React, { useState, useEffect } from "react";
import {
  AppBar,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  makeStyles,
  Toolbar,
} from "@material-ui/core";
import { Card, Button, Checkbox } from "@material-ui/core";
import {
  FollowupsPageState,
  useWithFollowups,
} from "hooks/graphql/use-with-followups";
import { LoadingDialog } from "components/dialog";
import withAuthorizationOnly from "hooks/wrap-with-authorization-only";
import withLocation from "wrap-with-location";
import { NavBar } from "components/nav-bar";
import { copyAndSet } from "helpers";

interface followupListItem {
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
  search: {
    subject: string;
    category: string;
    back?: string;
  };
}): JSX.Element {
  const [seeAll, setSeeAll] = useState(false);
  const [followupList, setFollowupList] = useState<followupListItem[]>([]);
  const { subject, category } = props.search;
  const {
    mentor,
    followUpQuestions,
    saveAndLoadSelectedFollowups,
    setToRecordFollowUpQs,
    toRecordFollowUpQs,
    navigateToMyMentorPage,
    fetchFollowups,
    followupPageState,
  } = useWithFollowups({ categoryId: category, subjectId: subject });
  const classes = useStyles();
  const curSubject = mentor?.subjects.find(
    (s) => s._id === props.search.subject
  );
  const subjectTitle = curSubject?.name || "";
  const curCategory = curSubject?.categories.find(
    (c) => c.id === props.search.category
  );
  const categoryTitle = curCategory?.name || "";
  if (!subject || !category) {
    console.error("followups failed to receive subject or category");
    navigateToMyMentorPage();
  }

  useEffect(() => {
    if (!followUpQuestions || followupList.length) return;
    initFollowupList(followUpQuestions);
  }, [followUpQuestions]);

  function initFollowupList(followups: string[]) {
    const tempQuestionList = followups.map((followup) => {
      return { question: followup, checked: false };
    });
    setFollowupList(tempQuestionList);
  }

  function toggleFollowupCheck(i: number) {
    const checkValue = !followupList[i].checked;
    const curQuestion = followupList[i].question;
    const newQuestionList: followupListItem[] = copyAndSet(followupList, i, {
      question: curQuestion,
      checked: checkValue,
    });
    setToRecordFollowUpQs(
      newQuestionList.filter((q) => q.checked).map((q) => q.question)
    );
    setFollowupList(newQuestionList);
  }

  function handleDoneButton() {
    if (!toRecordFollowUpQs.length) navigateToMyMentorPage();
    else saveAndLoadSelectedFollowups();
  }

  const renderAmount = !seeAll
    ? 6
    : followupList.length > 20
    ? 20
    : followupList.length;

  return (
    <div className={classes.root}>
      <NavBar
        title={
          categoryTitle
            ? `Followups: ${subjectTitle} - ${categoryTitle}`
            : `Followups: ${subjectTitle}`
        }
        mentorId={mentor?._id || ""}
      />
      <Card
        data-cy="follow-up-q-widget"
        style={{ width: "100%", height: "100%" }}
      >
        <h3>Follow Up Questions</h3>
        <div>
          {" "}
          Pick 2-10 follow up questions that you&apos;d like to answer to
          improve your mentor.{" "}
        </div>
        <List
          style={{
            maxHeight: seeAll ? "450px" : "160px",
            overflow: "scroll",
            overflowX: "hidden",
          }}
        >
          {followupList.slice(0, renderAmount).map((followupListItem, i) => {
            return (
              <div key={i}>
                <ListItem divider={true} dense={true} alignItems={"center"}>
                  <Checkbox
                    onClick={() => {
                      toggleFollowupCheck(i);
                    }}
                    checked={followupListItem.checked}
                  />
                  <ListItemText
                    primary={followupListItem.question}
                    data-cy={`follow-up-question-${i}`}
                  />
                </ListItem>
              </div>
            );
          })}
        </List>
        {followupList.length > 6 ? (
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
            {toRecordFollowUpQs.length ? "Record" : "Done"}
          </Button>
        </Toolbar>
      </AppBar>
      <Dialog
        data-cy="generate-followups-dialog"
        open={
          followupPageState === FollowupsPageState.PROMPT_GENERATE_FOLLOWUPS
        }
      >
        <DialogTitle>{"Followup Questions"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {"Would you like to generate followup questions that users may ask? (This may take a minute)"}
          </DialogContentText>
        </DialogContent>
        <DialogContent>
          <Button
            data-cy="do-not-generate-followups-button"
            onClick={() => {
              navigateToMyMentorPage();
            }}
          >
            NO
          </Button>
          <Button
            data-cy="generate-followups-button"
            onClick={() => {
              fetchFollowups();
            }}
          >
            YES
          </Button>
        </DialogContent>
      </Dialog>
      <Dialog
        data-cy="no-followups-generated-dialog"
        open={Boolean(followUpQuestions && !followUpQuestions.length)}
      >
        <DialogTitle>{"Followups"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {"No followups were generated, lets continue on."}
          </DialogContentText>
        </DialogContent>
        <DialogContent>
          <Button
            data-cy="leave-followups-button"
            onClick={() => {
              navigateToMyMentorPage();
            }}
          >
            Done
          </Button>
        </DialogContent>
      </Dialog>
      <LoadingDialog
        title={
          !mentor ||
          followupPageState === FollowupsPageState.GENERATING_FOLLOWUPS ||
          followupPageState === FollowupsPageState.SAVING_SELECTED_FOLLOWUPS
            ? "Loading..."
            : ""
        }
      />
    </div>
  );
}

export default withAuthorizationOnly(withLocation(FollowupsPage));
