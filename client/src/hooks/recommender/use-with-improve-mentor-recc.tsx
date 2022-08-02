/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { WeightedObj } from "./priorityQueue";
import {
  Recommendation,
  ProductionRule,
  Phase,
  Recommender,
} from "./recommender";
import { Answer, Mentor, MentorType, Status, UtteranceName } from "types";
import { getValueIfKeyExists } from "helpers";

import useActiveMentor from "store/slices/mentor/useActiveMentor";
import useQuestions from "store/slices/questions/useQuestions";
import { QuestionState } from "store/slices/questions";
import { useWithRecordState } from "hooks/graphql/use-with-record-state";

/*************************
 * ALL POSSIBLE ATTRIBUTES
 *************************/
interface RecommenderInterface {
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

const { getData } = useActiveMentor();
const mentorAnswers: Answer[] = getData((ms) => ms.data?.answers);
const mentorQuestions = useQuestions(
  (s) => s.questions,
  mentorAnswers?.map((a) => a.question)
);

const conditions = getData((ms) =>
  parseMentorConditions(mentorQuestions, ms.data)
);

/**
 * Mocking the current state of the program to test values
 */
const mockCurrentState: RecommenderInterface = {
  mentorId: conditions.mentorId,
  //idle?: conditions.idle,
  //intro?: conditions.intro,
  //offTopic?: conditions.offTopic,
  introIncomplete: conditions.introIncomplete,
  idleIncomplete: conditions.idleIncomplete,
  isVideo: conditions.isVideo,
  offTopicIncomplete: conditions.offTopicIncomplete,
  hasThumbnail: conditions.hasThumbnail,
  isDirty: conditions.isDirty,
  categories: conditions.categories,
  //incompleteRequirement?: conditions.incompleteRequirement,
  //firstIncomplete?: conditions.firstIncomplete,
  completedAnswers: conditions.completedAnswers,
  totalAnswers: conditions.totalAnswers,
  neverBuilt: conditions.neverBuilt,
  builttNeverPreview: conditions.builttNeverPreview,
  needSubject: conditions.needSubject,
};

interface Category {
  subjectName: string;
  subject: string;
  isRequired: boolean;
  categoryName: string;
  category: string;
  answers: Answer[];
}

function parseMentorConditions(
  mentorQuestions: Record<string, QuestionState>,
  mentor?: Mentor
): RecommenderInterface | undefined {
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

/**********************
 * ALL PRODUCTION RULES
 **********************/

function setupProductionRule(): ProductionRule<RecommenderInterface> {
  const setUpName = new Recommendation(
    {
      setup_attribute: 0.9,
    },
    "Finish Setup: Name"
  );
  const setupType = new Recommendation(
    {
      setup_attribute: 0.8,
    },
    "Finish Setup: Type"
  );
  const setupSubject = new Recommendation(
    {
      setup_attribute: 0.7,
    },
    "Finish Setup: Subject"
  );
  const setupIdle = new Recommendation(
    {
      setup_attribute: 0.6,
    },
    "Record an Idle Video"
  );
  const setupBio = new Recommendation(
    {
      setup_attribute: 0.5,
    },
    "Add a Subject"
  );
  const setupOffTopic = new Recommendation(
    {
      setup_attribute: 0.4,
    },
    "Finish Setup: Off Topic"
  );
  const setupProductionRule = new ProductionRule<RecommenderInterface>(
    (recState: RecommenderInterface) => {
      return (
        recState.introIncomplete &&
        recState.introIncomplete &&
        recState.idleIncomplete &&
        recState.needSubject
      );
    },
    [setUpName, setupType, setupSubject, setupIdle, setupBio, setupOffTopic]
  );
  return setupProductionRule;
}

function incompleteProductionRule(): ProductionRule<RecommenderInterface> {
  const addThumbnail = new Recommendation(
    {
      coverage_attribute: 1,
      thumbnail_attribute: 1,
    },
    "Add a Thumbnail"
  );
  const incompleteProductionRule = new ProductionRule<RecommenderInterface>(
    (recState: RecommenderInterface) => {
      return !recState.hasThumbnail && recState.offTopicIncomplete;
    },
    [addThumbnail]
  );
  return incompleteProductionRule;
}

function basicProductionRule(): ProductionRule<RecommenderInterface> {
  const recordQuestions = new Recommendation(
    {
      coverage_attribute: 1/recState.completedAnswers,
    },
    "Record More Questions"
  );
  const buildMentor = new Recommendation(
    {
      coverage_attribute: 1/recState.completedAnswers,
    },
    "Build your Mentor"
  );
  const previewMentor = new Recommendation(
    {
      coverage_attribute: 0.5,
    },
    "Preview your Mentor"
  );
  const recordQuestionsProductionRule =
    new ProductionRule<RecommenderInterface>(
      (recState: RecommenderInterface) => {
        return recState.completedAnswers < 5 ? true : false;
      },
      [recordQuestions, buildMentor, previewMentor]
      //somehow need to bring in rec state to get num of comAnswer
    );
  return recordQuestionsProductionRule;
}


function buildAnswerMissedQuestionsPR(): ProductionRule<RecommenderInterface> {
  const answerMissedQuestions = new Recommendation(
    {
      coverage_attribute: 2,
    },
    "Answer Missed Questions"
  );
  const answerMissedQuestionsPR = new ProductionRule<RecommenderInterface>(
    (recState: RecommenderInterface) => {
      return recState.totalAnswers - recState.completedAnswers > 0
        ? true
        : false;
    },
    [answerMissedQuestions]
  );
  return answerMissedQuestionsPR;
}

/************************
 * SETUP PHASE - LEVEL 1
************************/

function setupPhase(): Phase<RecommenderInterface> {
  // Each phase holds (possibly different) weights for each attribute
  const weightedAttributes = {
    setup_attribute: 1,
    coverage_attribute: 1,
    publishUpdates_attribute: 1,
    testing_attribute: 0.5,
  };
  const productionRules = [
    setupProductionRule(),
    incompleteProductionRule(),
    basicProductionRule(),
  ];
  const setupPhase = new Phase(
    (recState: RecommenderInterface) => {
      return recState.offTopicIncomplete === true;
    },
    productionRules,
    weightedAttributes
  );
  return setupPhase;
}

/********************
 * FIRST BUILD PHASE - LEVEL 2
 ********************/

function firstBuildPhase(): Phase<RecommenderInterface> {
  const weightedAttributes = {
    coverage_attribute: 4,
  };
  const productionRules = [
    basicProductionRule(),
  ];
  const firstBuildPhase = new Phase(
    (recState: RecommenderInterface) => {
      return recState.builttNeverPreview === true;
    },
    productionRules,
    weightedAttributes
  );
  return firstBuildPhase;
}

/****************
 * SCRIPTED PHASE - LEVEL 3
 ****************/

function scriptedPhase(): Phase<RecommenderInterface> {
  const weightedAttributes = {
    coverage_attribute: 4,
  };
  const productionRules = [
    basicProductionRule(),
    buildAnswerMissedQuestionsPR(),
  ];
  const scriptedPhase = new Phase(
    (recState: RecommenderInterface) => {
      return recState.builttNeverPreview === true;
    },
    productionRules,
    weightedAttributes
  );
  return scriptedPhase;
}

/**
 * LEVEL 4
 */

// Calling the recommender
export function callingRecommender(): WeightedObj[] {
  const phases = [setupPhase(), firstBuildPhase(), scriptedPhase()];
  const recommendationOrder = new Recommender<RecommenderInterface>(
    mockCurrentState,
    phases
  );
  return recommendationOrder.getCalculatedRecs();
}
