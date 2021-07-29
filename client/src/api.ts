/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import axios, {
  CancelTokenSource,
  AxiosResponse,
  Method,
  AxiosInstance,
  AxiosRequestConfig,
} from "axios";
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

const REQUEST_TIMEOUT_GRAPHQL_DEFAULT = 30000;

/**
 * Middleware function takes some action on an axios instance
 */
interface AxiosMiddleware {
  (axiosInstance: AxiosInstance): void;
}

/**
 * Captures accessToken from response and writes it to local storage.
 * HIGHLY SUSPICIOUS OF THIS!!!!
 * Should we not be keeping the accessToken ONLY in memory?
 * Shouldn't the only stored version of accessToken/refreshToken be in HTTPS-only cookies?
 */
const extractAndStoreAccessToken: AxiosMiddleware = (
  axiosInstance: AxiosInstance
) => {
  axiosInstance.interceptors.response.use(
    function (response) {
      if (response?.data?.extensions?.newToken?.accessToken) {
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
};

interface GQLQuery {
  query: string; // the query string passed to graphql, which should be a static query
  variables?: Record<string, unknown>; // variables (if any) for the static query
}

interface HttpRequestConfig {
  accessToken?: string; // bearer-token http auth
  axiosConfig?: AxiosRequestConfig; // any axios config for the request
  axiosMiddleware?: AxiosMiddleware; // used (for example) to extract accessToken from response headers
  /**
   * When set, will use this prop (or array of props) to extract return data from a json response, e.g.
   *
   * dataPath: ["foo", "bar"]
   *
   * // will extract "barvalue" for the return
   * { "foo": { "bar": "barvalue" } }
   */
  dataPath?: string | string[];
}

const uploadRequest = axios.create({
  withCredentials: true,
  baseURL: UPLOAD_ENTRYPOINT,
});

async function execGql<T>(
  query: GQLQuery,
  opts?: HttpRequestConfig
): Promise<T> {
  return execHttp<T>("POST", GRAPHQL_ENDPOINT, {
    axiosMiddleware: extractAndStoreAccessToken,
    ...(opts || {}),
    axiosConfig: {
      timeout: REQUEST_TIMEOUT_GRAPHQL_DEFAULT, // default timeout can be overriden by passed-in config
      ...(opts?.axiosConfig || {}),
      data: query,
    },
  });
}

async function execHttp<T>(
  method: Method,
  query: string,
  opts?: HttpRequestConfig
): Promise<T> {
  const optsEffective: HttpRequestConfig = opts || {};
  const axiosConfig = opts?.axiosConfig || {};
  const axiosInst = axios.create();
  if (optsEffective.axiosMiddleware) {
    optsEffective.axiosMiddleware(axiosInst);
  }
  const result = await axiosInst.request({
    url: query,
    method: method,
    ...axiosConfig,
    headers: {
      ...(axiosConfig.headers || {}), // if any headers passed in opts, include them
      ...(optsEffective && optsEffective.accessToken // if accessToken passed in opts, add auth to headers
        ? { Authorization: `bearer ${optsEffective.accessToken}` }
        : {}),
    },
  });
  return getDataFromAxiosResponse(result, optsEffective.dataPath || []);
}

function throwErrorsInAxiosResponse(res: AxiosResponse) {
  if (res.status !== 200) {
    throw new Error(`http request failed: ${res.statusText}}`);
  }
  if (res.data.errors) {
    throw new Error(`errors in response: ${JSON.stringify(res.data.errors)}`);
  }
}

function getDataFromAxiosResponse(res: AxiosResponse, path: string | string[]) {
  throwErrorsInAxiosResponse(res);
  let data = res.data.data;
  if (!data) {
    throw new Error(`no data in reponse: ${JSON.stringify(res.data)}`);
  }
  const dataPath = Array.isArray(path)
    ? path
    : typeof path === "string"
    ? [path]
    : [];
  dataPath.forEach((pathPart) => {
    if (!data) {
      throw new Error(
        `unexpected response data shape for dataPath ${JSON.stringify(
          dataPath
        )} and request ${res.request} : ${res.data}`
      );
    }
    data = data[pathPart];
  });
  return data;
}

export async function fetchFollowUpQuestions(
  categoryId: string,
  accessToken: string
): Promise<FollowUpQuestion[]> {
  return execHttp<FollowUpQuestion[]>(
    "POST",
    urljoin(CLASSIFIER_ENTRYPOINT, "me", "followups", "category", categoryId),
    { accessToken, dataPath: "followups" }
  );
}

export async function fetchConfig(): Promise<Config> {
  return execGql<Config>(
    {
      query: `
      query FetchConfig{
        config {
          googleClientId
          urlVideoIdleTips
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
  return execGql<Connection<UserQuestion>>(
    {
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
    },
    { dataPath: "userQuestions" }
  );
}

export async function fetchUserQuestion(id: string): Promise<UserQuestion> {
  return execGql<UserQuestion>(
    {
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
    },
    { dataPath: "userQuestion" }
  );
}

export async function updateUserQuestion(
  feedbackId: string,
  answerId: string
): Promise<UserQuestion> {
  return execGql<UserQuestion>(
    {
      query: `
      mutation UserQuestionSetAnswer($id: ID!, $answer: String!) {
        userQuestionSetAnswer(id: $id, answer: $answer) {
          _id
        }
      }
    `,
      variables: { id: feedbackId, answer: answerId },
    },
    { dataPath: "userQuestionSetAnswer" }
  );
}

export async function fetchMentor(
  accessToken: string,
  subject?: string,
  topic?: string,
  status?: string
): Promise<Mentor> {
  return execGql<Mentor>(
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
    { dataPath: ["me", "mentor"], accessToken }
  );
}

export async function updateMentorDetails(
  mentor: Mentor,
  accessToken: string
): Promise<boolean> {
  return execGql<boolean>(
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
    { dataPath: ["me", "updateMentorDetails"], accessToken }
  );
}

export async function updateMentorSubjects(
  mentor: Mentor,
  accessToken: string
): Promise<boolean> {
  return execGql<boolean>(
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
    { accessToken, dataPath: ["me", "updateMentorSubjects"] }
  );
}

export async function updateQuestion(
  updateQuestion: Question,
  accessToken: string
): Promise<boolean> {
  return execGql<boolean>(
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
    { accessToken, dataPath: ["me", "updateQuestion"] }
  );
}

export async function updateAnswer(
  answer: Answer,
  accessToken: string
): Promise<boolean> {
  return execGql<boolean>(
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
    { accessToken, dataPath: ["me", "updateAnswer"] }
  );
}

export async function trainMentor(mentorId: string): Promise<AsyncJob> {
  return execHttp("POST", urljoin(CLASSIFIER_ENTRYPOINT, "train"), {
    axiosConfig: {
      data: { mentor: mentorId },
    },
  });
}

export async function fetchTrainingStatus(
  statusUrl: string
): Promise<TaskStatus<TrainingInfo>> {
  return execHttp("GET", statusUrl);
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
  return getDataFromAxiosResponse(result, []);
}
export async function fetchThumbnail(accessToken: string): Promise<string> {
  return execGql<string>(
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
    { accessToken, dataPath: ["me", "thumbnail"] }
  );
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
  return getDataFromAxiosResponse(result, []);
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
  return getDataFromAxiosResponse(result, []);
}

export async function fetchUploadVideoStatus(
  statusUrl: string
): Promise<TaskStatus<VideoInfo>> {
  return execHttp("GET", statusUrl);
}

export async function login(accessToken: string): Promise<UserAccessToken> {
  return execGql<UserAccessToken>(
    {
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
    },
    { dataPath: "login" }
  );
}

export async function loginGoogle(
  accessToken: string
): Promise<UserAccessToken> {
  return execGql<UserAccessToken>(
    {
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
    },
    { dataPath: "loginGoogle" }
  );
}

export async function fetchUploadTasks(
  accessToken: string
): Promise<UploadTask[]> {
  return execGql<UploadTask[]>(
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
    { accessToken, dataPath: ["me", "uploadTasks"] }
  );
}

export async function deleteUploadTask(
  question: string,
  accessToken: string
): Promise<boolean> {
  return execGql<boolean>(
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
    { accessToken, dataPath: ["me", "uploadTaskDelete"] }
  );
}
