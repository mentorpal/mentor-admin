/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { Button, Typography } from "@material-ui/core";
import React from "react";
import { navigate } from "gatsby";
import PropTypes from "prop-types";
import { useWithReviewAnswerState } from "hooks/graphql/use-with-review-answer-state";
import { Answer, MentorType, Status, UtteranceName } from "types";

export default function BashButton(props: {
  accessToken: string;
  setThumbnail: (file: File) => void;
}): JSX.Element {
  const { mentor } = useWithReviewAnswerState(props.accessToken, {
    subject: undefined,
  });
  const bash = {
    text: "",
    reason: "",
    action: () => {
      undefined;
    },
  };
  const idle = mentor?.answers.find(
    (a) => a.question.name === UtteranceName.IDLE
  );
  const categories: {
    subjectName: string;
    subject: string;
    categoryName: string;
    category: string | undefined;
    answers: Answer[];
  }[] = [];

  mentor?.subjects.forEach((s) => {
    categories.push({
      subjectName: s.name,
      subject: s._id,
      categoryName: "Uncategorized",
      category: undefined,
      answers: mentor?.answers.filter((a) =>
        s.questions
          .filter((q) => !q.category)
          .map((q) => q.question._id)
          .includes(a.question._id)
      ),
    });
    s.categories.forEach((c) => {
      categories.push({
        subjectName: s.name,
        subject: s._id,
        categoryName: c.name,
        category: c.id,
        answers: mentor?.answers.filter((a) =>
          s.questions
            .filter((q) => q.category?.id === c.id)
            .map((q) => q.question._id)
            .includes(a.question._id)
        ),
      });
    });
  });
  const firstIncomplete = categories.find((c) =>
    c.answers.find((a) => a.status === Status.INCOMPLETE)
  );

  switch (true) {
    case mentor?.thumbnail == "":
      bash.text = "Add a Thumbnail";
      bash.reason = "A thumbnail helps a user identify your mentor";
      bash.action = () => {
        undefined;
      };
      break;
    case idle?.status === Status.INCOMPLETE &&
      mentor?.mentorType === MentorType.VIDEO:
      bash.text = "Record an Idle Video";
      bash.reason = "Users see your idle video while typing a question";
      bash.action = () => {
        navigate(
          `/record?back=${encodeURI(`/?subject=${undefined}`)}&videoId=${
            idle?.question._id
          }`
        );
      };
      break;
    case Boolean(firstIncomplete):
      bash.text = "Answer " + firstIncomplete?.categoryName + " Questions";
      bash.reason =
        "You have unanswered questions in the " +
        firstIncomplete?.subjectName +
        " subject";
      bash.action = () =>
        navigate(
          `/record?back=${encodeURI(
            `/?subject=${firstIncomplete?.subject}`
          )}&status=${"INCOMPLETE"}&subject=${
            firstIncomplete?.subject
          }&category=${firstIncomplete?.category}`
        );
      break;
    default:
      bash.text = "Add a Subject";
      bash.reason = "Add a subject to answer more questions";
      bash.action = () => navigate("/subjects");
      break;
  }
  return mentor?.thumbnail == "" ? (
    <div>
      <input
        accept="image/*"
        style={{ display: "none" }}
        id="thumbnail-upload"
        data-cy="bash-upload"
        type="file"
        onChange={(e) => {
          e.target.files instanceof FileList
            ? props.setThumbnail(e.target.files[0])
            : undefined;
        }}
      />
      <label htmlFor="thumbnail-upload">
        <Button component="span" fullWidth data-cy="bash-thumbnail">
          {bash.text}
        </Button>
      </label>
      <Typography variant="body1" color="textSecondary" data-cy="bash-reason">
        {bash.reason}
      </Typography>
    </div>
  ) : (
    <div>
      <Button fullWidth data-cy="bash-button" onClick={bash.action}>
        {bash.text}
      </Button>
      <Typography variant="body1" color="textSecondary" data-cy="bash-reason">
        {bash.reason}
      </Typography>
    </div>
  );
}

BashButton.propTypes = {
  accessToken: PropTypes.string.isRequired,
};
