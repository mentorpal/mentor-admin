/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { Answer, Mentor, MentorType, Status, UtteranceName } from "types";

interface RecommenderState {
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
  //categories: Category[];
  //incompleteRequirement?: Category;
  //firstIncomplete?: Category;
  completedAnswers: number;
  totalAnswers: number;
  neverBuilt: boolean;
  builttNeverPreview: boolean;
  needSubject: boolean;
}

/*****************
RECOMMENDER CLASS
*****************/
class Recommender {
  recState;
  phases;

  constructor(recState: RecommenderState, phases: Phase[]) {
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
class Phase {
  productionRoles;
  activeCondition;

  constructor(
    activeCondition: (recState: RecommenderState) => boolean,
    productionRoles: ProductionRoles[]
  ) {
    this.productionRoles = productionRoles;
    this.activeCondition = activeCondition;
  }

  public isActive(recState: RecommenderState) {
    return this.activeCondition(recState);
  }

  public getRecommendations(recState: RecommenderState) {
    for (let i = 0; i < this.productionRoles.length; i++) {
      if (this.productionRoles[i].isActive(recState)) {
        return this.productionRoles[i].getRecommendations(recState);
      }
    }
    return [];
  }
}

/*********************
PRODUCTION ROLES CLASS
*********************/
class ProductionRoles {
  activeCondition;
  actionRecommendations;

  constructor(
    activeCondition: (recState: RecommenderState) => boolean,
    actionRecommendations: Recommendation[]
  ) {
    this.activeCondition = activeCondition;
    this.actionRecommendations = actionRecommendations;
  }

  public isActive(recState: RecommenderState) {
    return this.activeCondition(recState);
  }

  public getRecommendations(recState: RecommenderState) {
    return this.actionRecommendations;
  }
}

/********************
RECOMMENDATION CLASS
********************/
class Recommendation {
  actions;
  attributes;
  buttonText;
  icon;
  type;

  constructor(
    actions: any,
    attributes: any,
    buttonText: any,
    icon: any,
    type: any
  ) {
    this.actions = actions;
    this.attributes = attributes;
    this.buttonText = buttonText;
    this.icon = icon;
    this.type = type;
  }
}
