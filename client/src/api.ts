import axios from "axios";
import { UserAccessToken, Mentor, Topic, Question, Connection } from "types";
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
interface UpdateQuestion {
  updateQuestion: Mentor;
}
interface GenerateTranscript {
  transcript: string;
}
interface FetchQuestions {
  questions: Connection<Question>;
}
interface FetchTopic {
  topic: Topic;
}
interface Login {
  login: UserAccessToken;
}
interface LoginGoogle {
  loginGoogle: UserAccessToken;
}

export async function fetchMentor(id: string, accessToken: string): Promise<Mentor> {
  const headers = { Authorization: `bearer ${accessToken}` };
  const result = await axios.post<GQLResponse<FetchMentor>>(GRAPHQL_ENDPOINT, {
    query: `
      query {
        mentor(id: "${id}") {
          id
          videoId
          name
          shortName
          title
          topics {
            name
            description
            category
          }
          questions {
            question
            topics {
              id
              name
              description
              category
            }
            videoId
            video
            transcript
            status
            recordedAt
          }
          utterances {
            question
            topics {
              id
              name
              description
              category
            }
            videoId
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
  const convertedMentor = { ...mentor, topics: mentor.topics.map((t: Topic) => t.id) }
  const encodedMentor = encodeURI(JSON.stringify(convertedMentor));
  const headers = { Authorization: `bearer ${accessToken}` };
  const result = await axios.post<GQLResponse<UpdateMentor>>(GRAPHQL_ENDPOINT, {
    query: `
      mutation {
        updateMentor(mentor: "${encodedMentor}") {
          id
          videoId
          name
          shortName
          title
          topics {
            name
            description
            category
          }
          questions {
            question
            topics {
              id
              name
              description
              category
            }
            videoId
            video
            transcript
            status
            recordedAt
          }
          utterances {
            question
            topics {
              id
              name
              description
              category
            }
            videoId
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

export async function updateQuestion(mentorId: string, question: Question, accessToken: string): Promise<Mentor> {
  const convertedQuestion = { ...question, topics: question.topics.map((t: Topic) => t.id) }
  const encodedQuestion = encodeURI(JSON.stringify(convertedQuestion));
  const headers = { Authorization: `bearer ${accessToken}` };
  const result = await axios.post<GQLResponse<UpdateQuestion>>(GRAPHQL_ENDPOINT, {
    query: `
      mutation {
        updateQuestion(mentor: "${mentorId}", question: "${encodedQuestion}") {
          id
          videoId
          name
          shortName
          title
          topics {
            name
            description
            category
          }
          questions {
            question
            topics {
              id
              name
              description
              category
            }
            videoId
            video
            transcript
            status
            recordedAt
          }
          utterances {
            question
            topics {
              id
              name
              description
              category
            }
            videoId
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

export async function generateTranscript(mentorId: string, videoId: string, accessToken: string): Promise<string> {
  const headers = { Authorization: `bearer ${accessToken}` };
  const result = await axios.post<GQLResponse<GenerateTranscript>>(GRAPHQL_ENDPOINT, {
    query: `
      mutation {
        generateTranscript(mentor: "${mentorId}", videoId: "${videoId}") {
          transcript
        }
      }
    `,
  }, { headers: headers });
  return result.data.data!.transcript;
}

export async function fetchQuestions(
  mentorId: string,
  filter: any,
  limit: number,
  cursor: string,
  sortBy: string,
  sortAsc: boolean,
  accessToken: string
): Promise<Connection<Question>> {
  const headers = { Authorization: `bearer ${accessToken}` };
  const result = await axios.post<GQLResponse<FetchQuestions>>(GRAPHQL_ENDPOINT, {
    query: `
      query {
        questions(
          mentor:${mentorId},
          filter:"${encodeURI(JSON.stringify(filter))}",
          limit:${limit},
          cursor:"${cursor}",
          sortBy:"${sortBy}",
          sortAscending:${sortAsc}
        ) {
          edges {
            cursor
            node {
              question
              topics {
                id
                name
                description
                category
              }
              videoId
              video
              transcript
              status
              recordedAt    
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
  }, { headers: headers });
  return result.data.data!.questions;
}

export async function fetchTopic(id: string, accessToken: string): Promise<Topic> {
  const headers = { Authorization: `bearer ${accessToken}` };
  const result = await axios.post<GQLResponse<FetchTopic>>(GRAPHQL_ENDPOINT, {
    query: `
      query {
        topic(id: "${id}") {
          id
          name
          description
          category
        }
      }
    `,
  }, { headers: headers });
  return result.data.data!.topic;
}

export async function login(accessToken: string): Promise<UserAccessToken> {
  if(fakeApis.useFakeApis()) {
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
