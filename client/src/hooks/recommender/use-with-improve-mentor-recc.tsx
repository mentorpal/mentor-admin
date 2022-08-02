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

/**********************************
 * SETUP PRODUCTION RULES AND PHASE
 **********************************/

function buildSetupProductionRule() {
  const resumeSetup = new Recommendation(
    {
      setup_attribute: 1,
    },
    "The Setup is Incomplete"
  );
  const addYourIntro = new Recommendation(
    {
      setup_attribute: 0.5,
    },
    "Add your Intro"
  );
  const recordIdleVideo = new Recommendation(
    {
      setup_attribute: 0.5,
    },
    "Record an Idle Video"
  );
  const addSubject = new Recommendation(
    {
      setup_attribute: 0.5,
    },
    "Add a Subject"
  );
  const setupProductionRule = new ProductionRule<RecommenderInterface>(
    (recState: RecommenderInterface) => {
      return recState.introIncomplete === true;
    },
    [resumeSetup, addYourIntro, recordIdleVideo, addSubject]
  );
  return setupProductionRule;
}

function buildIncompleteProductionRule() {
  const addThumbnail = new Recommendation(
    {
      coverage_attribute: 1,
      thumbnail_attribute: 1,
    },
    "Add a Thumbnail"
  );
  const offTopicResponse = new Recommendation(
    {
      coverage_attribute: 1,
      offTopic_attribute: 1,
    },
    "Add an Off Topic Response"
  );
  const incompleteProductionRule = new ProductionRule<RecommenderInterface>(
    (recState: RecommenderInterface) => {
      return recState.hasThumbnail === false;
    },
    [addThumbnail, offTopicResponse]
  );
  return incompleteProductionRule;
}

function setupPhase(): Phase<RecommenderInterface> {
  // Each phase holds (possibly different) weights for each attribute
  const weightedAttributes = {
    setup_attribute: 2,
    coverage_attribute: 0.5,
    offTopic_attribute: 0.1,
    thumbnail_attribute: 0.3,
  };
  const productionRules = [
    buildSetupProductionRule(),
    buildIncompleteProductionRule(),
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

/**
 * Calling the recommender
 */
export function callingRecommender(): WeightedObj[] {
  const phases = [setupPhase()];
  const recommendationOrder = new Recommender<RecommenderInterface>(
    mockCurrentState,
    phases
  );
  return recommendationOrder.getCalculatedRecs();
}
