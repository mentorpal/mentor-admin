/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

// A master list of all possible attributes, this list should also have an typescript interface to type the list
// Attributes from this list are provided to the Recommendations
export interface MasterList {
  coverage_attribute: number;
  setup_attribute: number;
  offTopic_attribute: number;
}

/*****************
RECOMMENDER CLASS
*****************/
export class Recommender<IRecommender> {
  recState: IRecommender;
  phases: Phase<IRecommender>[];

  constructor(recState: IRecommender, phases: Phase<IRecommender>[]) {
    this.recState = recState;
    this.phases = phases;
  }

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
  phaseWeightedAttributes: MasterList = {
    coverage_attribute: 0,
    setup_attribute: 0,
    offTopic_attribute: 0,
  };
  recWeightedAttributes;

  // TODO: Needs to also know about all possible attributes, and hold a mapping of weights to attributes
  constructor(
    activeCondition: (recState: IRecommender) => boolean,
    productionRules: ProductionRule<IRecommender>[],
    phaseWeightedAttributes: MasterList = {
      coverage_attribute: 0,
      setup_attribute: 0,
      offTopic_attribute: 0,
    }
  ) {
    this.productionRules = productionRules;
    this.activeCondition = activeCondition;
    this.phaseWeightedAttributes = phaseWeightedAttributes;
    this.recWeightedAttributes = {};
  }

  public isActive(recState: IRecommender) {
    return this.activeCondition(recState);
  }

  // TODO: Implement function that, given recommendations, calculates all their weights and returns them in weighted sorted order
  public getRecommendations(recState: IRecommender) {
    for (let i = 0; i < this.productionRules.length; i++) {
      if (this.productionRules[i].isActive(recState)) {
        //these recommendations come with weights, those weights have to be dot product with the weights from the phase
        const productionRulesRec =
          this.productionRules[i].getRecommendations(recState);

        for (var x in productionRulesRec) {
          //THIS NEEDS TO ADD INSTEAD OF RESETTING
          this.recWeightedAttributes =
            productionRulesRec[x].getScoredAttributes();
        }
        this.calculations();
      }
    }
    return [];
  }

  private calculations() {
    let finalOrder;

    this.phaseWeightedAttributes.coverage_attribute;

    return finalOrder;
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
  scoredAttributes = {};
  message;

  constructor(scoredAttributes: {}, message: string) {
    this.scoredAttributes = scoredAttributes;
    this.message = message;
  }

  public getScoredAttributes() {
    return this.scoredAttributes;
  }
}
