/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import { navigate } from "gatsby";
import { Answer, Mentor, MentorType, Status, UtteranceName } from "types";
import { useState } from "react";
import { urlBuild, getValueIfKeyExists } from "helpers";
import {
  AccountBox,
  CheckCircleOutlined,
  FiberManualRecord,
  Image,
  NoteAdd,
} from "@material-ui/icons";
import useActiveMentor from "store/slices/mentor/useActiveMentor";
import useQuestions from "store/slices/questions/useQuestions";
import { QuestionState } from "store/slices/questions";

interface Category {
  subjectName: string;
  subject: string;
  isRequired: boolean;
  categoryName: string;
  category: string;
  answers: Answer[];
}

interface Conditions {
  mentorId: string;
  idle?: Answer;
  intro?: Answer;
  offTopic?: Answer;
  introIncomplete: boolean;
  idleIncomplete: boolean;
  isVideo: boolean;
  offTopicIncomplete: boolean;
  hasThumbnail: boolean;
  isDirty: boolean;
  categories: Category[];
  incompleteRequirement?: Category;
  firstIncomplete?: Category;
  completedAnswers: number;
  totalAnswers: number;
  neverBuilt: boolean;
  builttNeverPreview: boolean;
  needSubject: boolean;
}

interface Recommendation {
  text: string;
  reason: string;
  icon: JSX.Element;
  input?: boolean;
  action: () => void;
  skip?: Conditions;
}

function recommend(
  conditions?: Conditions,
  continueAction?: () => void
): Recommendation {
  if (!conditions)
    return {
      text: "no recommendation",
      reason: "invalid mentor",
      icon: <CheckCircleOutlined />,
      action: () => undefined,
    };
  if (!conditions.hasThumbnail)
    return {
      text: "Add a Thumbnail",
      reason: "A thumbnail helps a user identify your mentor",
      icon: <Image />,
      input: true,
      action: () => undefined,

      skip: { ...conditions, hasThumbnail: true },
    };

  if (conditions.introIncomplete)
    return {
      text: "Add Intro",
      reason: "An Intro helps people to know you",
      icon: <CheckCircleOutlined />,
      input: false,
      action: () => {
        if (conditions.intro)
          navigate(
            urlBuild("/record", {
              subject: "",
              videoId: conditions.intro?.question,
            })
          );
      },

      skip: { ...conditions, introIncomplete: true },
    };
  if (conditions.idleIncomplete && conditions.isVideo) {
    return {
      text: "Record an Idle Video",
      reason: "Users see your idle video while typing a question",
      icon: <AccountBox />,
      input: false,
      action: () => {
        if (conditions.idle)
          navigate(
            urlBuild("/record", {
              subject: "",
              videoId: conditions.idle?.question,
            })
          );
      },

      skip: { ...conditions, idleIncomplete: false },
    };
  }

  if (conditions.offTopicIncomplete)
    return {
      text: "Add Off Topic",
      reason: "An Off Topic",
      icon: <CheckCircleOutlined />,
      input: false,
      action: () => {
        if (conditions.offTopic)
          navigate(
            urlBuild("/record", {
              subject: "",
              videoId: conditions.offTopic?.question,
            })
          );
      },

      skip: { ...conditions, offTopicIncomplete: true },
    };

  if (conditions.needSubject)
    return {
      text: "Add a subject",
      reason:
        "Your mentor doesn't have any subject areas. Subjects give you sets of questions to record.",
      icon: <CheckCircleOutlined />,
      input: false,
      action: () => {
        navigate("/subjects");
      },

      skip: { ...conditions, offTopicIncomplete: true },
    };

  if (
    (!conditions.neverBuilt && conditions.totalAnswers > 0) ||
    conditions.completedAnswers > 5
  )
    return {
      text: "Build Mentor",
      reason:
        "You've answered new questions since you last trained your mentor. Rebuild so you can preview.",
      icon: <CheckCircleOutlined />,
      input: false,
      action: () => continueAction,

      skip: { ...conditions, neverBuilt: true },
    };

  if (conditions.completedAnswers > 5)
    return {
      text: "Build Mentor",
      reason:
        "You've answered new questions since you last trained your mentor. Rebuild so you can preview.",
      icon: <CheckCircleOutlined />,
      input: false,
      action: () => continueAction,
    };

  if (conditions.incompleteRequirement)
    return {
      text: "Finish Required Questions",
      reason:
        "You can't build your mentor until you record all required subjects.",
      input: false,
      icon: <CheckCircleOutlined />,
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

      skip: { ...conditions, incompleteRequirement: undefined },
    };
  if (conditions.completedAnswers < 5)
    return {
      text:
        conditions.completedAnswers < 5
          ? "Answer More Questions"
          : "Add a Subject",
      reason:
        "You need at least a few questions before you can make a mentor, even for testing.",
      icon: conditions.totalAnswers < 5 ? <NoteAdd /> : <FiberManualRecord />,
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

      skip: { ...conditions, completedAnswers: 5 },
    };

  if (conditions.firstIncomplete)
    return {
      text: `Answer ${conditions.firstIncomplete?.categoryName} Questions`,
      reason: `You have unanswered questions in the ${conditions.firstIncomplete?.subjectName} subject`,
      icon: <FiberManualRecord />,
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

      skip: { ...conditions, firstIncomplete: undefined },
    };
  if (conditions.isDirty && continueAction)
    return {
      text: "Build Your Mentor",
      reason:
        "You've answered new questions since you last trained your mentor. Rebuild so you can preview.",
      icon: <FiberManualRecord />,
      input: false,
      action: continueAction,
      skip: { ...conditions, isDirty: false },
    };
  return {
    text: "Add a Subject",
    reason: "Add a subject to answer more questions",
    icon: <NoteAdd />,
    input: false,
    action: () => navigate("/subjects"),
    skip: conditions,
  };
}

function parseMentorConditions(
  mentorQuestions: Record<string, QuestionState>,
  mentor?: Mentor
): Conditions | undefined {
  if (!mentor) {
    return;
  }
  const idle = mentor?.answers.find(
    (a) =>
      getValueIfKeyExists(a.question, mentorQuestions)?.question?.name ===
      UtteranceName.IDLE
  );
  const intro = mentor?.answers.find(
    (a) =>
      getValueIfKeyExists(a.question, mentorQuestions)?.question?.name ===
      UtteranceName.INTRO
  );
  const offTopic = mentor?.answers.find(
    (a) =>
      getValueIfKeyExists(a.question, mentorQuestions)?.question?.name ===
      UtteranceName.OFF_TOPIC
  );

  const introIncomplete = intro?.status === Status.INCOMPLETE;
  const idleIncomplete = idle?.status === Status.INCOMPLETE;
  const offTopicIncomplete = offTopic?.status === Status.INCOMPLETE;

  const isVideo = mentor?.mentorType === MentorType.VIDEO;
  const hasThumbnail = Boolean(mentor?.thumbnail);
  const neverBuilt = Boolean(mentor?.lastTrainedAt);

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
          .map((q) => q.question)
          .includes(a.question)
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
            .map((q) => q.question)
            .includes(a.question)
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

  const builttNeverPreview = Boolean(totalAnswers > 0 && !neverBuilt);

  const needSubject = unique(categories).length;

  return {
    mentorId: mentor._id,
    intro: intro,
    idle: idle,
    offTopic: offTopic,
    offTopicIncomplete: offTopicIncomplete,
    introIncomplete: introIncomplete,
    idleIncomplete: idleIncomplete,
    isVideo: isVideo,
    hasThumbnail: hasThumbnail,
    isDirty: mentor.isDirty,
    categories: categories,
    incompleteRequirement: incompleteRequirement,
    firstIncomplete: firstIncomplete,
    completedAnswers: completedAnswers,
    totalAnswers: totalAnswers,
    neverBuilt: neverBuilt,
    builttNeverPreview: builttNeverPreview,
    needSubject: needSubject === 1,
  };
}

function unique(array: Category[]) {
  return array.filter(
    (e, i) =>
      array.findIndex(
        (a: Category) => a["subjectName"] === e["subjectName"]
      ) === i
  );
}

export function UseWithRecommendedAction(
  continueAction?: () => void
): [Recommendation, () => void] {
  const mentorAnswers = useActiveMentor((ms) => ms.data?.answers);
  const mentorQuestions = useQuestions(
    (s) => s.questions,
    mentorAnswers?.map((a) => a.question)
  );

  const conditions = useActiveMentor((ms) =>
    parseMentorConditions(mentorQuestions, ms.data)
  );

  const [recommendedAction, setRecommendedAction] = useState<Recommendation>(
    recommend(conditions, continueAction)
  );

  React.useEffect(() => {
    const action = recommend(conditions, continueAction);
    setRecommendedAction(action);
  }, [mentorQuestions]);

  function skipRecommendation() {
    const skip = recommend(recommendedAction.skip, continueAction);
    setRecommendedAction(skip);
  }

  return [recommendedAction, skipRecommendation];
}
