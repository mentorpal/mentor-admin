/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { execGql } from "api";
import { SearchParams } from "hooks/graphql/use-with-data-connection";
import { ClassifierAnswerType, Connection } from "types";
import { MentorGQL } from "types-gql";

const defaultSearchParams = {
  limit: 9999,
  filter: {},
  cursor: "",
  sortBy: "",
  sortAscending: true,
};

interface AnswerGQL {
  question: {
    question: string;
  };
}

export interface UserQuestionGQL {
  question: string;
  mentor: MentorGQL;
  classifierAnswerType: ClassifierAnswerType;
  createdAt: string;
  feedback: string;
  confidence: number;
  classifierAnswer: AnswerGQL;
  graderAnswer?: AnswerGQL;
}

export async function fetchUserQuestions(
  searchParams?: SearchParams
): Promise<Connection<UserQuestionGQL>> {
  const params = { ...defaultSearchParams, ...searchParams };
  const gql = await execGql<Connection<UserQuestionGQL>>(
    {
      query: `
        query UserQuestions($filter: Object!, $limit: Int!, $cursor: String!, $sortBy: String!, $sortAscending: Boolean!){
          userQuestions(filter: $filter, limit: $limit,cursor: $cursor,sortBy: $sortBy,sortAscending: $sortAscending){
             edges {
              cursor
              node {
                question
                classifierAnswerType
                createdAt
                feedback
                confidence
                mentor {
                  _id
                  name
                }
                classifierAnswer{
                  question{
                    question
                  }
                }
                graderAnswer{
                  question{
                    question
                  }
                }
                
              }
            }
            pageInfo {
              startCursor
              endCursor
              hasPreviousPage
              hasNextPage
            }
          }
        }
      `,
      variables: {
        filter: params.filter,
        limit: params.limit,
        cursor: params.cursor,
        sortBy: params.sortBy,
        sortAscending: params.sortAscending,
      },
    },
    { dataPath: "userQuestions" }
  );
  return gql;
}
