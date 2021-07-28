/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import axios, { CancelTokenSource, AxiosResponse } from "axios";
import {
  UserAccessToken,
  Mentor,
  Subject,
  Connection,
  AsyncJob,
  Answer,
  Question,
  UserQuestion,
  TaskStatus,
  TrainingInfo,
  VideoInfo,
  CancelJob,
  FollowUpQuestion,
  User,
  Config,
} from "types";
import { SearchParams } from "hooks/graphql/use-with-data-connection";
import { UploadStatus, UploadTask } from "hooks/graphql/use-with-upload-status";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const urljoin = require("url-join");

export const CLIENT_ENDPOINT = process.env.CLIENT_ENDPOINT || "/chat";
export const GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT || "/graphql";
export const CLASSIFIER_ENTRYPOINT =
  process.env.CLASSIFIER_ENTRYPOINT || "/classifier";
export const UPLOAD_ENTRYPOINT = process.env.UPLOAD_ENTRYPOINT || "/upload";

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

const graphqlRequest = axios.create({
  baseURL: GRAPHQL_ENDPOINT,
  timeout: 30000,
});

graphqlRequest.interceptors.response.use(
  function (response) {
    if (
      response.data.extensions &&
      response.data.extensions.newToken &&
      response.data.extensions.newToken.accessToken
    ) {
      localStorage.setItem(
        "accessToken",
        response.data.extensions.newToken.accessToken
      );
    }
    return response;
  },
  function (error) {
    return error;
  }
);

interface GQLQuery {
  query: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variables?: Record<string, any>;
}

interface GQLQueryOptions {
  accessToken?: string;
  headers?: Record<string, string>;
  dataPath?: string | string[];
}

interface GQLResponse<T> {
  errors?: { message: string }[];
  data?: T;
}
function getGqlReponseData<T>(res: AxiosResponse<GQLResponse<T>>): T {
  if (res.status !== 200) {
    throw new Error(
      `GQL HTTP request failed with status ${res.status}: ${res.statusText}`
    );
  }
  if (res.data.errors) {
    throw new Error(
      `errors in GQL response: ${JSON.stringify(res.data.errors)}`
    );
  }
  if (!res.data.data) {
    throw new Error(`no data in response: ${JSON.stringify(res.data)}`);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ("me" in res.data.data) return (res.data.data as any).me;
  return res.data.data;
}

const uploadRequest = axios.create({
  withCredentials: true,
  baseURL: UPLOAD_ENTRYPOINT,
});

async function execGql<T>(query: GQLQuery, opts?: GQLQueryOptions): Promise<T> {
  const optsEffective = opts || {};
  const res = await graphqlRequest.post("", query, {
    headers: {
      ...(optsEffective.headers || {}), // if any headers passed in opts, include them
      ...(optsEffective && optsEffective.accessToken // if accessToken passed in opts, add auth to headers
        ? { Authorization: `bearer ${optsEffective.accessToken}` }
        : {}),
    },
  });
  if (res.status !== 200) {
    throw new Error(
      `GQL HTTP request failed with status ${res.status}: ${res.statusText}`
    );
  }
  if (res.data.errors) {
    throw new Error(
      `errors in GQL response: ${JSON.stringify(res.data.errors)}`
    );
  }
  let data = res.data.data;
  if (!data) {
    throw new Error(`no data in response: ${JSON.stringify(res.data)}`);
  }
  const dataPath = Array.isArray(optsEffective.dataPath)
    ? optsEffective.dataPath
    : typeof optsEffective.dataPath === "string"
    ? [optsEffective.dataPath]
    : [];
  dataPath.forEach((pathPart) => {
    if (!data) {
      throw new Error(
        `unexpected response data shape for and dataPath ${JSON.stringify(
          dataPath
        )} and query ${query} : ${res.data}`
      );
    }
    data = data[pathPart];
  });
  return data;
}

export async function fetchConfig(): Promise<Config> {
  return execGql<Config>(
    {
      query: `
    query FetchConfig{
      config {
        googleClientId
      }
    }
  `,
    },
    { dataPath: "config" }
  );
}

export async function fetchSubjects(
  searchParams?: SearchParams
): Promise<Connection<Subject>> {
  const params = { ...defaultSearchParams, ...searchParams };
  return execGql<Connection<Subject>>(
    {
      query: `
      query Subjects($filter: Object!, $cursor: String!, $limit: Int!, $sortBy: String!, $sortAscending: Boolean!) {
        subjects(
          filter:$filter,
          cursor:$cursor,
          limit:$limit,
          sortBy:$sortBy,
          sortAscending:$sortAscending
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
      variables: {
        filter: stringifyObject(params.filter),
        limit: params.limit,
        cursor: params.cursor,
        sortBy: params.sortBy,
        sortAscending: params.sortAscending,
      },
    },
    { dataPath: "subjects" }
  );
}
export async function fetchUsers(
  searchParams?: SearchParams
): Promise<Connection<User>> {
  const params = { ...defaultSearchParams, ...searchParams };
  const { filter, limit, cursor, sortBy, sortAscending } = params;
  return execGql<Connection<User>>(
    {
      query: `
      query Users($filter: Object!, $limit: Int!, $cursor: String!, $sortBy: String!, $sortAscending: Boolean!){
        users (filter: $filter, limit: $limit,cursor: $cursor,sortBy: $sortBy,sortAscending: $sortAscending){
          edges {
            node {
              _id
              name
              email
              userRole
              defaultMentor{
                _id
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
      }`,
      variables: {
        filter: JSON.stringify(filter),
        limit,
        cursor,
        sortBy,
        sortAscending,
      },
    },
    { dataPath: "users" }
  );
}

export async function updateUserPermissions(
  userId: string,
  permissionLevel: string,
  accessToken: string
): Promise<User> {
  return execGql<User>(
    {
      query: `mutation UpdateUserPermissions($userId: String!, $permissionLevel: String!){
        me {
          updateUserPermissions(userId: $userId, permissionLevel: $permissionLevel) {
            userRole
          }
        }
      }`,
      variables: { userId, permissionLevel },
    },
    { dataPath: ["me", "updateUserPermissions"], accessToken }
  );
}

export async function fetchSubject(id: string): Promise<Subject> {
  return execGql<Subject>(
    {
      query: `
        query Subject($id: ID!) {
          subject(id: $id) {
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
                mentorType
                minVideoLength
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
      variables: { id },
    },
    { dataPath: "subject" }
  );
}

export async function updateSubject(
  subject: Partial<Subject>,
  accessToken: string
): Promise<Subject> {
  return execGql<Subject>(
    {
      query: `
      mutation UpdateSubject($subject: SubjectUpdateInputType!) {
        me {
          updateSubject(subject: $subject) {
            _id
          }
        }
      }
    `,
      variables: {
        subject: {
          _id: isValidObjectID(subject?._id || "") ? subject._id : undefined,
          name: subject?.name,
          description: subject?.description,
          categories: subject?.categories,
          topics: subject?.topics,
          questions: subject?.questions,
        },
      },
    },
    { dataPath: ["me", "updateSubject"], accessToken }
  );
}

export async function fetchUserQuestions(
  searchParams?: SearchParams
): Promise<Connection<UserQuestion>> {
  const params = { ...defaultSearchParams, ...searchParams };
  const result = await graphqlRequest.post("", {
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
  return getGqlReponseData<{ userQuestions: Connection<UserQuestion> }>(result)
    .userQuestions;
}

export async function fetchUserQuestion(id: string): Promise<UserQuestion> {
  const result = await graphqlRequest.post("", {
    query: `
      query UserQuestion($id: ID!) {
        userQuestion(id: $id) {
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
    variables: { id },
  });
  return getGqlReponseData<{ userQuestion: UserQuestion }>(result).userQuestion;
}

export async function updateUserQuestion(
  feedbackId: string,
  answerId: string
): Promise<UserQuestion> {
  const result = await graphqlRequest.post("", {
    query: `
      mutation UserQuestionSetAnswer($id: ID!, $answer: String!) {
        userQuestionSetAnswer(id: $id, answer: $answer) {
          _id
        }
      }
    `,
    variables: { id: feedbackId, answer: answerId },
  });
  return getGqlReponseData<{ userQuestionSetAnswer: UserQuestion }>(result)
    .userQuestionSetAnswer;
}

export async function fetchMentorId(accessToken: string): Promise<Mentor> {
  const headers = { Authorization: `bearer ${accessToken}` };
  const result = await graphqlRequest.post(
    "",
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
  return getGqlReponseData<{ mentor: Mentor }>(result).mentor;
}

export async function fetchMentor(
  accessToken: string,
  subject?: string,
  topic?: string,
  status?: string
): Promise<Mentor> {
  const headers = { Authorization: `bearer ${accessToken}` };
  const result = await graphqlRequest.post(
    "",
    {
      query: `
      query Mentor($subject: ID!, $topic: ID!, $status: String!) {
        me {
          mentor {
            _id
            name
            firstName
            title
            email
            allowContact
            mentorType
            thumbnail
            lastTrainedAt
            isDirty
            defaultSubject {
              _id
            }
            subjects {
              _id
              name
              description
              isRequired
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
                  mentorType
                  minVideoLength
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
            topics(subject: $subject) {
              id
              name
              description
            }
            answers(subject: $subject, topic: $topic, status: $status) {
              _id
              question {
                _id
                question
                paraphrases
                type
                name
                mentor
                mentorType
                minVideoLength
              }
              transcript
              status
              media {
                type
                tag
                url
              }
            }
          }  
        }
      }
    `,
      variables: {
        subject: subject || "",
        topic: topic || "",
        status: status || "",
      },
    },
    { headers: headers }
  );
  return getGqlReponseData<{ mentor: Mentor }>(result).mentor;
}

export async function updateMentorDetails(
  mentor: Mentor,
  accessToken: string
): Promise<boolean> {
  const headers = { Authorization: `bearer ${accessToken}` };
  const result = await graphqlRequest.post(
    "",
    {
      query: `
      mutation UpdateMentorDetails($mentor: UpdateMentorDetailsType!) {
        me {
          updateMentorDetails(mentor: $mentor)
        }
      }
    `,
      variables: {
        mentor: {
          name: mentor.name,
          firstName: mentor.firstName,
          title: mentor.title,
          email: mentor.email,
          allowContact: mentor.allowContact,
          mentorType: mentor.mentorType,
        },
      },
    },
    { headers: headers }
  );
  return getGqlReponseData<{ updateMentorDetails: boolean }>(result)
    .updateMentorDetails;
}

export async function updateMentorSubjects(
  mentor: Mentor,
  accessToken: string
): Promise<boolean> {
  const headers = { Authorization: `bearer ${accessToken}` };
  const result = await graphqlRequest.post(
    "",
    {
      query: `
      mutation UpdateMentorSubjects($mentor: UpdateMentorSubjectsType!) {
        me {
          updateMentorSubjects(mentor: $mentor)
        }
      }
    `,
      variables: {
        mentor: {
          defaultSubject: mentor.defaultSubject?._id || null,
          subjects: mentor.subjects.map((s) => s._id),
        },
      },
    },
    { headers: headers }
  );
  return getGqlReponseData<{ updateMentorSubjects: boolean }>(result)
    .updateMentorSubjects;
}

export async function updateQuestion(
  updateQuestion: Question,
  accessToken: string
): Promise<boolean> {
  const headers = { Authorization: `bearer ${accessToken}` };
  const result = await graphqlRequest.post(
    "",
    {
      query: `
        mutation UpdateQuestion($question: QuestionUpdateInputType!) {
          me {
            updateQuestion(question: $question) {
              _id
            }
          }
        }
      `,
      variables: { question: updateQuestion },
    },
    { headers: headers }
  );
  return getGqlReponseData<{ updateQuestion: boolean }>(result).updateQuestion;
}

export async function updateAnswer(
  answer: Answer,
  accessToken: string
): Promise<boolean> {
  const headers = { Authorization: `bearer ${accessToken}` };
  const result = await graphqlRequest.post(
    "",
    {
      query: `
      mutation UpdateAnswer($questionId: ID!, $answer: UpdateAnswerInputType!) {
        me {
          updateAnswer(questionId: $questionId, answer: $answer)
        }
      }
    `,
      variables: {
        questionId: answer.question._id,
        answer: {
          transcript: answer.transcript,
          status: answer.status,
        },
      },
    },
    { headers: headers }
  );
  return getGqlReponseData<{ updateAnswer: boolean }>(result).updateAnswer;
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

export async function fetchFollowUpQuestions(
  categoryId: string,
  accessToken: string
): Promise<FollowUpQuestion[]> {
  const headers = { Authorization: `bearer ${accessToken}` };
  const result = await axios.post(
    urljoin(CLASSIFIER_ENTRYPOINT, "me", "followups", "category", categoryId),
    null,
    { headers: headers }
  );
  return getGqlReponseData<{ followups: FollowUpQuestion[] }>(result).followups;
}

export async function fetchTrainingStatus(
  statusUrl: string
): Promise<TaskStatus<TrainingInfo>> {
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
export async function uploadThumbnail(
  mentorId: string,
  thumbnail: File
): Promise<AsyncJob> {
  const data = new FormData();
  data.append("body", JSON.stringify({ mentor: mentorId }));
  data.append("thumbnail", thumbnail);
  const result = await uploadRequest.post("/thumbnail", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return result.data.data;
}
export async function fetchThumbnail(accessToken: string): Promise<string> {
  const headers = { Authorization: `bearer ${accessToken}` };
  const result = await graphqlRequest.post(
    "",
    {
      query: `
      query {
        me {
          mentor {
            thumbnail
          }
        }
      }
    `,
    },
    { headers: headers }
  );
  return getGqlReponseData<{ thumbnail: string }>(result).thumbnail;
}
export async function uploadVideo(
  mentorId: string,
  video: File,
  question: Question,
  tokenSource: CancelTokenSource,
  addOrEditTask: (u: UploadTask) => void,
  trim?: { start: number; end: number }
): Promise<AsyncJob> {
  const data = new FormData();
  data.append(
    "body",
    JSON.stringify({ mentor: mentorId, question: question._id, trim })
  );
  data.append("video", video);
  const result = await uploadRequest.post("/answer", data, {
    onUploadProgress: (progressEvent: { loaded: string }) =>
      addOrEditTask({
        question,
        uploadStatus: UploadStatus.PENDING,
        uploadProgress: (parseInt(progressEvent.loaded) / video.size) * 100,
        tokenSource: tokenSource,
        taskId: "",
      }),
    headers: {
      "Content-Type": "multipart/form-data",
    },
    cancelToken: tokenSource.token,
  });
  return result.data.data;
}

export async function cancelUploadVideo(
  mentorId: string,
  question: Question,
  taskId: string
): Promise<CancelJob> {
  const result = await uploadRequest.post("/answer/cancel", {
    mentor: mentorId,
    question: question._id,
    task: taskId,
  });
  return result.data.data;
}

export async function fetchUploadVideoStatus(
  statusUrl: string
): Promise<TaskStatus<VideoInfo>> {
  const result = await axios.get(statusUrl);
  return result.data.data;
}

export async function login(accessToken: string): Promise<UserAccessToken> {
  const result = await graphqlRequest.post("", {
    query: `
      mutation Login($accessToken: String!) {
        login(accessToken: $accessToken) {
          user {
            _id
            name
            userRole
          }
          accessToken
        }
      }
    `,
    variables: { accessToken },
  });
  return getGqlReponseData<{ login: UserAccessToken }>(result).login;
}

export async function loginGoogle(
  accessToken: string
): Promise<UserAccessToken> {
  const result = await graphqlRequest.post("", {
    query: `
      mutation LoginGoogle($accessToken: String!) {
        loginGoogle(accessToken: $accessToken) {
          user {
            _id
            name
            userRole
          }
          accessToken
        }
      }
    `,
    variables: { accessToken },
  });
  return getGqlReponseData<{ loginGoogle: UserAccessToken }>(result)
    .loginGoogle;
}

export async function fetchUploadTasks(
  accessToken: string
): Promise<UploadTask[]> {
  const headers = { Authorization: `bearer ${accessToken}` };
  const result = await graphqlRequest.post(
    "",
    {
      query: `
        query FetchUploadTasks {
          me {
            uploadTasks {
              question {
                _id
                question
              }
              taskId
              uploadStatus
              transcript
              media {
                type
                tag
                url
              }
            }
          }
        }`,
    },
    { headers: headers }
  );
  return getGqlReponseData<{ uploadTasks: UploadTask[] }>(result).uploadTasks;
}

export async function deleteUploadTask(
  question: string,
  accessToken: string
): Promise<boolean> {
  const headers = { Authorization: `bearer ${accessToken}` };
  const result = await graphqlRequest.post(
    "",
    {
      query: `
        mutation UploadTaskDelete($questionId: ID!) {
          me {
            uploadTaskDelete(questionId: $questionId)
          }
        }
      `,
      variables: { questionId: question },
    },
    { headers: headers }
  );
  return getGqlReponseData<{ uploadTaskDelete: boolean }>(result)
    .uploadTaskDelete;
}
