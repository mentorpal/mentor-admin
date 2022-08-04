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

/*************************
 * ALL POSSIBLE ATTRIBUTES
 *************************/
interface RecommenderInterface {
  hasName: boolean;
  hasType: boolean;
  hasSubject: boolean;
  hasIdle: boolean;
  isVideo: boolean;
  hasBio: boolean;
  hasOffTopic: boolean;
  hasThumbnail: boolean;
  completedAnswers: number;
  totalAnswers: number;
  hasBuilt: boolean;
  hasPreviewed: boolean;
}

/**
 * Mocking the current state of the program to test values
 */
const mockCurrentState: RecommenderInterface = {
  hasName: false,
  hasType: true,
  hasSubject: false,
  hasIdle: true,
  isVideo: true,
  hasBio: false,
  hasOffTopic: false,
  hasThumbnail: false,
  completedAnswers: 10,
  totalAnswers: 20,
  hasBuilt: false,
  hasPreviewed: false,
};

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
        !recState.hasName === true ||
        !recState.hasType === true ||
        !recState.hasSubject === true ||
        (recState.isVideo ? !recState.hasIdle === true : recState.hasIdle) ||
        !recState.hasBio === true ||
        !recState.hasOffTopic === true
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
      return !recState.hasThumbnail === true;
    },
    [addThumbnail]
  );
  return incompleteProductionRule;
}

function basicProductionRule(
  recState: RecommenderInterface
): ProductionRule<RecommenderInterface> {
  const recordQuestions = new Recommendation(
    {
      coverage_attribute: 1 / recState.completedAnswers,
    },
    "Record More Questions"
  );
  const buildMentor = new Recommendation(
    {
      coverage_attribute: 1 / recState.completedAnswers,
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
        //not adding and breaks whole thing
        return (recState.completedAnswers < 5 ? true : false) === true;
      },
      [recordQuestions, buildMentor, previewMentor]
    );
  return recordQuestionsProductionRule;
}

// function buildAnswerMissedQuestionsPR(): ProductionRule<RecommenderInterface> {
//   const answerMissedQuestions = new Recommendation(
//     {
//       coverage_attribute: 2,
//     },
//     "Answer Missed Questions"
//   );
//   const answerMissedQuestionsPR = new ProductionRule<RecommenderInterface>(
//     (recState: RecommenderInterface) => {
//       return (recState.totalAnswers - recState.completedAnswers > 0
//         ? true
//         : false) === true;
//     },
//     [answerMissedQuestions]
//   );
//   return answerMissedQuestionsPR;
// }

/**********
 * PHASES
 **********/

//Level I - Setup Phase
function setupPhase(): Phase<RecommenderInterface> {
  // Each phase holds (possibly different) weights for each attribute
  const weightedAttributes = {
    setup_attribute: 1,
    coverage_attribute: 1,
    minFakeNeg_attribute: 0,
    pushUpdates_attribute: 1,
    testing_attribute: 0.5,
  };
  const productionRules = [
    setupProductionRule(),
    incompleteProductionRule(),
    //basicProductionRule(mockCurrentState),
  ];
  const setupPhase = new Phase(
    (recState: RecommenderInterface) => {
      return (
        !recState.hasName === true ||
        !recState.hasType === true ||
        !recState.hasSubject === true ||
        (recState.isVideo ? !recState.hasIdle === true : recState.hasIdle) ||
        !recState.hasBio === true ||
        !recState.hasOffTopic === true
      );
    },
    productionRules,
    weightedAttributes
  );
  return setupPhase;
}

//Level II - First Build Phase
// function firstBuildPhase(): Phase<RecommenderInterface> {
//   const weightedAttributes = {
//     setup_attribute: 0,
//     coverage_attribute: 1,
//     minFakeNeg_attribute: 0.2,
//     pushUpdates_attribute: 0.5,
//     testing_attribute: 0.5,
//   };
//   const productionRules = [basicProductionRule(mockCurrentState)];
//   const firstBuildPhase = new Phase(
//     (recState: RecommenderInterface) => {
//       return (
//         (recState.completedAnswers >= 5 ? true : false) === true
//       );
//     },
//     productionRules,
//     weightedAttributes
//   );
//   return firstBuildPhase;
// }

//Level III - Scripted
// function scriptedPhase(): Phase<RecommenderInterface> {
//   const weightedAttributes = {
//     setup_attribute: 0,
//     coverage_attribute: 1,
//     minFakeNeg_attribute: 0.5,
//     pushUpdates_attribute: 1,
//     testing_attribute: 0.5,
//   };
//   const productionRules = [
//     basicProductionRule(mockCurrentState),
//     buildAnswerMissedQuestionsPR(),
//   ];
//   const scriptedPhase = new Phase(
//     (recState: RecommenderInterface) => {
//       return (recState.completedAnswers >= 25 ? true : false) === true;
//     },
//     productionRules,
//     weightedAttributes
//   );
//   return scriptedPhase;
// }

//Level IV?

// Calling the recommender
export function callingRecommender(): WeightedObj[] {
  const phases = [setupPhase()];
  const recommendationOrder = new Recommender<RecommenderInterface>(
    mockCurrentState,
    phases
  );
  return recommendationOrder.getCalculatedRecs();
}
