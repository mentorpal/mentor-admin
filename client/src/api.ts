/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import axios from "axios";
import {
  UserAccessToken,
  Mentor,
  Topic,
  Question,
  Subject,
  Connection,
  TrainJob,
  TrainStatus,
  Answer,
} from "types";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const urljoin = require("url-join");

const GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT || "/graphql";
const CLASSIFIER_ENTRYPOINT =
  process.env.CLASSIFIER_ENTRYPOINT || "/classifier";

interface GQLResponse<T> {
  errors?: { message: string }[];
  data?: T;
}
interface SearchParams {
  limit?: number;
  filter?: any;
  cursor?: string;
  sortBy?: string;
  sortAscending?: boolean;
}
const defaultSearchParams = {
  limit: 1000,
  filter: {},
  cursor: null,
  sortBy: null,
  sortAscending: true,
};
interface FetchMentor {
  me: {
    mentor: any;
  };
}
interface FetchSubjects {
  subjects: Connection<Subject>;
}
interface FetchTopics {
  topics: Connection<Topic>;
}
interface UpdateMentor {
  me: {
    updateMentor: boolean;
  };
}
interface UpdateAnswer {
  me: {
    updateAnswer: boolean;
  };
}
interface AddQuestionSet {
  me: {
    addQuestionSet: boolean;
  };
}
interface Login {
  login: UserAccessToken;
}
interface LoginGoogle {
  loginGoogle: UserAccessToken;
}

// remove this later
function convertAnswersToOldQuestions(answers: Answer[]): Question[] {
  return answers.map((a: Answer) => {
    const question: Question = {
      id: a.question._id,
      question: a.question.question,
      subject: a.question.subject,
      topics: [],
      video: a.video,
      transcript: a.transcript,
      status: a.status,
      recordedAt: a.recordedAt,
    };
    return question;
  });
}

export async function fetchSubjects(
  accessToken: string,
  searchParams?: SearchParams
): Promise<Connection<Subject>> {
  const params = { ...defaultSearchParams, ...searchParams };
  const headers = { Authorization: `bearer ${accessToken}` };
  const result = await axios.post<GQLResponse<FetchSubjects>>(
    GRAPHQL_ENDPOINT,
    {
      query: `
      query {
        subjects(
          filter:"${encodeURI(JSON.stringify(params.filter))}",
          limit:${params.limit},
          cursor:${params.cursor},
          sortBy:"${params.sortBy}",
          sortAscending:${params.sortAscending}
        ) {
          edges {
            cursor
            node {
              _id
              name
              description
              isRequired
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
    },
    { headers: headers }
  );
  return result.data.data!.subjects;
}

export async function fetchTopics(
  accessToken: string,
  searchParams?: SearchParams
): Promise<Connection<Topic>> {
  const params = { ...defaultSearchParams, ...searchParams };
  const headers = { Authorization: `bearer ${accessToken}` };
  const result = await axios.post<GQLResponse<FetchTopics>>(
    GRAPHQL_ENDPOINT,
    {
      query: `
      query {
        topics(
          filter:"${encodeURI(JSON.stringify(params.filter))}",
          limit:${params.limit},
          cursor:${params.cursor},
          sortBy:"${params.sortBy}",
          sortAscending:${params.sortAscending}
        ) {
          edges {
            cursor
            node {
              _id
              name
              description
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
    },
    { headers: headers }
  );
  return result.data.data!.topics;
}

export async function fetchMentor(accessToken: string): Promise<Mentor> {
  const headers = { Authorization: `bearer ${accessToken}` };
  const result = await axios.post<GQLResponse<FetchMentor>>(
    GRAPHQL_ENDPOINT,
    {
      query: `
      query {
        me {
          mentor {
            _id
            name
            firstName
            title
            isBuilt
            subjects {
              _id
              name
              description
            }
            answers {
              question {
                _id
                question
                subject {
                  _id
                  name
                  description
                }  
              }
              video
              transcript
              status
              recordedAt
            }
          }  
        }
      }
    `,
    },
    { headers: headers }
  );
  const mentor = result.data.data!.me.mentor;
  mentor.questions = convertAnswersToOldQuestions(mentor.answers);
  return mentor;
}

export async function updateMentor(
  updateMentor: Mentor,
  accessToken: string
): Promise<boolean> {
  const convertedMentor = {
    _id: updateMentor._id,
    name: updateMentor.name,
    firstName: updateMentor.firstName,
    title: updateMentor.title,
    isBuilt: updateMentor.isBuilt,
  };
  const encodedMentor = encodeURI(JSON.stringify(convertedMentor));
  const headers = { Authorization: `bearer ${accessToken}` };
  const result = await axios.post<GQLResponse<UpdateMentor>>(
    GRAPHQL_ENDPOINT,
    {
      query: `
      mutation {
        me {
          updateMentor(mentor: "${encodedMentor}")
        }
      }
    `,
    },
    { headers: headers }
  );
  return result.data.data!.me.updateMentor;
}

export async function updateAnswer(
  mentorId: string,
  question: Question,
  accessToken: string
): Promise<boolean> {
  const questionId = question.id;
  const convertedAnswer = {
    video: question.video,
    transcript: question.transcript,
    status: question.status,
    recordedAt: question.recordedAt,
  };
  const encodedAnswer = encodeURI(JSON.stringify(convertedAnswer));
  const headers = { Authorization: `bearer ${accessToken}` };
  const result = await axios.post<GQLResponse<UpdateAnswer>>(
    GRAPHQL_ENDPOINT,
    {
      query: `
      mutation {
        me {
          updateAnswer(mentorId: "${mentorId}", questionId: "${questionId}", answer: "${encodedAnswer}")
        }
      }
    `,
    },
    { headers: headers }
  );
  return result.data.data!.me.updateAnswer;
}

export async function addQuestionSet(
  mentorId: string,
  subjectId: string,
  accessToken: string
): Promise<boolean> {
  const headers = { Authorization: `bearer ${accessToken}` };
  const result = await axios.post<GQLResponse<AddQuestionSet>>(
    GRAPHQL_ENDPOINT,
    {
      query: `
      mutation {
        me {
          addQuestionSet(mentorId: "${mentorId}", subjectId: "${subjectId}")
        }
      }
    `,
    },
    { headers: headers }
  );
  return result.data.data!.me.addQuestionSet;
}

export async function login(accessToken: string): Promise<UserAccessToken> {
  const result = await axios.post<GQLResponse<Login>>(GRAPHQL_ENDPOINT, {
    query: `
      mutation {
        login(accessToken: "${accessToken}") {
          user {
            _id
            name
          }
          accessToken
        }
      }
    `,
  });
  return result.data.data!.login;
}

export async function loginGoogle(
  accessToken: string
): Promise<UserAccessToken> {
  const result = await axios.post<GQLResponse<LoginGoogle>>(GRAPHQL_ENDPOINT, {
    query: `
      mutation {
        loginGoogle(accessToken: "${accessToken}") {
          user {
            _id
            name
          }
          accessToken
        }
      }
    `,
  });
  return result.data.data!.loginGoogle;
}

export async function trainMentor(mentorId: string): Promise<TrainJob> {
  const res = await axios.post<GQLResponse<TrainJob>>(
    urljoin(CLASSIFIER_ENTRYPOINT, "train"),
    {
      mentor: mentorId,
    }
  );
  return res.data.data!;
}

export async function fetchTrainingStatus(
  statusUrl: string
): Promise<TrainStatus> {
  const result = await axios.get<GQLResponse<TrainStatus>>(statusUrl);
  return result.data.data!;
}
