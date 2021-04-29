/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import axios from "axios";
import {
  UserAccessToken,
  Mentor,
  Subject,
  Connection,
  AsyncJob,
  TrainStatus,
  Answer,
  Question,
  UserQuestion,
  VideoStatus,
} from "types";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const urljoin = require("url-join");

export const CLIENT_ENDPOINT = process.env.CLIENT_ENDPOINT || "/chat";
export const GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT || "/graphql";
export const CLASSIFIER_ENTRYPOINT =
  process.env.CLASSIFIER_ENTRYPOINT || "/classifier";
export const VIDEO_ENTRYPOINT = process.env.VIDEO_ENTRYPOINT || "/videos";

interface SearchParams {
  limit?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filter?: any;
  cursor?: string;
  sortBy?: string;
  sortAscending?: boolean;
}
const defaultSearchParams = {
  limit: 1000,
  filter: {},
  cursor: "",
  sortBy: "",
  sortAscending: true,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function stringifyObject(value: any) {
  return JSON.stringify(value).replace(/"([^"]+)":/g, "$1:");
}

function isValidObjectID(id: string) {
  return id.match(/^[0-9a-fA-F]{24}$/);
}

interface GraphQLResponse<T> {
  errors?: { message: string }[];
  data?: T;
}

interface Config {
  googleClientId: string;
}

export async function fetchConfig(): Promise<Config> {
  const gqlRes = await axios.post<GraphQLResponse<{ config: Config }>>(
    GRAPHQL_ENDPOINT,
    {
      query: `
      query {
        config {
          googleClientId
        }
      }
    `,
    }
  );
  if (gqlRes.status !== 200) {
    throw new Error(`config load failed: ${gqlRes.statusText}}`);
  }
  if (gqlRes.data.errors) {
    throw new Error(
      `errors reponse to config query: ${JSON.stringify(gqlRes.data.errors)}`
    );
  }
  if (!gqlRes.data.data) {
    throw new Error(
      `no data in non-error reponse: ${JSON.stringify(gqlRes.data)}`
    );
  }
  return gqlRes.data.data.config;
}

export async function fetchSubjects(
  searchParams?: SearchParams
): Promise<Connection<Subject>> {
  const params = { ...defaultSearchParams, ...searchParams };
  const result = await axios.post(GRAPHQL_ENDPOINT, {
    query: `
      query {
        subjects(
          filter:${stringifyObject(params.filter)},
          limit:${params.limit},
          cursor:"${params.cursor}",
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
  });
  return result.data.data.subjects;
}

export async function fetchSubject(id: string): Promise<Subject> {
  const result = await axios.post(GRAPHQL_ENDPOINT, {
    query: `
      query {
        subject(id: "${id}") {
          _id
          name
          description
          categories {
            id
            name
            description
          }
          topics {
            id
            name
            description
          }
          questions {
            question {
              _id
              question
              type
              name
              paraphrases
              mentor
            }
            category {
              id
              name
              description
            }
            topics {
              id
              name
              description
            }
          }
        }
      }
    `,
  });
  return result.data.data.subject;
}

export async function updateSubject(
  subject: Partial<Subject>,
  accessToken: string
): Promise<Subject> {
  const convertedSubject: Partial<Subject> = {
    name: subject.name,
    description: subject.description,
    categories: subject.categories,
    topics: subject.topics,
    questions: subject.questions,
  };
  if (isValidObjectID(subject._id || "")) {
    convertedSubject._id = subject._id;
  }
  const headers = { Authorization: `bearer ${accessToken}` };
  const result = await axios.post(
    GRAPHQL_ENDPOINT,
    {
      query: `
      mutation {
        me {
          updateSubject(subject: ${stringifyObject(convertedSubject)}) {
            _id
          }
        }
      }
    `,
    },
    { headers: headers }
  );
  return result.data.data.me.updateSubject;
}

export async function fetchQuestions(
  searchParams?: SearchParams
): Promise<Connection<Question>> {
  const params = { ...defaultSearchParams, ...searchParams };
  const result = await axios.post(GRAPHQL_ENDPOINT, {
    query: `
      query {
        questions(
          filter:${stringifyObject(params.filter)},
          limit:${params.limit},
          cursor:"${params.cursor}",
          sortBy:"${params.sortBy}",
          sortAscending:${params.sortAscending}
        ) {
          edges {
            cursor
            node {
              _id
              question
              type
              name
              paraphrases
              mentor
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
  });
  return result.data.data.questions;
}

export async function fetchQuestion(id: string): Promise<Question> {
  const result = await axios.post(GRAPHQL_ENDPOINT, {
    query: `
      query {
        question(id: "${id}") {
          _id
          question
          type
          name
          paraphrases
          mentor
        }
      }
    `,
  });
  return result.data.data.question;
}

export async function fetchUserQuestions(
  searchParams?: SearchParams
): Promise<Connection<UserQuestion>> {
  const params = { ...defaultSearchParams, ...searchParams };
  const result = await axios.post(GRAPHQL_ENDPOINT, {
    query: `
      query {
        userQuestions(
          filter:${stringifyObject(params.filter)},
          limit:${params.limit},
          cursor:"${params.cursor}",
          sortBy:"${params.sortBy}",
          sortAscending:${params.sortAscending}
        ) {
          edges {
            cursor
            node {
              _id
              question
              confidence
              classifierAnswerType
              feedback
              updatedAt
              createdAt
              mentor {
                _id
                name
              }
              classifierAnswer {
                _id
                transcript
                question {
                  _id
                  question
                }
              }
              graderAnswer {
                _id
                transcript
                question {
                  _id
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
  });
  return result.data.data.userQuestions;
}

export async function fetchUserQuestion(id: string): Promise<UserQuestion> {
  const result = await axios.post(GRAPHQL_ENDPOINT, {
    query: `
      query {
        userQuestion(id: "${id}") {
          _id
          question
          confidence
          classifierAnswerType
          feedback
          updatedAt
          createdAt
          mentor {
            _id
            name
          }
          classifierAnswer {
            _id
            transcript
            question {
              _id
              question
            }
          }
          graderAnswer {
            _id
            transcript
            question {
              _id
              question
            }
          }
        }
      }
    `,
  });
  return result.data.data.userQuestion;
}

export async function updateUserQuestion(
  feedbackId: string,
  answerId: string
): Promise<UserQuestion> {
  const result = await axios.post(GRAPHQL_ENDPOINT, {
    query: `
      mutation {
        userQuestionSetAnswer(id: "${feedbackId}", answer: "${answerId}") {
          _id
        }
      }
    `,
  });
  return result.data.data.userQuestionSetAnswer;
}

export async function fetchMentorId(accessToken: string): Promise<Mentor> {
  const headers = { Authorization: `bearer ${accessToken}` };
  const result = await axios.post(
    GRAPHQL_ENDPOINT,
    {
      query: `
      query {
        me {
          mentor {
            _id
          }
        }
      }
    `,
    },
    { headers: headers }
  );
  return result.data.data.me.mentor;
}

export async function fetchMentor(
  accessToken: string,
  subject?: string,
  topic?: string,
  status?: string
): Promise<Mentor> {
  const headers = { Authorization: `bearer ${accessToken}` };
  const result = await axios.post(
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
            mentorType
            lastTrainedAt
            defaultSubject {
              _id
            }
            subjects {
              _id
              name
              description
              categories {
                id
                name
                description
              }
              topics {
                id
                name
                description
              }
              questions {
                question {
                  _id
                  question
                  type
                  name
                  paraphrases
                  mentor
                }
                category {
                  id
                  name
                  description
                }
                topics {
                  id
                  name
                  description
                }
              }
            }
            topics(subject: "${subject || ""}") {
              id
              name
              description
            }
            answers(subject: "${subject || ""}", topic: "${
        topic || ""
      }", status: "${status || ""}") {
              _id
              question {
                _id
                question
                paraphrases
                type
                name
                mentor
              }
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
  return result.data.data.me.mentor;
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
    mentorType: updateMentor.mentorType,
    defaultSubject: updateMentor.defaultSubject?._id,
    subjects: updateMentor.subjects.map((s) => s._id),
  };
  const headers = { Authorization: `bearer ${accessToken}` };
  const result = await axios.post(
    GRAPHQL_ENDPOINT,
    {
      query: `
      mutation {
        me {
          updateMentor(mentor: ${stringifyObject(convertedMentor)})
        }
      }
    `,
    },
    { headers: headers }
  );
  return result.data.data.me.updateMentor;
}

export async function updateQuestion(
  updateQuestion: Question,
  accessToken: string
): Promise<boolean> {
  const headers = { Authorization: `bearer ${accessToken}` };
  const result = await axios.post(
    GRAPHQL_ENDPOINT,
    {
      query: `
        mutation {
          me {
            updateQuestion(question: ${stringifyObject(updateQuestion)}) {
              _id
            }
          }
        }
      `,
    },
    { headers: headers }
  );
  return result.data.data.me.updateQuestion;
}

export async function updateAnswer(
  mentorId: string,
  answer: Answer,
  accessToken: string
): Promise<boolean> {
  const questionId = answer.question._id;
  const convertedAnswer = {
    transcript: answer.transcript,
    status: answer.status,
  };
  const headers = { Authorization: `bearer ${accessToken}` };
  const result = await axios.post(
    GRAPHQL_ENDPOINT,
    {
      query: `
      mutation {
        me {
          updateAnswer(mentorId: "${mentorId}", questionId: "${questionId}", answer: ${stringifyObject(
        convertedAnswer
      )})
        }
      }
    `,
    },
    { headers: headers }
  );
  return result.data.data.me.updateAnswer;
}

export async function trainMentor(mentorId: string): Promise<AsyncJob> {
  const result = await axios.post(urljoin(CLASSIFIER_ENTRYPOINT, "train"), {
    mentor: mentorId,
  });
  if (result.status !== 200) {
    throw new Error(`training failed: ${result.statusText}}`);
  }
  if (result.data.errors) {
    throw new Error(
      `errors response to training: ${JSON.stringify(result.data.errors)}`
    );
  }
  if (!result.data.data) {
    throw new Error(
      `no data in non-error reponse: ${JSON.stringify(result.data)}`
    );
  }
  return result.data.data;
}

export async function fetchTrainingStatus(
  statusUrl: string
): Promise<TrainStatus> {
  const result = await axios.get(statusUrl);
  if (result.status !== 200) {
    throw new Error(`fetch training status failed: ${result.statusText}}`);
  }
  if (result.data.errors) {
    throw new Error(
      `errors response to fetch training status: ${JSON.stringify(
        result.data.errors
      )}`
    );
  }
  if (!result.data.data) {
    throw new Error(
      `no data in non-error response: ${JSON.stringify(result.data)}`
    );
  }
  return result.data.data;
}

export async function uploadVideo(
  mentorId: string,
  questionId: string,
  video: File
): Promise<AsyncJob> {
  const data = new FormData();
  data.append(
    "body",
    JSON.stringify({ mentor: mentorId, question: questionId })
  );
  data.append("file", video);
  const request = axios.create({
    baseURL: VIDEO_ENTRYPOINT,
    timeout: 10000,
  });
  const result = await request.post("/upload", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    timeout: 30000,
  });
  return result.data.data;
}

export async function fetchUploadVideoStatus(
  statusUrl: string
): Promise<VideoStatus> {
  const result = await axios.get(statusUrl);
  return result.data.data;
}

export async function trimVideo(
  mentorId: string,
  questionId: string,
  startTime: number,
  endTime: number
): Promise<AsyncJob> {
  const result = await axios.post(urljoin(VIDEO_ENTRYPOINT, "trim"), {
    mentor: mentorId,
    question: questionId,
    startTime,
    endTime,
  });
  if (result.status !== 200) {
    throw new Error(`video trim failed: ${result.statusText}}`);
  }
  if (result.data.errors) {
    throw new Error(
      `errors response to video trimming: ${JSON.stringify(result.data.errors)}`
    );
  }
  if (!result.data.data) {
    throw new Error(
      `no data in non-error reponse: ${JSON.stringify(result.data)}`
    );
  }
  return result.data.data;
}

export async function fetchTrimVideoStatus(
  statusUrl: string
): Promise<VideoStatus> {
  const result = await axios.get(statusUrl);
  return result.data.data;
}

export async function login(accessToken: string): Promise<UserAccessToken> {
  const result = await axios.post(GRAPHQL_ENDPOINT, {
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
  return result.data.data.login;
}

export async function loginGoogle(
  accessToken: string
): Promise<UserAccessToken> {
  const result = await axios.post(GRAPHQL_ENDPOINT, {
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
  return result.data.data.loginGoogle;
}
