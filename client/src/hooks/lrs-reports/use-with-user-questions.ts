/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  fetchUserQuestions as _fetchUserQuestions,
  UserQuestionGQL,
} from "lrs-api";
import React from "react";

export interface UseWithUserQuestions {
  fetchUserQuestions: (
    startDate: string,
    endDate: string
  ) => Promise<UserQuestionGQL[]>;
}

export function useWithUserQuestions(): UseWithUserQuestions {
  const [userQuestionsInState, setUserQuestions] = React.useState<
    UserQuestionGQL[]
  >([]);
  const [lastFetchedStartDate, setLastFetchedStartDate] =
    React.useState<string>("");
  const [lastFetchedEndDate, setLastFetchedEndDate] =
    React.useState<string>("");

  const filter = (
    startDate: string,
    endDate: string,
    limit: number,
    cursor: string
  ) => {
    return {
      filter: {
        $and: [
          {
            createdAt: { $gt: startDate },
          },
          {
            createdAt: { $lt: endDate },
          },
        ],
      },
      sortBy: "createdAt",
      sortAscending: true,
      limit: limit,
      cursor: cursor,
    };
  };

  const MAX_FETCHES = 50;

  async function recursivelyFetchMoreUserQuestions(
    userQuestionAcc: UserQuestionGQL[],
    totalFetches: number,
    cursor: string,
    startDate: string,
    endDate: string
  ): Promise<UserQuestionGQL[]> {
    if (totalFetches > MAX_FETCHES) {
      console.log(
        "too many page fetches for user questions, try a smaller date range"
      );
      return userQuestionAcc;
    }
    const moreUserQuestionsFetch = await _fetchUserQuestions(
      filter(startDate, endDate, 200, cursor)
    );
    const moreUserQuestions = moreUserQuestionsFetch.edges.map((uq) => uq.node);
    if (moreUserQuestionsFetch.pageInfo.endCursor) {
      return recursivelyFetchMoreUserQuestions(
        [...userQuestionAcc, ...moreUserQuestions],
        totalFetches + 1,
        moreUserQuestionsFetch.pageInfo.endCursor,
        startDate,
        endDate
      );
    }
    return [...userQuestionAcc, ...moreUserQuestions];
  }

  async function fetchUserQuestions(startDate: string, endDate: string) {
    if (
      startDate == lastFetchedStartDate &&
      endDate == lastFetchedEndDate &&
      userQuestionsInState.length
    ) {
      return userQuestionsInState;
    }

    const userQuestionsConnection = await _fetchUserQuestions(
      filter(startDate, endDate, 100, "")
    );
    let userQuestions = userQuestionsConnection.edges.map((edge) => edge.node);
    if (userQuestionsConnection.pageInfo.endCursor) {
      userQuestions = await recursivelyFetchMoreUserQuestions(
        userQuestions,
        0,
        userQuestionsConnection.pageInfo.endCursor,
        startDate,
        endDate
      );
    }
    setLastFetchedStartDate(startDate);
    setLastFetchedEndDate(endDate);
    setUserQuestions(userQuestions);
    return userQuestions;
  }

  return {
    fetchUserQuestions,
  };
}
