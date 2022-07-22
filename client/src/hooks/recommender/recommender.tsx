/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

/*****************
RECOMMENDER CLASS
*****************/
export class Recommender<IRecommender> {
  recState: IRecommender;
  phases: Phase<IRecommender>[];

  constructor(recState: IRecommender, phases: Phase<IRecommender>[]) {
    // TODO: Needs to also know about all possible attributes, and hold a mapping of weights to attributes
    this.recState = recState;
    this.phases = phases;
  }

  // TODO: Implement function that, given recommendations, calculates all their weights and returns them in weighted sorted order

  public getRecommendations() {
    for (let i = 0; i < this.phases.length; i++) {
      if (this.phases[i].isActive(this.recState)) {
        return this.phases[i].getRecommendations(this.recState);
      }
    }
    return [];
  }
}

/**********
PHASE CLASS
***********/
export class Phase<IRecommender> {
  productionRules: ProductionRule<IRecommender>[];
  activeCondition;
  weightedAttributesMap: {};

  constructor(
    activeCondition: (recState: IRecommender) => boolean,
    productionRules: ProductionRule<IRecommender>[],
    weightedAttributesMap: {}
  ) {
    this.productionRules = productionRules;
    this.activeCondition = activeCondition;
    this.weightedAttributesMap = weightedAttributesMap;
  }

  public isActive(recState: IRecommender) {
    return this.activeCondition(recState);
  }

  public getRecommendations(recState: IRecommender) {
    for (let i = 0; i < this.productionRules.length; i++) {
      if (this.productionRules[i].isActive(recState)) {
        return this.productionRules[i].getRecommendations(recState);
      }
    }
    return [];
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
    // TODO: perform importance calculations here?
    return this.actionRecommendations;
  }
}

/********************
RECOMMENDATION CLASS
********************/
export class Recommendation {
  scoredAttributes = {};
  message;

  constructor(scoredAttributes: {}, message: string) {
    this.scoredAttributes = scoredAttributes;
    this.message = message;
  }
}
