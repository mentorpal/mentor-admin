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

interface RecommenderInterface {
  // mentorId: string;
  // idle?: boolean;
  // intro?: boolean;
  // offTopic?: boolean;
  intro: boolean;
  //idleIncomplete: boolean;
  //isVideo: boolean;
  offTopic: boolean;
  hasThumbnail: boolean;
  // isDirty: boolean;
  // categories: boolean;
  // incompleteRequirement?: boolean;
  // firstIncomplete?: boolean;
  // completedAnswers: boolean;
  // totalAnswers: boolean;
  neverBuilt: boolean;
  // builttNeverPreview: boolean;
  // needSubject: boolean;
}

const mockCurrentState: RecommenderInterface = {
  intro: true,
  offTopic: true,
  hasThumbnail: true,
  neverBuilt: true,
};

// A master list of all possible attributes, this list should also have an typescript interface to type the list
// Attributes from this list are provided to the Recommendations
// export interface MasterList {
//   coverage_attribute: number;
//   setup_attribute: number;
//   offTopic_attribute: number;
// }

// const masterScoredAttributesList: Record<string, number> = {
//   coverage_attribute: 0,
//   setup_attribute: 0,
//   offTopic_attribute: 0,
// };

/**
 * the first testing production rule
 */
function buildProductionRule1() {
  const recommendation1 = new Recommendation(
    {
      coverage_attribute: 2,
      setup_attribute: 3,
    },
    "setup profile"
  );
  const recommendation2 = new Recommendation(
    {
      coverage_attribute: 2,
      offTopic_attribute: 1,
    },
    "record off topic questions"
  );
  const productionRule = new ProductionRule<RecommenderInterface>(
    (recState: RecommenderInterface) => {
      return recState.offTopic === true;
    },
    [recommendation1, recommendation2]
  );
  return productionRule;
}

/**
 * second production rule testing
 */
function buildProductionRule2() {
  const recommendation1 = new Recommendation(
    {
      coverage_attribute: 0.01,
      setup_attribute: 2,
    },
    "give thumbnail"
  );
  const productionRule = new ProductionRule<RecommenderInterface>(
    (recState: RecommenderInterface) => {
      return recState.hasThumbnail === true;
    },
    [recommendation1]
  );
  return productionRule;
}

/**
 * Creation of phases happens in this file and then they get passed into the recommender constructor
 */
function setupPhase() {
  // Each phase holds (possibly different) weights for each attribute
  const weightedAttributes = {
    setup_attribute: 2,
    coverage_attribute: 0.5,
    offTopic_attribute: 0.1,
    thumbnail_attribute: 0.3,
  };
  const productionRules = [buildProductionRule1(), buildProductionRule2()];
  const setupPhase = new Phase(
    (recState: RecommenderInterface) => {
      return recState.offTopic === true;
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
  const phase = [setupPhase()];
  const recommendationOrder = new Recommender<RecommenderInterface>(
    mockCurrentState,
    phase
  );
  return recommendationOrder.getCalculatedRecs();
}
