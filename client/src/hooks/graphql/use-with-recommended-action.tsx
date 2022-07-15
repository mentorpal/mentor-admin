/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import { navigate } from "gatsby";
import { Answer, Mentor, MentorType, UtteranceName } from "types";
import { useState } from "react";
import { urlBuild, getValueIfKeyExists, isAnswerComplete } from "helpers";
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
}

function createAllRecommendations(
  conditions: Conditions,
  continueAction?: () => void
) {
  const reccomendationList: Recommendation[] = [];

  if (!conditions.hasThumbnail)
    reccomendationList.push({
      text: "Add a Thumbnail",
      reason:
        "A thumbnail helps a user pick out your mentor from other mentors.",
      icon: <Image />,
      input: true,
      action: () => undefined,
    });

  if (conditions.introIncomplete)
    reccomendationList.push({
      text: "Add Your Intro",
      reason: "Your mentor's introduction is what they say when a user starts.",
      icon: <CheckCircleOutlined />,
      input: false,
      action: () => {
        if (conditions.intro) {
          navigate(
            urlBuild("/record", {
              subject: "",
              videoId: conditions.intro?.question,
            })
          );
        }
      },
    });

  if (conditions.idleIncomplete && conditions.isVideo)
    reccomendationList.push({
      text: "Record an Idle Video",
      reason: "Users see your idle video while typing a question",
      icon: <AccountBox />,
      input: false,
      action: () => {
        if (conditions.idle) {
          navigate(
            urlBuild("/record", {
              subject: "",
              videoId: conditions.idle?.question,
            })
          );
        }
      },
    });

  if (conditions.offTopicIncomplete)
    reccomendationList.push({
      text: "Add an Off Topic Response",
      reason:
        "The off topic response helps tell the user that the AI didn't understand their question.",
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
    });

  if (conditions.needSubject)
    reccomendationList.push({
      text: "Add a subject",
      reason:
        "Your mentor doesn't have any subject areas. Subjects give you sets of questions to record.",
      icon: <CheckCircleOutlined />,
      input: false,
      action: () => {
        navigate("/subjects");
      },
    });

  if (
    (conditions.isDirty &&
      conditions.completedAnswers >= 5 &&
      continueAction) ||
    (!conditions.neverBuilt &&
      conditions.completedAnswers >= 5 &&
      continueAction)
  )
    reccomendationList.push({
      text: "Build Your Mentor",
      reason:
        "You've answered new questions since you last trained your mentor. Rebuild so you can preview.",
      icon: <CheckCircleOutlined />,
      input: false,
      action: continueAction,
    });

  if (conditions.incompleteRequirement)
    reccomendationList.push({
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
    });

  if (conditions.completedAnswers < 5)
    reccomendationList.push({
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
    });

  if (conditions.firstIncomplete)
    reccomendationList.push({
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
    });

  reccomendationList.push({
    text: "Add a Subject",
    reason: "Add a subject to answer more questions",
    icon: <NoteAdd />,
    input: false,
    action: () => navigate("/subjects"),
  });

  return reccomendationList;
}

function parseMentorConditions(
  mentorQuestions: Record<string, QuestionState>,
  mentor?: Mentor
): Conditions | undefined {
  if (!mentor) {
    return;
  }
  const idle = mentor.answers.find(
    (a) =>
      getValueIfKeyExists(a.question, mentorQuestions)?.question?.name ===
      UtteranceName.IDLE
  );
  const intro = mentor.answers.find(
    (a) =>
      getValueIfKeyExists(a.question, mentorQuestions)?.question?.name ===
      UtteranceName.INTRO
  );
  const offTopic = mentor.answers.find(
    (a) =>
      getValueIfKeyExists(a.question, mentorQuestions)?.question?.name ===
      UtteranceName.OFF_TOPIC
  );

  const introIncomplete =
    !intro || !isAnswerComplete(intro, UtteranceName.INTRO, mentor.mentorType);
  const idleIncomplete =
    !idle || !isAnswerComplete(idle, UtteranceName.IDLE, mentor.mentorType);
  const offTopicIncomplete =
    !offTopic ||
    !isAnswerComplete(offTopic, UtteranceName.OFF_TOPIC, mentor.mentorType);

  const isVideo = mentor?.mentorType === MentorType.VIDEO;
  const hasThumbnail = Boolean(mentor?.thumbnail);
  const neverBuilt = Boolean(mentor?.lastTrainedAt);

  const categories: Category[] = [];

  mentor.subjects.forEach((s) => {
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
    .find((c) =>
      c.answers.find(
        (a) =>
          !isAnswerComplete(
            a,
            getValueIfKeyExists(a.question, mentorQuestions)?.question?.name,
            mentor.mentorType
          )
      )
    );
  const firstIncomplete = categories.find((c) =>
    c.answers.find(
      (a) =>
        !isAnswerComplete(
          a,
          getValueIfKeyExists(a.question, mentorQuestions)?.question?.name,
          mentor.mentorType
        )
    )
  );

  const completedAnswers = mentor.answers.filter((a) =>
    isAnswerComplete(
      a,
      getValueIfKeyExists(a.question, mentorQuestions)?.question?.name,
      mentor.mentorType
    )
  ).length;
  const totalAnswers = mentor.answers.length;

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
): [Recommendation, () => void, number] {
  const { getData } = useActiveMentor();
  const mentorAnswers: Answer[] = getData((ms) => ms.data?.answers);
  const mentorQuestions = useQuestions(
    (s) => s.questions,
    mentorAnswers?.map((a) => a.question)
  );

  const conditions = getData((ms) =>
    parseMentorConditions(mentorQuestions, ms.data)
  );

  const finalRecommendation: Recommendation = {
    text: "Add a Subject",
    reason: "Add a subject to answer more questions",
    icon: <NoteAdd />,
    input: false,
    action: () => navigate("/subjects"),
  };

  const [reccomendationList, setRecommendationList] = useState<
    Recommendation[]
  >([finalRecommendation]);
  const [recommendedAction, setRecommendedAction] =
    useState<Recommendation>(finalRecommendation);
  const [recListIndex, setRecListIndex] = useState<number>(0);

  React.useEffect(() => {
    const generatedReccomendationsList = createAllRecommendations(
      conditions,
      continueAction
    );
    setRecommendationList(generatedReccomendationsList);
  }, [mentorQuestions]);

  React.useEffect(() => {
    setRecommendedAction(reccomendationList[0]);
  }, [reccomendationList]);

  React.useEffect(() => {
    setRecommendedAction(reccomendationList[recListIndex]);
  }, [recListIndex]);

  const recListLength = reccomendationList.length;

  function skipRecommendation() {
    if (recListIndex >= recListLength - 1) {
      setRecListIndex(0);
    } else {
      setRecListIndex(recListIndex + 1);
    }
  }

  return [recommendedAction, skipRecommendation, recListLength];
}
