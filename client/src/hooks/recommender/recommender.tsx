/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { PriorityQueue } from "./priorityQueue";

/*****************
RECOMMENDER CLASS
*****************/
export class Recommender<IRecommender> {
  recState: IRecommender;
  phases: Phase<IRecommender>[];

  /**
   * @param recState The current state data that the recommender relies on.
   * @param phases Phases that the recommender will consider, the order of these phases may matter depending on active conditions of the phases.
   */
  constructor(recState: IRecommender, phases: Phase<IRecommender>[]) {
    this.recState = recState;
    this.phases = phases;
  }

  /**
   * @returns list of recommendations in weighted order from first active phase + production rule
   */
  public getRecommendations(): Recommendation[] {
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
  phaseWeightedAttributes: Record<string, number>;
  activeCondition?: (recState: IRecommender) => boolean;

  /**
   * @param productionRules list of production rules that this phase will hold onto
   * @param phaseWeightedAttributes a record of weights for all possible attributes in this phase, used to perform dot product with recommendations attribute weights to get a recommendations weight
   * @param activeCondition Determines if the phase is active or not (the phase must also have active production rules). If no condition provided, this phase will be active if any of its productions rules are active.
   */
  constructor(
    productionRules: ProductionRule<IRecommender>[],
    phaseWeightedAttributes: Record<string, number>,
    activeCondition?: (recState: IRecommender) => boolean
  ) {
    this.productionRules = productionRules;
    this.phaseWeightedAttributes = phaseWeightedAttributes;
    this.activeCondition = activeCondition;
  }

  public isActive(recState: IRecommender): boolean {
    const atleastOneActivePR = Boolean(
      this.productionRules.find((productionRule) =>
        productionRule.isActive(recState)
      )
    );
    const activeCondition = this.activeCondition
      ? this.activeCondition(recState)
      : true;
    return atleastOneActivePR && activeCondition;
  }

  /**
   * @param recState the current state of the recommender
   * @returns list of recommendations in weighted order
   */
  public getRecommendations(recState: IRecommender): Recommendation[] {
    for (let i = 0; i < this.productionRules.length; i++) {
      if (this.productionRules[i].isActive(recState)) {
        const recommendations = this.productionRules[i].getRecommendations();
        const priorityQueue = new PriorityQueue<Recommendation>();
        recommendations.forEach((rec) => {
          const recWeight = this.getRecommendationWeight(
            rec.getScoredAttributes(),
            this.phaseWeightedAttributes
          );
          priorityQueue.enqueue(rec, recWeight);
        });
        return priorityQueue.getQueue();
      }
    }
    return [];
  }

  public getRecommendationWeight(
    recWeights: Record<string, number>,
    phaseWeights: Record<string, number>
  ): number {
    let totalWeight = 0;
    // Dot products all the keys together
    Object.keys(phaseWeights).forEach((key) => {
      const recWeight = key in recWeights ? recWeights[key] : 0;
      const phaseWeight = phaseWeights[key];
      totalWeight += phaseWeight * recWeight;
    });
    return totalWeight;
  }
}

/*********************
Production Rule
*********************/
export class ProductionRule<IRecommender> {
  activeCondition: (recState: IRecommender) => boolean;
  actionRecommendations: Recommendation[];

  constructor(
    activeCondition: (recState: IRecommender) => boolean,
    actionRecommendations: Recommendation[]
  ) {
    this.activeCondition = activeCondition;
    this.actionRecommendations = actionRecommendations;
  }

  public isActive(recState: IRecommender): boolean {
    return this.activeCondition(recState);
  }

  public getRecommendations(): Recommendation[] {
    return this.actionRecommendations;
  }
}

/********************
RECOMMENDATION CLASS
********************/
export class Recommendation {
  scoredAttributes: Record<string, number>;
  message: string;

  constructor(scoredAttributes: Record<string, number>, message: string) {
    this.scoredAttributes = scoredAttributes;
    this.message = message;
  }

  public getScoredAttributes(): Record<string, number> {
    return this.scoredAttributes;
  }
}
