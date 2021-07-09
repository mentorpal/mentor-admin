/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { Button, Typography } from "@material-ui/core";
import React from "react";
import { navigate } from "gatsby";
import { useWithReviewAnswerState } from "hooks/graphql/use-with-review-answer-state";
import { Answer, MentorType, Status, UtteranceName } from "types";

function urlBuild(base: string, params: Record<string, string>) {
  const query = new URLSearchParams();
  Object.keys(params).forEach((n) => query.append(n, params[n]));
  return `${base}?${query.toString()}`;
}

export default function RecommendedActionButton(props: {
  accessToken: string;
  setThumbnail: (file: File) => void;
}): JSX.Element {
  const { mentor } = useWithReviewAnswerState(props.accessToken, {
    subject: "",
  });
  const idle = mentor?.answers.find(
    (a) => a.question.name === UtteranceName.IDLE
  );
  const categories: {
    subjectName: string;
    subject: string;
    isRequired: boolean;
    categoryName: string;
    category: string;
    answers: Answer[];
  }[] = [];

  mentor?.subjects.forEach((s) => {
    categories.push({
      subjectName: s.name,
      subject: s._id,
      isRequired: s.isRequired,
      categoryName: "Uncategorized",
      category: "",
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
        isRequired: s.isRequired,
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
  const incompleteRequirement = categories
    .filter((c) => c.isRequired)
    .find((c) => c.answers.find((a) => a.status === Status.INCOMPLETE));
  console.log;
  const firstIncomplete = categories.find((c) =>
    c.answers.find((a) => a.status === Status.INCOMPLETE)
  );

  const completedAnswers =
    mentor?.answers.filter((a) => a.status === Status.COMPLETE).length || 0;
  const totalAnswers = mentor?.answers.length || 0;

  function recommend(): {
    text: string;
    reason: string;
    action: () => void;
  } {
    if (mentor?.thumbnail == "")
      return {
        text: "Add a Thumbnail",
        reason: "A thumbnail helps a user identify your mentor",
        action: () => undefined,
      };
    if (
      idle?.status === Status.INCOMPLETE &&
      mentor?.mentorType === MentorType.VIDEO
    )
      return {
        text: "Record an Idle Video",
        reason: "Users see your idle video while typing a question",
        action: () => {
          navigate(
            urlBuild("/record", { subject: "", videoId: idle?.question._id })
          );
        },
      };
    if (incompleteRequirement)
      return {
        text: "Finish Required Questions",
        reason:
          "You can't build your mentor until you record all required subjects.",
        action: () =>
          navigate(
            urlBuild("/record", {
              subject: incompleteRequirement.subject,
              status: "INCOMPLETE",
              category: incompleteRequirement.category,
            })
          ),
      };
    if (completedAnswers < 5)
      return {
        text: totalAnswers < 5 ? "Add a Subject" : "Answer More Questions",
        reason:
          "You can't build your mentor until you have at least 5 questions",
        action: () => {
          totalAnswers < 5
            ? navigate("/subjects")
            : navigate(
                urlBuild("/record", {
                  subject: "",
                  status: "INCOMPLETE",
                  category: "",
                })
              );
        },
      };
    if (firstIncomplete)
      return {
        text: `Answer ${firstIncomplete?.categoryName} Questions`,
        reason: `You have unanswered questions in the ${firstIncomplete?.subjectName} subject`,
        action: () =>
          navigate(
            urlBuild("/record", {
              subject: firstIncomplete?.subject,
              status: "INCOMPLETE",
              category: firstIncomplete?.category,
            })
          ),
      };
    return {
      text: "Add a Subject",
      reason: "Add a subject to answer more questions",
      action: () => navigate("/subjects"),
    };
  }
  const recommendedAction = recommend();

  return mentor?.thumbnail == "" ? (
    <div>
      <input
        accept="image/*"
        style={{ display: "none" }}
        id="thumbnail-upload"
        data-cy="recommended-action-upload"
        type="file"
        onChange={(e) => {
          e.target.files instanceof FileList
            ? props.setThumbnail(e.target.files[0])
            : undefined;
        }}
      />
      <label htmlFor="thumbnail-upload">
        <Button
          component="span"
          fullWidth
          data-cy="recommended-action-thumbnail"
        >
          {recommendedAction.text}
        </Button>
      </label>
      <Typography
        variant="body1"
        color="textSecondary"
        data-cy="recommended-action-reason"
      >
        {recommendedAction.reason}
      </Typography>
    </div>
  ) : (
    <div>
      <Button
        fullWidth
        data-cy="recommended-action-button"
        onClick={recommendedAction.action}
      >
        {recommendedAction.text}
      </Button>
      <Typography
        variant="body1"
        color="textSecondary"
        data-cy="recommended-action-reason"
      >
        {recommendedAction.reason}
      </Typography>
    </div>
  );
}
