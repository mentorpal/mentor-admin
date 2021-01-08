import axios from "axios";
import { UserAccessToken, Mentor, Topic, Question, Set, QuestionSet } from "types";
import * as fakeApis from "./fake_servers"

const GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT || "/graphql";
interface GQLResponse<T> {
  errors?: { message: string }[];
  data?: T;
}
interface FetchMentor {
  mentor: Mentor;
}
interface UpdateMentor {
  updateMentor: Mentor;
}
interface BuildMentor {
  buildMentor: Mentor;
}
interface UpdateQuestion {
  updateQuestion: Mentor;
}
interface UploadVideo {
  uploadVideo: Mentor;
}
interface GenerateTranscript {
  transcript: string;
}
interface FetchSets {
  sets: Set[];
}
interface FetchTopics {
  topics: Topic[];
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

export async function fetchMentor(id: string, accessToken: string): Promise<Mentor> {
  if (fakeApis.useFakeApis()) {
    return fakeApis.fetchMentor(id, accessToken);
  }
  const headers = { Authorization: `bearer ${accessToken}` };
  const result = await axios.post<GQLResponse<FetchMentor>>(GRAPHQL_ENDPOINT, {
    query: `
      query {
        mentor(id: "${id}") {
          id
          name
          shortName
          title
          isBuilt
          sets {
            id
            name
            description
          }
          questions {
            id
            question
            set {
              id
              name
              description
            }
            topics {
              id
              name
              description
            }
            video
            transcript
            status
            recordedAt
          }
        }
      }
    `,
  }, { headers: headers });
  return result.data.data!.mentor;
}

export async function updateMentor(mentor: Mentor, accessToken: string): Promise<Mentor> {
  if (fakeApis.useFakeApis()) {
    return fakeApis.updateMentor(mentor, accessToken);
  }
  const convertedMentor = {
    ...mentor,
    sets: mentor.sets.map((s: Set) => s.id),
    questions: mentor.questions.map((q: Question) => {
      return {
        ...q,
        set: q.set ? q.set.id : null,
        topics: q.topics.map((t: Topic) => t.id)
      }
    })
  }
  const encodedMentor = encodeURI(JSON.stringify(convertedMentor));
  const headers = { Authorization: `bearer ${accessToken}` };
  const result = await axios.post<GQLResponse<UpdateMentor>>(GRAPHQL_ENDPOINT, {
    query: `
      mutation {
        updateMentor(mentor: "${encodedMentor}") {
          id
          name
          shortName
          title
          isBuilt
          sets {
            id
            name
            description
          }
          questions {
            id
            question
            set {
              id
              name
              description
            }
            topics {
              id
              name
              description
            }
            video
            transcript
            status
            recordedAt
          }
        }
      }
    `,
  }, { headers: headers });
  return result.data.data!.updateMentor;
}

export async function buildMentor(id: string, accessToken: string): Promise<Mentor> {
  if (fakeApis.useFakeApis()) {
    return fakeApis.buildMentor(id, accessToken);
  }
  const headers = { Authorization: `bearer ${accessToken}` };
  const result = await axios.post<GQLResponse<BuildMentor>>(GRAPHQL_ENDPOINT, {
    query: `
      mutation {
        buildMentor(id: "${id}") {
          id
          name
          shortName
          title
          isBuilt
          sets {
            id
            name
            description
          }
          questions {
            id
            question
            set {
              id
              name
              description
            }
            topics {
              id
              name
              description
            }
            video
            transcript
            status
            recordedAt
          }
        }
      }
    `,
  }, { headers: headers });
  return result.data.data!.buildMentor
}

export async function updateQuestion(mentorId: string, question: Question, accessToken: string): Promise<Mentor> {
  if (fakeApis.useFakeApis()) {
    return fakeApis.updateQuestion(mentorId, question, accessToken);
  }
  const convertedQuestion = {
    ...question,
    set: question.set ? question.set.id : undefined,
    topics: question.topics.map((t: Topic) => t.id)
  }
  const encodedQuestion = encodeURI(JSON.stringify(convertedQuestion));
  const headers = { Authorization: `bearer ${accessToken}` };
  const result = await axios.post<GQLResponse<UpdateQuestion>>(GRAPHQL_ENDPOINT, {
    query: `
      mutation {
        updateQuestion(mentor: "${mentorId}", question: "${encodedQuestion}") {
          id
          name
          shortName
          title
          isBuilt
          sets {
            id
            name
            description
          }
          questions {
            id
            question
            set {
              id
              name
              description
            }
            topics {
              id
              name
              description
            }
            video
            transcript
            status
            recordedAt
          }
        }
      }
    `,
  }, { headers: headers });
  return result.data.data!.updateQuestion;
}

export async function uploadVideo(mentorId: string, questionId: string, video: any, accessToken: string): Promise<Mentor> {
  if (fakeApis.useFakeApis()) {
    return fakeApis.uploadVideo(mentorId, questionId, video, accessToken);
  }
  const encodedVideo = encodeURI(JSON.stringify(video));
  const headers = { Authorization: `bearer ${accessToken}` };
  const result = await axios.post<GQLResponse<UploadVideo>>(GRAPHQL_ENDPOINT, {
    query: `
      mutation {
        uploadVideo(mentorId: "${mentorId}", questionId: "${questionId}", video: "${encodedVideo}") {
          id
          name
          shortName
          title
          isBuilt
          sets {
            id
            name
            description
          }
          questions {
            id
            question
            set {
              id
              name
              description
            }
            topics {
              id
              name
              description
            }
            video
            transcript
            status
            recordedAt
          }
        }
      }
    `,
  }, { headers: headers });
  return result.data.data!.uploadVideo;
}

export async function generateTranscript(mentorId: string, questionId: string, accessToken: string): Promise<string> {
  if (fakeApis.useFakeApis()) {
    return fakeApis.generateTranscript(mentorId, questionId, accessToken);
  }
  const headers = { Authorization: `bearer ${accessToken}` };
  const result = await axios.post<GQLResponse<GenerateTranscript>>(GRAPHQL_ENDPOINT, {
    query: `
      mutation {
        generateTranscript(mentor: "${mentorId}", questionId: "${questionId}") {
          transcript
        }
      }
    `,
  }, { headers: headers });
  return result.data.data!.transcript;
}

export async function fetchSets(accessToken: string): Promise<Set[]> {
  if (fakeApis.useFakeApis()) {
    return fakeApis.fetchSets(accessToken);
  }
  const headers = { Authorization: `bearer ${accessToken}` };
  const result = await axios.post<GQLResponse<FetchSets>>(GRAPHQL_ENDPOINT, {
    query: `
      query {
        sets {
          id
          name
          description
        }
      }
    `,
  }, { headers: headers });
  return result.data.data!.sets;
}

export async function fetchTopics(accessToken: string): Promise<Topic[]> {
  if (fakeApis.useFakeApis()) {
    return fakeApis.fetchTopics(accessToken);
  }
  const headers = { Authorization: `bearer ${accessToken}` };
  const result = await axios.post<GQLResponse<FetchTopics>>(GRAPHQL_ENDPOINT, {
    query: `
      query {
        topics {
          id
          name
          description
        }
      }
    `,
  }, { headers: headers });
  return result.data.data!.topics;
}

export async function fetchQuestionSet(id: string, accessToken: string): Promise<QuestionSet> {
  if (fakeApis.useFakeApis()) {
    return fakeApis.fetchQuestionSet(id, accessToken);
  }
  const headers = { Authorization: `bearer ${accessToken}` };
  const result = await axios.post<GQLResponse<FetchQuestionSet>>(GRAPHQL_ENDPOINT, {
    query: `
      query {
        questionSet(id: "${id}")) {
          set {
            id
            name
            description
          }
          questions {
            id
            question
            set
            topic {
              id
              name
              description
            }
          }
        }
      }
    `,
  }, { headers: headers });
  return result.data.data!.questionSet;
}

export async function login(accessToken: string): Promise<UserAccessToken> {
  if (fakeApis.useFakeApis()) {
    return fakeApis.login(accessToken);
  }
  const result = await axios.post<GQLResponse<Login>>(GRAPHQL_ENDPOINT, {
    query: `
      mutation {
        login(accessToken: "${accessToken}") {
          user {
            id
            name
          }
          accessToken
        }
      }
    `,
  });
  return result.data.data!.login;
}

export async function loginGoogle(accessToken: string): Promise<UserAccessToken> {
  const result = await axios.post<GQLResponse<LoginGoogle>>(GRAPHQL_ENDPOINT, {
    query: `
      mutation {
        loginGoogle(accessToken: "${accessToken}") {
          user {
            id
            name
          }
          accessToken
        }
      }
    `,
  });
  return result.data.data!.loginGoogle;
}
