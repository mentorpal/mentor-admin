/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { useState } from "react";

export interface Recommendation {
  buttonText: string;
  icon: JSX.Element;
  type: string;
  // params
  // attributes
}

// These work hand in hand with RecommenderState
export interface ProductionRule {
  // any since compiler doesn't know what RecommenderStateT is.
  condition: (recState: any) => boolean;
  action: () => void;
}

/**
 * Confirm with Ben: The focus of this Recommender is not to calculate the conditions or state itself,
 * but instead it takes provided state, conditions, and weight, and use those to calculate
 * the next recommendation.
 * @param defaultState
 */
export function recommender<RecommenderStateT>(
  defaultState: RecommenderStateT
) {
  const [recommenderState, setRecommenderState] =
    useState<RecommenderStateT>(defaultState);

  function updateFromToken(token: RecommenderStateT) {
    setRecommenderState(token);
  }

  function getRecommendations(): Recommendation[] {
    return [];
  }
}
