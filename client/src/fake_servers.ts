import {
  Mentor,
  Set,
  Topic,
  Question,
  QuestionSet,
  User,
  UserAccessToken,
} from "types";
import { sets, topics, questions, newMentor } from "fake_database";

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
let state: Schema = {}

export interface Schema {
  mentor?: Mentor;
  user?: User;
}

export function getState(): Schema {
  return state;
}

export async function login(accessToken: string): Promise<UserAccessToken> {
  await delay(1000);
  const user: User = {
    id: "clintanderson",
    name: "Clinton Anderson",
    email: "clint@anderson.com"
  }
  state = {
    ...state,
    user
  }
  return {
    user: user,
    accessToken,
    expirationDate: ""
  }
}

export function fetchMentor(id: string, accessToken: string): Mentor {
  const mentor: Mentor = state.mentor ? state.mentor : newMentor;
  state = {
    ...state,
    mentor
  }
  return mentor
}

export function updateMentor(mentor: Mentor, accessToken: string): Mentor {
  state = {
    ...state,
    mentor
  }
  return mentor;
}

export function updateQuestion(mentorId: string, question: Question, accessToken: string): Mentor {
  const mentor: Mentor = fetchMentor(mentorId, accessToken);
  const idx = mentor.questions.findIndex((q: Question) => q.id === question.id);
  if (idx === -1) {
    mentor.questions.push(question)
  } else {
    mentor.questions.splice(idx, 1, question)
  }
  state = {
    ...state,
    mentor
  }
  return mentor;
}

export async function uploadVideo(mentorId: string, questionId: string, video: any, accessToken: string): Promise<Mentor> {
  await delay(5000);
  const mentor: Mentor = fetchMentor(mentorId, accessToken);
  const question = mentor.questions.find((q: Question) => q.id === questionId);
  if (!question) {
    throw new Error(`could not find question ${questionId}`)
  }
  question.video = `https://video.mentorpal.org/videos/mentors/clint/web/${mentor.id}_${question.id}.mp4`
  question.recordedAt = (new Date()).toLocaleDateString();
  const idx = mentor.questions.findIndex((q: Question) => q.id === questionId);
  mentor.questions.splice(idx, 1, question);
  state = {
    ...state,
    mentor
  }
  return mentor;
}

export async function generateTranscript(mentorId: string, videoId: string, accessToken: string): Promise<string> {
  await delay(3000);
  return "this is an auto generated transcript";
}

export async function fetchSets(accessToken: string): Promise<Set[]> {
  return sets;
}

export async function fetchTopics(accessToken: string): Promise<Topic[]> {
  return topics;
}

export async function fetchQuestionSet(id: string, accessToken: string): Promise<QuestionSet> {
  const s = sets.find((s: Set) => s.id === id);
  if (!s) {
    throw new Error("set not found");
  }
  const qs = questions.filter((q: Question) => q.set !== undefined && q.set.id === id);
  if (!qs) {
    throw new Error("no questions found");
  }
  return {
    set: s,
    questions: qs
  }
}

/**
 * This is temporary just for
 * the sprint where we're strictly focused on UI
 */
export function useFakeApis() {
  return process.env.GATSBY_USE_FAKE_APIS;
}
