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
class Recommender<RecommenderState>{
  //all properties should be intialized in the constructor
  recState: RecommenderState;
  phases: Phase[];

  constructor(recState: RecommenderState, phases: Phase[]){
    this.recState = recState;
    this.phases = phases;
  }

  public getRecommendations(){
    for(/*phase in this.phases */){
      if(phase.isActive(this.recState)){
        return phase.getRecommendations(this.recState);
      }
    }
    return[]
  }
}

/**********
PHASE CLASS
***********/
class Phase{

  productionRoles = //another thing
  activeCondition = //something

  public Phase(activeCondition: (recState)=> boolean, productionRoles:ProductionRoles[]){
    this.productionRoles = productionRoles;
    this.activeCondition = activeCondition;
  }

  public isActive(recState: RecommenderState){
    return this.activeCondition(recState);
  }

  public getRecommendations(){
    //for productionRole in self.ProductionRoles:
    // 			if productionRole.isActive(recState):
    // 				return productionRole.getRecommendations(recState)
    // 		return []
  }
}

/*********************
PRODUCTION ROLES CLASS
*********************/
class ProductionRoles{


  public ProductionRoles(activeCondition: (recState)=> boolean, actionRecommendations: Recommendation[]){
    this.activeCondition = activeCondition;
    this.actionRecommendations = actionRecommendations;
  }

  public isActive(recState: RecommenderState){
    return this.activeCondition(recState)
  }

  public getRecommendations(recState: RecommenderState){
    return this.actionRecommendations
  }
}

/********************
RECOMMENDATION CLASS
********************/
class Recommendation{
  public Recommendation(actions:any, attributes:any, buttonText:any, icon: any, type:any){

  }
}




// Pseudocode
//
// class Recommender<RecommenderState>{
// 	public Recommender(recState: RecommenderState, phases: Phase[]):
// 		self.recState = recState
// 		self.phases = phases
	
// 	public getRecommendations():
// 		for phase in self.phases: # check phases in the order that they are provided
// 			if phase.isActive(self.recState):
// 				return phase.getRecommendations(self.recState)
// 		return []
// }
 
// class Phase{
// 	public Phase(activeCondition: (recState)=>boolean, productionRoles: ProductionRoles[]):
// 		self.productionRoles = productionRoles
// 		self.activeCondition = activeCondition
 
// 	public isActive(recState: RecommenderState):
// 		return self.activeCondition(recState)
	
// 	public getRecommendations(recState: RecommenderState):
// 		for productionRole in self.ProductionRoles:
// 			if productionRole.isActive(recState):
// 				return productionRole.getRecommendations(recState)
// 		return []
// }
 
// class ProductionRoles{
// 	public ProductionRoles(activeCondition: (recState)=>boolean, actionRecommendations: Recommendation[]):
// 		self.activeCondition = activeCondition
// 		self.actionRecommendations = actionRecommendations
 
// 	public isActive(recState: RecommenderState):
// 		return self.activeCondition(recState)
	
// 	public getRecommendations(recState: RecommenderState):
// 		return self.actionRecommendations
// }
 
// class Recommendation{
// 	public Recommendation(action, attributes, buttonText, icon, type):
// 		self.action = action
// 		self.attributes = attributes
// 		self.buttonText = buttonText
// 		self.icon = icon
// 		self.type = type
// 		# ... and whatever else a recommendation needs