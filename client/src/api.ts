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
  PresignedUrlResponse,
  FirstTimeTracking,
  MentorPanel,
  TrendingUserQuestion,
  SbertEncodedSentence,
  Keyword,
  Organization,
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
// eslint-disable-next-line @typescript-eslint/no-var-requires
const urljoin = require("url-join");

export const CLIENT_ENDPOINT = process.env.CLIENT_ENDPOINT || "/chat";
export const GRAPHQL_ENDPOINT =
  process.env.GRAPHQL_ENDPOINT || "/graphql/graphql";

export const SBERT_ENDPOINT = process.env.SBERT_ENDPOINT || "/sbert";

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

export function isValidObjectID(id: string): boolean {
  return Boolean(id.match(/^[0-9a-fA-F]{24}$/));
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
    throw new Error(`http request failed: ${res.data}`);
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
      classifierLambdaEndpoint,
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
          mentorsDefault
          featuredMentors
          featuredMentorPanels
          activeMentors
          activeMentorPanels
          googleClientId
          urlDocSetup
          urlVideoIdleTips
          videoRecorderMaxLength
          classifierLambdaEndpoint
          uploadLambdaEndpoint
          styleHeaderLogo
          styleHeaderColor
          styleHeaderTextColor
          disclaimerTitle
          disclaimerText
          disclaimerDisabled
          displayGuestPrompt
          videoRecorderMaxLength
          subjectRecordPriority
          virtualBackgroundUrls
          defaultVirtualBackground
          questionSortOrder
          featuredKeywordTypes
          featuredSubjects
          defaultSubject
        }
      }
  `,
    },
    { dataPath: "config" }
  );
}

export async function fetchUsers(
  accessToken: string,
  searchParams?: SearchParams
): Promise<Connection<User>> {
  const params = { ...defaultSearchParams, ...searchParams };
  const { filter, limit, cursor, sortBy, sortAscending } = params;
  return execGql<Connection<User>>(
    {
      query: `
      query Users($filter: Object!, $limit: Int!, $cursor: String!, $sortBy: String!, $sortAscending: Boolean!){
        users (filter: $filter, limit: $limit, cursor: $cursor, sortBy: $sortBy, sortAscending: $sortAscending){
          edges {
            node {
              _id
              name
              email
              userRole
              defaultMentor {
                _id
                name
                isPrivate
                orgPermissions {
                  org
                  permission
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
      }`,
      variables: {
        filter,
        limit,
        cursor,
        sortBy,
        sortAscending,
      },
    },
    { dataPath: "users", accessToken }
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

export async function fetchKeywords(
  searchParams?: SearchParams
): Promise<Connection<Keyword>> {
  const params = { ...defaultSearchParams, ...searchParams };
  return await execGql<Connection<Keyword>>(
    {
      query: `
      query Keywords($filter: Object!, $cursor: String!, $limit: Int!, $sortBy: String!, $sortAscending: Boolean!) {
        keywords(
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
    { dataPath: "keywords" }
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
            isArchived
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
              isArchived
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
            isArchived
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
          isRequired: subject?.isRequired,
          isArchived: subject?.isArchived,
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

export async function updateMyFirstTimeTracking(
  updates: Partial<FirstTimeTracking>,
  accessToken: string
): Promise<FirstTimeTracking> {
  return await execGql<FirstTimeTracking>(
    {
      query: `
      mutation FirstTimeTrackingUpdate($updates: FirstTimeTrackingUpdateInputType!) {
        me{
          firstTimeTrackingUpdate(updates: $updates){
            myMentorSplash,
            tooltips,
          }
        }
      }
    `,
      variables: {
        updates,
      },
    },
    { dataPath: ["me", "firstTimeTrackingUpdate"], accessToken }
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
      query UserQuestions($filter: Object!, $limit: Int!, $cursor: String!, $sortBy: String!, $sortAscending: Boolean!){
        userQuestions(filter: $filter, limit: $limit,cursor: $cursor,sortBy: $sortBy,sortAscending: $sortAscending){
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
              dismissed
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
  return convertConnectionGQL(gql, convertUserQuestionGQL);
}

export async function fetchTrendingFeedback(
  searchParams: SearchParams
): Promise<Connection<TrendingUserQuestion>> {
  const params = { ...searchParams };
  const gql = await execGql<Connection<TrendingUserQuestion>>(
    {
      query: `
      query TrendingUserQuestions($filter: Object!, $limit: Int!, $cursor: String!, $sortBy: String!, $sortAscending: Boolean!){
        userQuestions(filter: $filter, limit: $limit,cursor: $cursor,sortBy: $sortBy,sortAscending: $sortAscending){
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
              dismissed
            }
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

export async function updateDismissUserQuestion(
  feedbackId: string,
  dismiss: boolean,
  accessToken: string
): Promise<boolean> {
  return await execGql<boolean>(
    {
      query: `
      mutation UserQuestionSetDismissed($id: ID!, $dismissed: Boolean!) {
        me{
          userQuestionSetDismissed(id: $id, dismissed: $dismissed) {
            dismissed
          }
        }
      }
    `,
      variables: {
        id: feedbackId,
        dismissed: dismiss,
      },
    },
    { dataPath: ["me", "userQuestionSetDismissed", "dismissed"], accessToken }
  );
}

export async function updateUserQuestion(
  feedbackId: string,
  answerId?: string,
  questionId?: string,
  mentorId?: string
): Promise<void> {
  // if an answerId exists, then only send that over, else send question and mentorid
  const variables = {
    id: feedbackId,
    ...(answerId ? { answer: answerId } : {}),
    ...(questionId && !answerId ? { question: questionId } : {}),
    ...(mentorId && !answerId ? { mentorId: mentorId } : {}),
  };
  await execGql<UserQuestion>(
    {
      query: `
      mutation UserQuestionSetAnswer($id: ID!, $answer: String, $question: String, $mentorId: ID) {
        userQuestionSetAnswer(id: $id, answer: $answer, question: $question, mentorId: $mentorId) {
          _id
        }
      }
    `,
      variables,
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
          goal
          email
          allowContact
          mentorType
          thumbnail
          lastTrainedAt
          lastPreviewedAt
          isDirty
          hasVirtualBackground
          virtualBackgroundUrl
          orgPermissions {
            org
            permission
          }
          defaultSubject {
            _id
          }
          keywords {
            _id
            name
            type
          }
          subjects {
            _id
            name
            type
            description
            isRequired
            isArchived
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
            markdownTranscript
            transcript
            status
            hasUntransferredMedia
            webMedia {
              type
              tag
              url
              transparentVideoUrl
              needsTransfer
            }
            mobileMedia{
              type
              tag
              url
              transparentVideoUrl
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

export async function sbertEncodeSentences(
  sentences: string[],
  accessToken: string
): Promise<SbertEncodedSentence[]> {
  return execHttp<SbertEncodedSentence[]>(
    "POST",
    urljoin(SBERT_ENDPOINT, "v1", "encode", "multiple_encode"),
    {
      axiosConfig: {
        data: { sentences: sentences },
      },
      accessToken,
    }
  );
}

export async function updateMentorKeywords(
  accessToken: string,
  mentor: Mentor,
  mentorId: string
): Promise<boolean> {
  return execGql<boolean>(
    {
      query: `
        mutation UpdateMentorKeywords($keywords: [UpdateKeywordType], $mentorId: ID) {
          me {
            updateMentorKeywords(keywords: $keywords, mentorId: $mentorId)
          }
        }
      `,
      variables: {
        keywords: mentor.keywords.map((k) => ({ name: k.name, type: k.type })),
        mentorId,
      },
    },
    { dataPath: ["me", "updateMentorKeywords"], accessToken }
  );
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
          goal: mentor.goal,
          email: mentor.email,
          allowContact: mentor.allowContact,
          mentorType: mentor.mentorType,
          isPrivate: mentor.isPrivate,
          hasVirtualBackground: mentor.hasVirtualBackground,
          virtualBackgroundUrl: mentor.virtualBackgroundUrl,
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

export async function updateMentorPrivacy(
  accessToken: string,
  mentor: Partial<Mentor>,
  mentorId: string
): Promise<boolean> {
  return execGql<boolean>(
    {
      query: `mutation UpdateMentorPrivacy($mentorId: ID!, $isPrivate: Boolean!, orgPermissions: [OrgPermissionInputType]) {
        me {
          updateMentorPrivacy(mentorId: $mentorId, isPrivate: $isPrivate, orgPermissions: $orgPermissions)
        }
      }`,
      variables: {
        mentorId,
        isPrivate: mentor.isPrivate,
        orgPermissions: mentor.orgPermissions,
      },
    },
    { dataPath: ["me", "updateMentorPrivacy"], accessToken }
  );
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
  classifierLambdaEndpoint?: string,
  ping?: boolean
): Promise<AsyncJob> {
  return execHttp("POST", urljoin(classifierLambdaEndpoint, "train"), {
    axiosConfig: {
      data: { mentor: mentorId, ping: ping || false },
    },
    accessToken,
  });
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
  thumbnail: File,
  accessToken: string,
  uploadLambdaEndpoint: string
): Promise<string> {
  const data = new FormData();
  data.append("body", JSON.stringify({ mentor: mentorId }));
  data.append("thumbnail", thumbnail);
  return execHttp("POST", urljoin(uploadLambdaEndpoint, "/thumbnail"), {
    axiosConfig: {
      data: data,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
    accessToken,
    dataPath: ["data", "thumbnail"],
  });
}

export async function uploadVbg(
  mentorId: string,
  vbg: File,
  accessToken: string,
  uploadLambdaEndpoint: string
): Promise<string> {
  const data = new FormData();
  data.append("body", JSON.stringify({ mentor: mentorId }));
  data.append("background_image", vbg);
  return execHttp("POST", urljoin(uploadLambdaEndpoint, "/vbg"), {
    axiosConfig: {
      data: data,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
    accessToken,
    dataPath: ["data", "virtualBackground"],
  });
}

export async function regenerateVTTForQuestion(
  questionId: string,
  mentorId: string,
  accessToken: string,
  uploadLambdaEndpoint: string
): Promise<boolean> {
  return execHttp<boolean>(
    "POST",
    urljoin(uploadLambdaEndpoint, "/regen_vtt"),
    {
      axiosConfig: {
        data: JSON.stringify({
          mentor: mentorId,
          question: questionId,
        }),
      },
      accessToken,
      dataPath: "regen_vtt",
    }
  );
}

export async function uploadVideo(
  mentorId: string,
  video: File,
  question: string,
  isVbgVideo: boolean,
  tokenSource: CancelTokenSource,
  accessToken: string,
  uploadLambdaEndpoint: string,
  trim?: { start: number; end: number },
  hasEditedTranscript?: boolean
): Promise<UploadProcessAsyncJob> {
  const presignedUrl: PresignedUrlResponse = await execHttp(
    "GET",
    urljoin(uploadLambdaEndpoint, "/upload/url"),
    {
      accessToken,
    }
  );
  const fields = presignedUrl.fields;
  const form = new FormData();
  if (fields.AWSAccessKeyId) {
    form.append("AWSAccessKeyId", fields.AWSAccessKeyId);
  }
  if (fields.bucket) {
    form.append("bucket", fields.bucket);
  }
  if (fields.key) {
    form.append("key", fields.key);
  }
  if (fields.policy) {
    form.append("policy", fields.policy);
  }
  if (fields.signature) {
    form.append("signature", fields.signature);
  }
  if (fields["x-amz-algorithm"]) {
    form.append("x-amz-algorithm", fields["x-amz-algorithm"]);
  }
  if (fields["x-amz-credential"]) {
    form.append("x-amz-credential", fields["x-amz-credential"]);
  }
  if (fields["x-amz-date"]) {
    form.append("x-amz-date", fields["x-amz-date"]);
  }
  if (fields["x-amz-security-token"]) {
    form.append("x-amz-security-token", fields["x-amz-security-token"]);
  }
  if (fields["x-amz-signature"]) {
    form.append("x-amz-signature", fields["x-amz-signature"]);
  }
  form.append("file", video);

  await fetch(presignedUrl.url, { method: "POST", body: form }).catch((err) => {
    throw new Error(`Failed to upload video: ${err}`);
  });

  return execHttp("POST", urljoin(uploadLambdaEndpoint, "/upload/answer"), {
    axiosConfig: {
      data: JSON.stringify({
        mentor: mentorId,
        question: question,
        video: presignedUrl.fields.key,
        isVbgVideo: isVbgVideo,
        trim: trim,
        hasEditedTranscript: hasEditedTranscript,
      }),
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
    accessToken,
  });
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
            firstTimeTracking{
              myMentorSplash,
              tooltips,
            }
          }
          accessToken
        }
      }
    `,
      variables: { accessToken },
    },
    // login responds with set-cookie, w/o withCredentials it doesnt get stored
    { dataPath: "login", axiosConfig: { withCredentials: true } }
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
    // login responds with set-cookie, w/o withCredentials it doesnt get stored
    { dataPath: "loginGoogle", axiosConfig: { withCredentials: true } }
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
                transparentVideoUrl
              }
              mobileMedia{
                type
                tag
                url
                transparentVideoUrl
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

//Fetches the record queue for the mentor that is logged in (using the accessToken to know which mentor to fetch from)
export async function fetchMentorRecordQueue(
  accessToken: string
): Promise<string[]> {
  return await execGql<string[]>(
    {
      query: `
        query FetchMentorRecordQueue {
          me {
            fetchMentorRecordQueue
          }
        }`,
    },
    { accessToken, dataPath: ["me", "fetchMentorRecordQueue"] }
  );
}

//Returns the new list after the addition
export async function addQuestionToRecordQueue(
  accessToken: string,
  questionId: string
): Promise<string[]> {
  return await execGql<string[]>(
    {
      query: `
        mutation AddQuestionToRecordQueue($questionId: ID!) {
          me {
            addQuestionToRecordQueue(questionId: $questionId)
          }
        }`,
      variables: {
        questionId,
      },
    },
    { accessToken, dataPath: ["me", "addQuestionToRecordQueue"] }
  );
}

//Returns the new list after the removal
export async function removeQuestionFromRecordQueue(
  accessToken: string,
  questionId: string
): Promise<string[]> {
  return await execGql<string[]>(
    {
      query: `
        mutation RemoveQuestionFromRecordQueue($questionId: ID!) {
          me {
            removeQuestionFromRecordQueue(questionId: $questionId)
          }
        }`,
      variables: {
        questionId,
      },
    },
    { accessToken, dataPath: ["me", "removeQuestionFromRecordQueue"] }
  );
}

//Returns the new list after the removal
export async function previewedMentor(mentorId: string): Promise<void> {
  return await execGql<void>({
    query: `
      mutation MentorPreviewed($mentorId: ID!) {
        mentorPreviewed(id: $mentorId){
          lastPreviewedAt
        }
      }`,
    variables: {
      mentorId,
    },
  });
}

export async function setRecordQueueGQL(
  accessToken: string,
  questionIds: string[]
): Promise<string[]> {
  return await execGql<string[]>(
    {
      query: `
        mutation SetRecordQueue($questionIds: [ID]!) {
          me {
            setRecordQueue(questionIds: $questionIds)
          }
        }`,
      variables: {
        questionIds,
      },
    },
    { accessToken, dataPath: ["me", "setRecordQueue"] }
  );
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

export async function exportMentor(
  mentor: string,
  accessToken: string
): Promise<MentorExportJson> {
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
              isArchived
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
    { dataPath: ["mentorExport"], accessToken }
  );
}

export async function importMentorPreview(
  mentor: string,
  json: MentorExportJson,
  accessToken: string
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
                isArchived
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
                isArchived
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
    { dataPath: ["mentorImportPreview"], accessToken }
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
              errorMessage
            }
            migrationErrors
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
  return execHttp("POST", urljoin(uploadLambdaEndpoint, "/transfer/mentor"), {
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
  });
}

export async function fetchMentors(
  accessToken: string,
  searchParams?: SearchParams
): Promise<Connection<MentorGQL>> {
  const params = { ...defaultSearchParams, ...searchParams };
  const { filter, limit, cursor, sortBy, sortAscending } = params;
  return execGql<Connection<MentorGQL>>(
    {
      query: `
        query Mentors($filter: Object!, $limit: Int!, $cursor: String!, $sortBy: String!, $sortAscending: Boolean!){
          mentors (filter: $filter, limit: $limit,cursor: $cursor,sortBy: $sortBy,sortAscending: $sortAscending){
            edges {
              node {
                _id
                name
                title
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
    { dataPath: "mentors", accessToken }
  );
}

export async function fetchMentorPanel(id: string): Promise<MentorPanel> {
  return await execGql<MentorPanel>(
    {
      query: `
        query MentorPanel($id: ID!) {
          mentorPanel(id: $id) {
            _id
            subject
            mentors
            title
            subtitle
          }
        }
      `,
      variables: { id },
    },
    { dataPath: "mentorPanel" }
  );
}

export async function fetchMentorPanels(
  searchParams?: SearchParams
): Promise<Connection<MentorPanel>> {
  const params = { ...defaultSearchParams, ...searchParams };
  return await execGql<Connection<MentorPanel>>(
    {
      query: `
      query MentorPanels($filter: Object!, $cursor: String!, $limit: Int!, $sortBy: String!, $sortAscending: Boolean!) {
        mentorPanels(
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
              subject
              mentors
              title
              subtitle
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
    { dataPath: "mentorPanels" }
  );
}

export async function addOrUpdateMentorPanel(
  accessToken: string,
  mentorPanel: MentorPanel,
  id?: string
): Promise<MentorPanel> {
  return execGql<MentorPanel>(
    {
      query: `mutation AddOrUpdateMentorPanel($id: ID, $mentorPanel: AddOrUpdateMentorPanelInputType!) {
        me {
          addOrUpdateMentorPanel(id: $id, mentorPanel: $mentorPanel) {
            _id
            subject
            mentors
            title
            subtitle
          }
        }
      }`,
      variables: {
        id,
        mentorPanel: {
          subject: mentorPanel.subject,
          mentors: mentorPanel.mentors,
          title: mentorPanel.title,
          subtitle: mentorPanel.subtitle,
        },
      },
    },
    { dataPath: ["me", "addOrUpdateMentorPanel"], accessToken }
  );
}

export async function fetchOrganizations(
  accessToken: string,
  searchParams?: SearchParams
): Promise<Connection<Organization>> {
  const params = { ...defaultSearchParams, ...searchParams };
  const { filter, limit, cursor, sortBy, sortAscending } = params;
  return execGql<Connection<Organization>>(
    {
      query: `
        query Organizations($filter: Object!, $limit: Int!, $cursor: String!, $sortBy: String!, $sortAscending: Boolean!){
          organizations (filter: $filter, limit: $limit, cursor: $cursor, sortBy: $sortBy, sortAscending: $sortAscending){
            edges {
              node {
                _id
                uuid
                name
                subdomain
                isPrivate
                members {
                  user {
                    _id
                    name
                    email
                  }
                  role
                }
                config {
                  mentorsDefault
                  featuredMentors
                  featuredMentorPanels
                  activeMentors
                  activeMentorPanels
                  googleClientId
                  urlDocSetup
                  urlVideoIdleTips
                  videoRecorderMaxLength
                  classifierLambdaEndpoint
                  uploadLambdaEndpoint
                  styleHeaderLogo
                  styleHeaderColor
                  styleHeaderTextColor
                  disclaimerTitle
                  disclaimerText
                  disclaimerDisabled
                  displayGuestPrompt
                  videoRecorderMaxLength
                  subjectRecordPriority
                  virtualBackgroundUrls
                  defaultVirtualBackground
                  questionSortOrder
                  featuredKeywordTypes
                  featuredSubjects
                  defaultSubject
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
    { dataPath: "organizations", accessToken }
  );
}

export async function addOrUpdateOrganization(
  accessToken: string,
  organization: Partial<Organization>,
  id?: string
): Promise<Organization> {
  return execGql<Organization>(
    {
      query: `mutation AddOrUpdateOrganization($id: ID, $organization: AddOrUpdateOrganizationInputType!) {
        me {
          addOrUpdateOrganization(id: $id, organization: $organization) {
            _id
            uuid
            name
            subdomain
            isPrivate
            members {
              user {
                _id
                name
                email
              }
              role
            }
            config {
              mentorsDefault
              featuredMentors
              featuredMentorPanels
              activeMentors
              activeMentorPanels
              googleClientId
              urlDocSetup
              urlVideoIdleTips
              videoRecorderMaxLength
              classifierLambdaEndpoint
              uploadLambdaEndpoint
              styleHeaderLogo
              styleHeaderColor
              styleHeaderTextColor
              disclaimerTitle
              disclaimerText
              disclaimerDisabled
              displayGuestPrompt
              videoRecorderMaxLength
              subjectRecordPriority
              virtualBackgroundUrls
              defaultVirtualBackground
              questionSortOrder
              featuredKeywordTypes
              featuredSubjects
              defaultSubject
            }
          }
        }
      }`,
      variables: {
        id,
        organization: {
          name: organization.name,
          subdomain: organization.subdomain,
          isPrivate: organization.isPrivate,
          members:
            organization.members?.map((m) => ({
              user: m.user._id,
              role: m.role,
            })) || [],
        },
      },
    },
    { dataPath: ["me", "addOrUpdateOrganization"], accessToken }
  );
}

export async function updateOrgConfig(
  accessToken: string,
  id: string,
  config: Config
): Promise<Config> {
  return execGql<Config>(
    {
      query: `mutation UpdateOrganizationConfig($id: ID!, $config: ConfigUpdateInputType!) {
        me {
          updateOrgConfig(id: $id, config: $config) {
            mentorsDefault
            featuredMentors
            featuredMentorPanels
            activeMentors
            activeMentorPanels
            googleClientId
            urlDocSetup
            urlVideoIdleTips
            videoRecorderMaxLength
            classifierLambdaEndpoint
            uploadLambdaEndpoint
            styleHeaderLogo
            styleHeaderColor
            styleHeaderTextColor
            disclaimerTitle
            disclaimerText
            disclaimerDisabled
            displayGuestPrompt
            videoRecorderMaxLength
            subjectRecordPriority
            virtualBackgroundUrls
            defaultVirtualBackground
            questionSortOrder
            featuredKeywordTypes
            featuredSubjects
            defaultSubject
          }
        }
      }`,
      variables: {
        id,
        config: {
          featuredMentors: config.featuredMentors,
          featuredMentorPanels: config.featuredMentorPanels,
          activeMentors: config.activeMentors,
          activeMentorPanels: config.activeMentorPanels,
          mentorsDefault: config.mentorsDefault,
          styleHeaderLogo: config.styleHeaderLogo,
          styleHeaderColor: config.styleHeaderColor,
          styleHeaderTextColor: config.styleHeaderTextColor,
          disclaimerTitle: config.disclaimerTitle,
          disclaimerText: config.disclaimerText,
          disclaimerDisabled: config.disclaimerDisabled,
          displayGuestPrompt: config.displayGuestPrompt,
          videoRecorderMaxLength: config.videoRecorderMaxLength,
          questionSortOrder: config.questionSortOrder,
          featuredKeywordTypes: config.featuredKeywordTypes,
          featuredSubjects: config.featuredSubjects,
          defaultSubject: config.defaultSubject,
        },
      },
    },
    { dataPath: ["me", "updateOrgConfig"], accessToken }
  );
}

export async function updateConfig(
  accessToken: string,
  config: Config
): Promise<Config> {
  return execGql<Config>(
    {
      query: `mutation UpdateConfig($config: ConfigUpdateInputType!) {
        me {
          updateConfig(config: $config) {
            mentorsDefault
            featuredMentors
            featuredMentorPanels
            activeMentors
            activeMentorPanels
            googleClientId
            urlDocSetup
            urlVideoIdleTips
            videoRecorderMaxLength
            classifierLambdaEndpoint
            uploadLambdaEndpoint
            styleHeaderLogo
            styleHeaderColor
            styleHeaderTextColor
            disclaimerTitle
            disclaimerText
            disclaimerDisabled
            displayGuestPrompt
            videoRecorderMaxLength
            questionSortOrder
            featuredKeywordTypes
            featuredSubjects
            defaultSubject
          }
        }
      }`,
      variables: {
        config: {
          featuredMentors: config.featuredMentors,
          featuredMentorPanels: config.featuredMentorPanels,
          activeMentors: config.activeMentors,
          activeMentorPanels: config.activeMentorPanels,
          mentorsDefault: config.mentorsDefault,
          styleHeaderLogo: config.styleHeaderLogo,
          styleHeaderColor: config.styleHeaderColor,
          styleHeaderTextColor: config.styleHeaderTextColor,
          disclaimerTitle: config.disclaimerTitle,
          disclaimerText: config.disclaimerText,
          disclaimerDisabled: config.disclaimerDisabled,
          displayGuestPrompt: config.displayGuestPrompt,
          videoRecorderMaxLength: config.videoRecorderMaxLength,
          questionSortOrder: config.questionSortOrder,
          featuredKeywordTypes: config.featuredKeywordTypes,
          featuredSubjects: config.featuredSubjects,
          defaultSubject: config.defaultSubject,
        },
      },
    },
    { dataPath: ["me", "updateConfig"], accessToken }
  );
}
