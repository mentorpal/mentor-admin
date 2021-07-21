/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { navigate } from "gatsby";
import { Answer, Mentor, MentorType, Status, UtteranceName } from "types";
import { useState } from "react";
import { urlBuild } from "helpers";

interface Category {
  subjectName: string;
  subject: string;
  isRequired: boolean;
  categoryName: string;
  category: string;
  answers: Answer[];
}

interface Conditions {
  idle: Answer | undefined;
  idleIncomplete: boolean;
  isVideo: boolean;
  hasThumbnail: boolean;
  categories: Category[];
  incompleteRequirement: Category | undefined;
  firstIncomplete: Category | undefined;
  completedAnswers: number;
  totalAnswers: number;
}
interface Recommendation {
  text: string;
  reason: string;
  input: boolean;
  action: () => void;
  skippable: boolean;
  skip: Conditions;
}

function recommend(conditions: Conditions): Recommendation {
  if (!conditions.hasThumbnail)
    return {
      text: "Add a Thumbnail",
      reason: "A thumbnail helps a user identify your mentor",
      input: true,
      action: () => undefined,
      skippable: true,
      skip: { ...conditions, hasThumbnail: true },
    };
  if (conditions.idleIncomplete && conditions.isVideo)
    return {
      text: "Record an Idle Video",
      reason: "Users see your idle video while typing a question",
      input: false,
      action: () => {
        if (conditions.idle)
          navigate(
            urlBuild("/record", {
              subject: "",
              videoId: conditions.idle?.question._id,
            })
          );
      },
      skippable: true,
      skip: { ...conditions, idleIncomplete: false },
    };
  if (conditions.incompleteRequirement)
    return {
      text: "Finish Required Questions",
      reason:
        "You can't build your mentor until you record all required subjects.",
      input: false,
      action: () => {
        if (conditions.incompleteRequirement)
          navigate(
            urlBuild("/record", {
              subject: conditions.incompleteRequirement.subject,
              status: "INCOMPLETE",
              category: conditions.incompleteRequirement.category,
            })
          );
      },
      skippable: true,
      skip: { ...conditions, incompleteRequirement: undefined },
    };
  if (conditions.completedAnswers < 5)
    return {
      text:
        conditions.totalAnswers < 5 ? "Add a Subject" : "Answer More Questions",
      reason: "You can't build your mentor until you have at least 5 questions",
      input: false,
      action: () => {
        conditions.totalAnswers < 5
          ? navigate("/subjects")
          : navigate(
              urlBuild("/record", {
                subject: "",
                status: "INCOMPLETE",
                category: "",
              })
            );
      },
      skippable: true,
      skip: { ...conditions, completedAnswers: 5 },
    };
  if (conditions.firstIncomplete)
    return {
      text: `Answer ${conditions.firstIncomplete?.categoryName} Questions`,
      reason: `You have unanswered questions in the ${conditions.firstIncomplete?.subjectName} subject`,
      input: false,
      action: () => {
        if (conditions.firstIncomplete)
          navigate(
            urlBuild("/record", {
              subject: conditions.firstIncomplete?.subject,
              status: "INCOMPLETE",
              category: conditions.firstIncomplete?.category,
            })
          );
      },
      skippable: true,
      skip: { ...conditions, firstIncomplete: undefined },
    };
  return {
    text: "Add a Subject",
    reason: "Add a subject to answer more questions",
    input: false,
    action: () => navigate("/subjects"),
    skippable: false,
    skip: conditions,
  };
}

export function UseWithRecommendedAction(
  mentor: Mentor
): [Recommendation, () => void] {
  const idle = mentor?.answers.find(
    (a) => a.question.name === UtteranceName.IDLE
  );
  const idleIncomplete = idle?.status === Status.INCOMPLETE;
  const isVideo = mentor?.mentorType === MentorType.VIDEO;
  const hasThumbnail = Boolean(mentor?.thumbnail);
  const categories: Category[] = [];

  mentor?.subjects.forEach((s) => {
    categories.push({
      subjectName: s.name,
      subject: s._id,
      isRequired: s.isRequired,
      categoryName: s.name,
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
  const firstIncomplete = categories.find((c) =>
    c.answers.find((a) => a.status === Status.INCOMPLETE)
  );

  const completedAnswers =
    mentor?.answers.filter((a) => a.status === Status.COMPLETE).length || 0;
  const totalAnswers = mentor?.answers.length || 0;

  const [recommendedAction, setRecommendedAction] = useState(
    recommend({
      idle: idle,
      idleIncomplete: idleIncomplete,
      isVideo: isVideo,
      hasThumbnail: hasThumbnail,
      categories: categories,
      incompleteRequirement: incompleteRequirement,
      firstIncomplete: firstIncomplete,
      completedAnswers: completedAnswers,
      totalAnswers: totalAnswers,
    })
  );

  function skipRecommendation() {
    setRecommendedAction(recommend(recommendedAction.skip));
  }

  return [recommendedAction, skipRecommendation];
}
