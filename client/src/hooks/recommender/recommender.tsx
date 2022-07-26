/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { MasterList } from "./use-with-improve-mentor-recc";

/*****************
RECOMMENDER CLASS
*****************/
export class Recommender<IRecommender> {
  recState: IRecommender;
  phases: Phase<IRecommender>[];
  activePhase: Phase<IRecommender>;

  constructor(recState: IRecommender, phases: Phase<IRecommender>[]) {
    this.recState = recState;
    this.phases = phases;
    this.activePhase = this.phases[0];
  }

  public getRecommendations() {
    for (let i = 0; i < this.phases.length; i++) {
      if (this.phases[i].isActive(this.recState)) {
        this.activePhase = this.phases[i];
        return this.phases[i].getRecommendations(this.recState);
      }
    }
    return [];
  }

  public calculations() {
    /*
    First, getRecommendations
    Second, score each recommendation:
       for each key in recommendation, use that key to get weight from weight Record, and perform calculation
    Third, sort recommendations by order of calculated weight
    */

    //array of recommendations from the production rules
    let allRec = this.getRecommendations();
    let phaseWeights = this.activePhase.getPhaseWeights();

    //for each recommendation
    for (let x = 0; x < allRec.length; x++) {
      let individualRec = allRec[x].getScoredAttributes();

      for (const key in individualRec) {
        let initialValue = individualRec[key];
        let phaseValue = phaseWeights[key];
        individualRec[key] = initialValue * phaseValue;
      }

      //sort the recommendations somehow
    }
  }
}

/**********
PHASE CLASS
***********/
export class Phase<IRecommender> {
  productionRules: ProductionRule<IRecommender>[];
  activeCondition;
  phaseWeightedAttributes: Record<string, number>;

  constructor(
    activeCondition: (recState: IRecommender) => boolean,
    productionRules: ProductionRule<IRecommender>[],
    phaseWeightedAttributes: Record<string, number>
  ) {
    this.productionRules = productionRules;
    this.activeCondition = activeCondition;
    this.phaseWeightedAttributes = phaseWeightedAttributes;
  }

  public isActive(recState: IRecommender) {
    // Note: I wonder if this should instead return true if any production rules are active
    for (var x in this.productionRules) {
      if (!this.productionRules[x].isActive(recState)) {
        return false;
      }
    }
    return true;
  }

  public getRecommendations(recState: IRecommender) {
    for (let i = 0; i < this.productionRules.length; i++) {
      if (this.productionRules[i].isActive(recState)) {
        return this.productionRules[i].getRecommendations(recState);
      }
    }
    return [];
  }

  public getPhaseWeights() {
    return this.phaseWeightedAttributes;
  }
}

/*********************
PRODUCTION RULES CLASS
*********************/
export class ProductionRule<IRecommender> {
  activeCondition;
  actionRecommendations;

  constructor(
    activeCondition: (recState: IRecommender) => boolean,
    actionRecommendations: Recommendation[]
  ) {
    this.activeCondition = activeCondition;
    this.actionRecommendations = actionRecommendations;
  }

  public isActive(recState: IRecommender) {
    return this.activeCondition(recState);
  }

  public getRecommendations(recState: IRecommender) {
    return this.actionRecommendations;
  }
}

/********************
RECOMMENDATION CLASS
********************/
export class Recommendation {
  scoredAttributes: Record<string, number>;
  message;

  constructor(scoredAttributes: Record<string, number>, message: string) {
    this.scoredAttributes = scoredAttributes;
    this.message = message;
  }

  public getScoredAttributes() {
    return this.scoredAttributes;
  }
}
