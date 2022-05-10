/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
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
  Connection,
  AsyncJob,
  Answer,
  Question,
  UserQuestion,
  TaskStatus,
  TrainingInfo,
  VideoInfo,
  FollowUpQuestion,
  User,
  Config,
  MentorExportJson,
  MentorImportPreview,
  UploadTask,
  UploadProcessAsyncJob,
  ImportTask,
  ReplacedMentorDataChanges,
} from "types";
import { SearchParams } from "hooks/graphql/use-with-data-connection";
import {
  AddOrUpdateQuestionGQL,
  convertConnectionGQL,
  convertMentorGQL,
  convertUploadTaskGQL,
  convertUserQuestionGQL,
  MentorGQL,
  SubjectGQL,
  SubjectQuestionGQL,
  UploadTaskGQL,
  UserQuestionGQL,
} from "types-gql";
import { FileOnServer } from "hooks/graphql/use-with-server-file-page";
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
  if (!(res.status >= 200 && res.status <= 299)) {
    throw new Error(`http request failed: ${res.statusText}`);
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
  mentorId: string,
  accessToken: string,
  classifierLambdaEndpoint?: string
): Promise<FollowUpQuestion[]> {
  return execHttp<FollowUpQuestion[]>(
    "POST",
    urljoin(
      classifierLambdaEndpoint || CLASSIFIER_ENTRYPOINT,
      "followups",
      "category",
      categoryId,
      mentorId
    ),
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
          videoRecorderMaxLength
          classifierLambdaEndpoint
          uploadLambdaEndpoint
        }
      }
  `,
    },
    { dataPath: "config" }
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
              defaultMentor {
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

export async function fetchSubject(id: string): Promise<SubjectGQL> {
  return await execGql<SubjectGQL>(
    {
      query: `
        query Subject($id: ID!) {
          subject(id: $id) {
            _id
            name
            type
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
        }
      `,
      variables: { id },
    },
    { dataPath: "subject" }
  );
  // return convertSubjectGQL(gql);
}

export async function fetchSubjects(
  searchParams?: SearchParams
): Promise<Connection<SubjectGQL>> {
  const params = { ...defaultSearchParams, ...searchParams };
  return await execGql<Connection<SubjectGQL>>(
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
              type
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

export async function updateSubject(
  subject: Partial<SubjectGQL>,
  accessToken: string
): Promise<SubjectGQL> {
  return await execGql<SubjectGQL>(
    {
      query: `
      mutation UpdateSubject($subject: SubjectUpdateInputType!) {
        me {
          updateSubject(subject: $subject) {
            _id
            name
            type
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
        }
      }
    `,
      variables: {
        subject: {
          _id: isValidObjectID(subject?._id || "") ? subject._id : undefined,
          name: subject?.name,
          type: subject?.type,
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

export async function addOrUpdateSubjectQuestions(
  subject: string,
  questions: SubjectQuestionGQL[],
  accessToken: string
): Promise<AddOrUpdateQuestionGQL[]> {
  return await execGql<AddOrUpdateQuestionGQL[]>(
    {
      query: `
      mutation SubjectAddOrUpdateQuestions($subject: ID!, $questions: [SubjectQuestionInputType]!) {
        me {
          subjectAddOrUpdateQuestions(subject: $subject, questions: $questions) {
            question
            category
            topics
          }
        }
      }
    `,
      variables: {
        subject,
        questions,
      },
    },
    { dataPath: ["me", "subjectAddOrUpdateQuestions"], accessToken }
  );
}

export async function fetchQuestions(
  searchParams?: SearchParams
): Promise<Connection<Question>> {
  const params = { ...defaultSearchParams, ...searchParams };
  return execGql<Connection<Question>>(
    {
      query: `
        query Questions($filter: Object!, $cursor: String!, $limit: Int!, $sortBy: String!, $sortAscending: Boolean!) {
          questions(
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
                question
                type
                name
                paraphrases
                mentor
                mentorType
                minVideoLength
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
    { dataPath: "questions" }
  );
}

export async function fetchQuestionsById(ids: string[]): Promise<Question[]> {
  return execGql<Question[]>(
    {
      query: `
        query QuestionsById($ids: [ID]!) {
          questionsById(ids: $ids) {
            _id
            question
            type
            name
            clientId
            paraphrases
            mentor
            mentorType
            minVideoLength
          }
        }
    `,
      variables: { ids },
    },
    { dataPath: "questionsById" }
  );
}

export async function fetchBasicMentorInfo(): Promise<Connection<Mentor>> {
  const gql = await execGql<Connection<MentorGQL>>(
    {
      query: `
      query Mentors($limit: Int!){
        mentors(limit: $limit) {
          edges {
            node {
              _id
              name
            }
          }
        }
      }
    `,
      variables: {
        limit: 1000,
      },
    },
    { dataPath: "mentors" }
  );
  return convertConnectionGQL(gql, convertMentorGQL);
}

export async function updateQuestion(
  updateQuestion: Question,
  accessToken: string
): Promise<Question> {
  const gql = await execGql<Question>(
    {
      query: `
        mutation UpdateQuestion($question: QuestionUpdateInputType!) {
          me {
            updateQuestion(question: $question) {
              _id
              question
              type
              name
              paraphrases
              mentor
              mentorType
              minVideoLength
            }
          }
        }
      `,
      variables: { question: updateQuestion },
    },
    { accessToken, dataPath: ["me", "updateQuestion"] }
  );
  return gql;
}

export async function fetchUserQuestions(
  searchParams?: SearchParams
): Promise<Connection<UserQuestion>> {
  const params = { ...defaultSearchParams, ...searchParams };
  const gql = await execGql<Connection<UserQuestionGQL>>(
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
  return convertConnectionGQL(gql, convertUserQuestionGQL);
}

export async function fetchUserQuestion(id: string): Promise<UserQuestion> {
  const gql = await execGql<UserQuestionGQL>(
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
  return convertUserQuestionGQL(gql);
}

export async function updateUserQuestion(
  feedbackId: string,
  answerId: string
): Promise<void> {
  execGql<UserQuestion>(
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

export async function fetchMentorById(
  accessToken: string,
  mentorId: string
): Promise<Mentor> {
  const gql = await execGql<MentorGQL>(
    {
      query: `
      query MentorFindOne($mentor: ID!) {
        mentor (id: $mentor){
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
            type
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
            questions(mentor:$mentor) {
              question {
                _id
                clientId
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
          answers {
            _id
            question {
              _id
              clientId
              mentor
            }
            hasEditedTranscript
            transcript
            status
            hasUntransferredMedia
            webMedia {
              type
              tag
              url
              needsTransfer
            }
            mobileMedia{
              type
              tag
              url
              needsTransfer
            }
            vttMedia{
              type
              tag
              url
              needsTransfer
            }
          }
        }  
      }
    `,
      variables: {
        mentor: mentorId,
      },
    },
    { dataPath: ["mentor"], accessToken }
  );
  return convertMentorGQL(gql);
}

export async function updateMentorDetails(
  mentor: Mentor,
  accessToken: string,
  mentorId: string
): Promise<boolean> {
  return execGql<boolean>(
    {
      query: `
      mutation UpdateMentorDetails($mentor: UpdateMentorDetailsType!, $mentorId: ID) {
        me {
          updateMentorDetails(mentor: $mentor, mentorId: $mentorId)
        }
      }
    `,
      variables: {
        mentorId,
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
  accessToken: string,
  mentorId: string
): Promise<boolean> {
  return execGql<boolean>(
    {
      query: `
      mutation UpdateMentorSubjects($mentor: UpdateMentorSubjectsType!, $mentorId: ID) {
        me {
          updateMentorSubjects(mentor: $mentor, mentorId: $mentorId)
        }
      }
    `,
      variables: {
        mentorId,
        mentor: {
          defaultSubject: mentor.defaultSubject?._id || null,
          subjects: mentor.subjects.map((s) => s._id),
        },
      },
    },
    { accessToken, dataPath: ["me", "updateMentorSubjects"] }
  );
}

export async function regenerateVTTForQuestion(
  questionId: string,
  mentorId: string,
  accessToken: string
): Promise<boolean> {
  const data = new FormData();
  data.append(
    "body",
    JSON.stringify({ mentor: mentorId, question: questionId })
  );
  const result = await uploadRequest.post("/answer/regen_vtt/", data, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return getDataFromAxiosResponse(result, ["regen_vtt"]);
}

export async function updateAnswer(
  answer: Answer,
  accessToken: string,
  mentorId: string
): Promise<boolean> {
  return execGql<boolean>(
    {
      query: `
      mutation UpdateAnswer($questionId: ID!, $answer: UpdateAnswerInputType!, $mentorId: ID) {
        me {
          updateAnswer(questionId: $questionId, answer: $answer, mentorId: $mentorId)
        }
      }
    `,
      variables: {
        mentorId,
        questionId: answer.question,
        answer: {
          transcript: answer.transcript,
          status: answer.status,
        },
      },
    },
    { accessToken, dataPath: ["me", "updateAnswer"] }
  );
}

export async function deleteImportTask(
  accessToken: string,
  mentorId: string
): Promise<boolean> {
  return execGql<boolean>(
    {
      query: `
        mutation ImportTaskDelete($mentorId: ID!){
          me{
            importTaskDelete(mentorId:$mentorId)
          }
        }
      `,
      variables: { mentorId },
    },
    { accessToken, dataPath: ["me", "importTaskDelete"] }
  );
}

export async function trainMentor(
  mentorId: string,
  accessToken: string,
  classifierLambdaEndpoint?: string
): Promise<AsyncJob> {
  return execHttp(
    "POST",
    urljoin(classifierLambdaEndpoint || CLASSIFIER_ENTRYPOINT, "train"),
    {
      axiosConfig: {
        data: { mentor: mentorId },
      },
      accessToken,
    }
  );
}

export async function fetchTrainingStatus(
  statusUrl: string,
  accessToken?: string,
  classifierLambdaEndpoint?: string
): Promise<TaskStatus<TrainingInfo>> {
  return execHttp(
    "GET",
    `${classifierLambdaEndpoint || ""}${statusUrl}?v=${Math.random()}`,
    { accessToken }
  );
}

export async function uploadThumbnail(
  mentorId: string,
  thumbnail: File
): Promise<string> {
  const data = new FormData();
  data.append("body", JSON.stringify({ mentor: mentorId }));
  data.append("thumbnail", thumbnail);
  const result = await uploadRequest.post("/thumbnail", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return getDataFromAxiosResponse(result, ["thumbnail"]);
}

export async function transferMedia(
  mentorId: string,
  questionId: string
): Promise<AsyncJob> {
  const result = await uploadRequest.post("/transfer", {
    mentor: mentorId,
    question: questionId,
  });
  return getDataFromAxiosResponse(result, []);
}

export async function trimExistingUpload(
  mentorId: string,
  question: string,
  accessToken: string,
  trim?: { start: number; end: number }
): Promise<UploadProcessAsyncJob> {
  const data = new FormData();
  data.append(
    "body",
    JSON.stringify({ mentor: mentorId, question: question, trim })
  );
  const result = await uploadRequest.post(
    "/answer/trim_existing_upload",
    data,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  return getDataFromAxiosResponse(result, []);
}

export async function uploadVideo(
  mentorId: string,
  video: File,
  question: string,
  tokenSource: CancelTokenSource,
  accessToken: string,
  trim?: { start: number; end: number },
  hasEditedTranscript?: boolean
): Promise<UploadProcessAsyncJob> {
  const data = new FormData();
  data.append(
    "body",
    JSON.stringify({
      mentor: mentorId,
      question: question,
      trim,
      hasEditedTranscript,
    })
  );
  data.append("video", video);
  const result = await uploadRequest.post("/answer", data, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${accessToken}`,
    },
    cancelToken: tokenSource.token,
  });
  return getDataFromAxiosResponse(result, []);
}

export async function removeMountedFileFromServer(
  fileName: string,
  accessToken: string
): Promise<UploadProcessAsyncJob> {
  const result = await uploadRequest.post(
    `/answer/remove_mounted_file/${fileName}`,
    {},
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  return getDataFromAxiosResponse(result, ["fileRemoved"]);
}

export async function fetchMountedFilesStatus(
  accessToken: string
): Promise<FileOnServer[]> {
  const result = await uploadRequest.get(`/answer/mounted_files/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return getDataFromAxiosResponse(result, ["mountedFiles"]);
}

export async function downloadMountedFileAsBlob(
  fileName: string,
  accessToken: string
): Promise<Blob> {
  const result = await uploadRequest.get(
    `/answer/download_mounted_file/${fileName}/`,
    {
      responseType: "blob",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  throwErrorsInAxiosResponse(result);
  return result.data;
}

export async function fetchVideoBlobFromUrl(url: string): Promise<Blob> {
  const result = await axios.get(url, { responseType: "blob" });
  throwErrorsInAxiosResponse(result);
  return result.data;
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
            defaultMentor{
              _id
            }
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
  accessToken: string,
  mentorId: string
): Promise<UploadTask[]> {
  const gql = await execGql<UploadTaskGQL[]>(
    {
      query: `
        query FetchUploadTasks($mentorId: ID) {
          me {
            uploadTasks(mentorId: $mentorId) {
              question {
                _id
                question
              }
              trimUploadTask{
                task_name
                status
              }
              transcodeWebTask{
                task_name
                status
              }
              transcodeMobileTask{
                task_name
                status
              }
              transcribeTask{
                task_name
                status
              }
              transcript
              originalMedia {
                type
                tag
                url
              }
              webMedia {
                type
                tag
                url
              }
              mobileMedia{
                type
                tag
                url
              }
              vttMedia{
                type
                tag
                url
              }
            }
          }
        }`,
      variables: { mentorId },
    },
    { accessToken, dataPath: ["me", "uploadTasks"] }
  );
  return gql.map((u) => convertUploadTaskGQL(u));
}

export async function deleteUploadTask(
  question: string,
  accessToken: string,
  mentorId: string
): Promise<boolean> {
  return execGql<boolean>(
    {
      query: `
        mutation UploadTaskDelete($questionId: ID!, $mentorId: ID) {
          me {
            uploadTaskDelete(questionId: $questionId, mentorId: $mentorId)
          }
        }
      `,
      variables: { questionId: question, mentorId },
    },
    { accessToken, dataPath: ["me", "uploadTaskDelete"] }
  );
}

export async function exportMentor(mentor: string): Promise<MentorExportJson> {
  return execGql<MentorExportJson>(
    {
      query: `
        query MentorExport($mentor: ID!) {
          mentorExport(mentor: $mentor) {
            id
            mentorInfo{
              name
              firstName
              title
              email
              thumbnail
              allowContact
              defaultSubject
              mentorType
            }
            subjects {
              _id
              name
              type
              description
              isRequired
              topics {
                id
                name
                description
              }
              categories {
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
            questions {
              _id
              question
              type
              name
              paraphrases
              mentor
              mentorType
              minVideoLength
            }
            answers {
              hasEditedTranscript
              transcript
              status
              hasUntransferredMedia
              webMedia {
                type
                tag
                url
                needsTransfer
              }
              mobileMedia{
                type
                tag
                url
                needsTransfer
              }
              vttMedia{
                type
                tag
                url
                needsTransfer
              }
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
            }
            userQuestions{
              _id
              question
              confidence
              classifierAnswerType
              feedback
              mentor{
                _id
                name
              }
              classifierAnswer{
                _id
                question{
                  _id
                  question
                }
                transcript
              }
              graderAnswer{
                _id
                question{
                  _id
                  question
                }
                transcript
              }
            }
          }
        }
      `,
      variables: { mentor },
    },
    { dataPath: ["mentorExport"] }
  );
}

export async function importMentorPreview(
  mentor: string,
  json: MentorExportJson
): Promise<MentorImportPreview> {
  return execGql<MentorImportPreview>(
    {
      query: `
        query MentorImportPreview($mentor: ID!, $json: MentorImportJsonType!) {
          mentorImportPreview(mentor: $mentor, json: $json) {
            id
            subjects {
              editType
              importData {
                _id
                name
                type
                description
                isRequired
                topics {
                  id
                  name
                  description
                }
                categories {
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
              curData {
                _id
                name
                type
                description
                isRequired
                topics {
                  id
                  name
                  description
                }
                categories {
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
            questions {
              editType
              importData {
                _id
                question
                type
                name
                paraphrases
                mentor
                mentorType
                minVideoLength  
              }
              curData {
                _id
                question
                type
                name
                paraphrases
                mentor
                mentorType
                minVideoLength  
              }
            }
            answers {
              editType
              importData {
                hasEditedTranscript
                transcript
                status
                hasUntransferredMedia
                webMedia {
                  type
                  tag
                  url
                  needsTransfer
                }
                mobileMedia{
                  type
                  tag
                  url
                  needsTransfer
                }
                vttMedia{
                  type
                  tag
                  url
                  needsTransfer
                }
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
              }
              curData {
                transcript
                status
                hasEditedTranscript
                hasUntransferredMedia
                webMedia {
                  type
                  tag
                  url
                  needsTransfer
                }
                mobileMedia{
                  type
                  tag
                  url
                  needsTransfer
                }
                vttMedia{
                  type
                  tag
                  url
                  needsTransfer
                }
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
              }
            }
          }
        }
      `,
      variables: { mentor, json },
    },
    { dataPath: ["mentorImportPreview"] }
  );
}

export async function fetchImportTask(
  mentorId: string,
  accessToken: string
): Promise<ImportTask> {
  return execGql<ImportTask>(
    {
      query: `
        query ImportTask($mentorId: ID!){
          importTask(mentorId:$mentorId){
            graphQLUpdate{
              status
              errorMessage
            }
            s3VideoMigrate{
              status
              answerMediaMigrations{
                status
                question
                errorMessage
              }
            }
          }
        }
      `,
      variables: { mentorId },
    },
    { accessToken, dataPath: ["importTask"] }
  );
}

export async function importMentor(
  mentor: string,
  json: MentorExportJson,
  replacedMentorDataChanges: ReplacedMentorDataChanges,
  accessToken: string,
  uploadLambdaEndpoint?: string
): Promise<void> {
  return execHttp(
    "POST",
    urljoin(uploadLambdaEndpoint || UPLOAD_ENTRYPOINT, "/transfer/mentor"),
    {
      axiosConfig: {
        data: JSON.stringify({
          mentor: mentor,
          mentorExportJson: json,
          replacedMentorDataChanges: replacedMentorDataChanges,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      },
      accessToken,
    }
  );
}
