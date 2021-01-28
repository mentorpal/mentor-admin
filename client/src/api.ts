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
  QuestionSet,
  Connection,
  TrainJob,
  TrainStatus,
  Status,
} from "types";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const urljoin = require("url-join");

const GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT || "/graphql";
const CLASSIFIER_ENTRYPOINT = process.env.CLASSIFIER_ENTRYPOINT || "/classifier";

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
  mentor: Mentor;
}
interface FetchSubjects {
  subjects: Connection<Subject>;
}
interface FetchTopics {
  topics: Connection<Topic>;
}
interface FetchQuestionSet {
  questionSet: QuestionSet;
}
interface Login {
  login: UserAccessToken;
}
interface LoginGoogle {
  loginGoogle: UserAccessToken;
}
interface UpdateMentor {
  me: {
    updateMentor: Mentor;
  };
}
interface UpdateQuestion {
  me: {
    updateQuestion: Mentor;
  };
}
interface UploadVideo {
  me: {
    uploadVideo: Mentor;
  };
}
interface AddQuestionSet {
  me: {
    addQuestionSet: Mentor;
  };
}
interface GenerateTranscript {
  me: {
    generateTranscript: string;
  };
}

interface Answer {
  question: {
    _id: string;
    text: string;
    subject: Subject;
  }
  video: string;
  transcript: string;
  status: Status;
  recordedAt: string;
}
interface FetchAnswersForSubjects {
  mentorAnswersForSubjects: {
    answers: Answer[]
  }
}
function convertAnswersToOldQuestions(answers: Answer[]): Question[] {
  return answers.map((a: Answer) => {
    const question: Question = {
      id: a.question._id,
      question: a.question.text,
      subject: a.question.subject,
      topics: [],
      video: a.video,
      transcript: a.transcript,
      status: a.status,
      recordedAt: a.recordedAt
    }
    return question
  })
}
async function fetchAnswersForSubjects(mentorId: string, subjectIds: string[]) {
  const result = await axios.post<GQLResponse<FetchAnswersForSubjects>>(
    GRAPHQL_ENDPOINT,
    {
      query: `
      query {
        mentorAnswersForSubjects(mentor: "${mentorId}", subjects: "${subjectIds}") {
          answers {
            question {
              _id
              text
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
    `,
    },
  );
  return result.data.data!.mentorAnswersForSubjects;
}

export async function fetchMentor(
  id: string,
  accessToken: string
): Promise<Mentor> {
  const headers = { Authorization: `bearer ${accessToken}` };
  const result = await axios.post<GQLResponse<FetchMentor>>(
    GRAPHQL_ENDPOINT,
    {
      query: `
      query {
        mentor(id: "${id}") {
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
        }
      }
    `,
    },
    { headers: headers }
  );
  const mentor = result.data.data!.mentor;
  const answers = await fetchAnswersForSubjects(mentor._id, mentor.subjects.map(s => s._id));
  mentor.questions = convertAnswersToOldQuestions(answers.answers);
  return mentor;
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

export async function fetchQuestionSet(
  id: string,
  accessToken: string
): Promise<QuestionSet> {
  const headers = { Authorization: `bearer ${accessToken}` };
  const result = await axios.post<GQLResponse<FetchQuestionSet>>(
    GRAPHQL_ENDPOINT,
    {
      query: `
      query {
        questionSet(id: "${id}")) {
          subject {
            _id
            name
            description
          }
          questions {
            id
            question
            subject {
              _id
              name
              description
            }
            topic {
              _id
              name
              description
            }
          }
        }
      }
    `,
    },
    { headers: headers }
  );
  return result.data.data!.questionSet;
}

export async function updateMentor(
  updateMentor: Mentor,
  accessToken: string
): Promise<Mentor> {
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
          updateMentor(mentor: "${encodedMentor}") {
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
          }  
        }
      }
    `,
    },
    { headers: headers }
  );
  const mentor = result.data.data!.me.updateMentor;
  const answers = await fetchAnswersForSubjects(mentor._id, mentor.subjects.map(s => s._id));
  mentor.questions = convertAnswersToOldQuestions(answers.answers);
  return mentor;
}

export async function updateAnswer(
  mentorId: string,
  question: Question,
  accessToken: string
): Promise<Mentor> {
  const convertedQuestion = {
    ...question,
    subject: question.subject ? question.subject._id : undefined,
    topics: question.topics.map((t: Topic) => t._id),
  };
  const encodedQuestion = encodeURI(JSON.stringify(convertedQuestion));
  const headers = { Authorization: `bearer ${accessToken}` };
  const result = await axios.post<GQLResponse<UpdateQuestion>>(
    GRAPHQL_ENDPOINT,
    {
      query: `
      mutation {
        me {
          updateAnswer(mentorId: "${mentorId}", question: "${encodedQuestion}") {
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
          }  
        }
      }
    `,
    },
    { headers: headers }
  );
  const mentor = result.data.data!.me.updateQuestion;
  const answers = await fetchAnswersForSubjects(mentor._id, mentor.subjects.map(s => s._id));
  mentor.questions = convertAnswersToOldQuestions(answers.answers);
  return mentor;
}

export async function addQuestionSet(
  mentorId: string,
  subjectId: string,
  accessToken: string
): Promise<Mentor> {
  const headers = { Authorization: `bearer ${accessToken}` };
  const result = await axios.post<GQLResponse<AddQuestionSet>>(
    GRAPHQL_ENDPOINT,
    {
      query: `
      mutation {
        me {
          addQuestionSet(mentorId: "${mentorId}", subjectId: "${subjectId}") {
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
          }  
        }
      }
    `,
    },
    { headers: headers }
  );
  const mentor = result.data.data!.me.addQuestionSet;
  const answers = await fetchAnswersForSubjects(mentor._id, mentor.subjects.map(s => s._id));
  mentor.questions = convertAnswersToOldQuestions(answers.answers);
  return mentor;
}

export async function uploadVideo(
  mentorId: string,
  questionId: string,
  video: any,
  accessToken: string
): Promise<Mentor> {
  const encodedVideo = encodeURI(JSON.stringify(video));
  const headers = { Authorization: `bearer ${accessToken}` };
  const result = await axios.post<GQLResponse<UploadVideo>>(
    GRAPHQL_ENDPOINT,
    {
      query: `
      mutation {
        me {
          uploadVideo(mentorId: "${mentorId}", questionId: "${questionId}", video: "${encodedVideo}") {
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
          }  
        }
      }
    `,
    },
    { headers: headers }
  );
  const mentor = result.data.data!.me.uploadVideo;
  const answers = await fetchAnswersForSubjects(mentor._id, mentor.subjects.map(s => s._id));
  mentor.questions = convertAnswersToOldQuestions(answers.answers);
  return mentor;
}

export async function generateTranscript(
  mentorId: string,
  questionId: string,
  accessToken: string
): Promise<string> {
  const headers = { Authorization: `bearer ${accessToken}` };
  const result = await axios.post<GQLResponse<GenerateTranscript>>(
    GRAPHQL_ENDPOINT,
    {
      query: `
      mutation {
        me {
          generateTranscript(mentor: "${mentorId}", questionId: "${questionId}")
        }
      }
    `,
    },
    { headers: headers }
  );
  return result.data.data!.me.generateTranscript;
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
