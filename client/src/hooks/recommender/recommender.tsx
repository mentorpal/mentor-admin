/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { PriorityQueue, WeightedObj } from "./priorityQueue";

/*****************
RECOMMENDER CLASS
*****************/
export class Recommender<IRecommender> {
  recState: IRecommender;
  phases: Phase<IRecommender>[];
  activePhase: Phase<IRecommender>;
  orderedRecs: PriorityQueue<Recommendation>;

  constructor(recState: IRecommender, phases: Phase<IRecommender>[]) {
    this.recState = recState;
    this.phases = phases;
    this.activePhase = this.phases[0];
    this.orderedRecs = new PriorityQueue();
  }

  public getRecommendations(): Recommendation[] {
    for (let i = 0; i < this.phases.length; i++) {
      if (this.phases[i].isActive(this.recState)) {
        this.activePhase = this.phases[i];
        return this.phases[i].getRecommendations(this.recState);
      }
    }
    return [];
  }

  public getCalculatedRecs(): WeightedObj<Recommendation>[] {
    //array of recommendations from the production rules
    const allRec = this.getRecommendations();
    const phaseWeights = this.activePhase.getPhaseWeights();

    //for each recommendation
    for (let x = 0; x < allRec.length; x++) {
      //get all the attributes of a single recommendation
      const individualRec = allRec[x].getScoredAttributes();
      let finalWeight = 0;

      //iterate through all the attributes of a single recommendation and calculate score
      for (const key in individualRec) {
        const initialValue = individualRec[key];
        const phaseValue = phaseWeights[key];
        finalWeight += initialValue * phaseValue;
      }

      //pass in the final weight as well as the recommendation into the priority queue
      this.orderedRecs.enqueue(allRec[x], finalWeight);
    }

    return this.orderedRecs.getQueue();
  }
}

/**********
PHASE CLASS
***********/
export class Phase<IRecommender> {
  productionRules: ProductionRule<IRecommender>[];
  activeCondition: (recState: IRecommender) => boolean;
  phaseWeightedAttributes: Record<string, number>;
  allRecs: Recommendation[];

  constructor(
    activeCondition: (recState: IRecommender) => boolean,
    productionRules: ProductionRule<IRecommender>[],
    phaseWeightedAttributes: Record<string, number>
  ) {
    this.productionRules = productionRules;
    this.activeCondition = activeCondition;
    this.phaseWeightedAttributes = phaseWeightedAttributes;
    this.allRecs = [];
  }

  public isActive(recState: IRecommender): boolean {
    // Return true if any production rules are active
    for (let x = 0; x < this.productionRules.length; x++) {
      if (
        this.activeCondition(recState) === true &&
        this.productionRules[x].isActive(recState)
      ) {
        return true;
      }
    }
    return false;
  }

  public getRecommendations(recState: IRecommender): Recommendation[] {
    for (let i = 0; i < this.productionRules.length; i++) {
      if (this.productionRules[i].isActive(recState)) {
        // adds recommendations from all active production rules into an array
        for (
          let x = 0;
          x < this.productionRules[i].getRecommendations().length;
          x++
        ) {
          this.allRecs.push(this.productionRules[i].getRecommendations()[x]);
        }
      }
    }
    return this.allRecs;
  }

  public getPhaseWeights(): Record<string, number> {
    return this.phaseWeightedAttributes;
  }
}

/*********************
PRODUCTION RULES CLASS
*********************/
export class ProductionRule<IRecommender> {
  activeCondition: (recState: IRecommender) => boolean;
  actionRecommendations: Recommendation[];
  completedQuestions?: number;

  constructor(
    activeCondition: (recState: IRecommender) => boolean,
    actionRecommendations: Recommendation[],
    completedQuestions?: number
  ) {
    this.activeCondition = activeCondition;
    this.actionRecommendations = actionRecommendations;
    this.completedQuestions = completedQuestions;
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
