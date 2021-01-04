import {
  Mentor,
  Question,
  Status,
  UtteranceType,
  User,
  UserAccessToken,
} from "types";

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
const newMentor: Mentor = {
  id: "clint",
  videoId: "clintanderson",
  name: "",
  shortName: "",
  title: "",
  topics: [
    {
      id: "background",
      name: "Background",
      description: "These questions will ask general questions about your background, that might be relevant to how people understand your career",
      category: "About Me"
    },
    {
      id: "advice",
      name: "Advice",
      description: "These questions will ask you to give some general advice to newcomers interested in entering into your field",
      category: "What Does it Take?"
    },
  ],
  questions: [
    {
      id: "A1_1_1",
      question: "Who are you and what do you do?",
      topics: [
        {
          id: "background",
          name: "Background",
          description: "These questions will ask general questions about your background, that might be relevant to how people understand your career",
          category: "About Me"
        }
      ],
      video: "",
      transcript: "",
      recordedAt: "",
      status: Status.INCOMPLETE,
    },
    {
      id: "A2_1_1",
      question: "How old are you now?",
      topics: [
        {
          id: "background",
          name: "Background",
          description: "These questions will ask general questions about your background, that might be relevant to how people understand your career",
          category: "About Me"
        }
      ],
      video: "",
      transcript: "",
      recordedAt: "",
      status: Status.INCOMPLETE,
    },
    {
      id: "A3_1_1",
      question: "Can you give me some advice?",
      topics: [
        {
          id: "advice",
          name: "Advice",
          description: "These questions will ask you to give some general advice to newcomers interested in entering into your field",
          category: "What Does it Take?"
        }
      ],
      video: "",
      transcript: "",
      recordedAt: "",
      status: Status.INCOMPLETE,
    }
  ],
  utterances: [
    {
      id: "U1_1_1",
      question: "Please look at the camera for 30 seconds without speaking. Try to remain in the same position.",
      topics: [
        {
          id: UtteranceType.IDLE,
          name: "Idle",
          description: '30-second idle clip',
          category: "Utterance"
        }
      ],
      video: "",
      transcript: "",
      recordedAt: "",
      status: Status.INCOMPLETE
    },
    {
      id: "U2_1_1",
      question: "Please give a short introduction of yourself, which includes your name, current job, and title.",
      topics: [
        {
          id: UtteranceType.INTRO,
          name: "Intro",
          description: 'Short introduction about you',
          category: "Utterance"
        }
      ],
      video: "",
      transcript: "",
      recordedAt: "",
      status: Status.INCOMPLETE
    },
    {
      id: "U3_1_1",
      question: "Please repeat the following: 'I couldn't understand the question. Try asking me something else.'",
      topics: [
        {
          id: UtteranceType.OFF_TOPIC,
          name: "Off-Topic",
          description: 'Short responses to off-topic questions you do not have answers for or do not understand',
          category: "Utterance"
        }
      ],
      video: "",
      transcript: "",
      recordedAt: "",
      status: Status.INCOMPLETE
    }
  ]
}
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
    id: "clint",
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
  const isUtterance = question.id.startsWith("U");
  if (isUtterance) {
    const idx = mentor.utterances.findIndex((u: Question) => u.id === question.id);
    if (idx === -1) {
      mentor.utterances.push(question)
    } else {
      mentor.utterances.splice(idx, 1, question)
    }
  } else {
    const idx = mentor.questions.findIndex((q: Question) => q.id === question.id);
    if (idx === -1) {
      mentor.questions.push(question)
    } else {
      mentor.questions.splice(idx, 1, question)
    }
  }
  state = {
    ...state,
    mentor
  }
  return mentor;
}

export async function uploadVideo(mentorId: string, videoId: string, video: any, accessToken: string): Promise<Mentor> {
  await delay(5000);
  const mentor: Mentor = fetchMentor(mentorId, accessToken);
  const isUtterance = videoId.startsWith("U");
  if (isUtterance) {
    const utterance = mentor.utterances.find((u: Question) => u.id === videoId);
    if (!utterance) {
      throw new Error(`could not find utterance ${videoId}`)
    }
    utterance.video = `https://video.mentorpal.org/videos/mentors/${mentor.id}/web/${mentor.videoId}_${utterance.id}.mp4`
    utterance.recordedAt = (new Date()).toLocaleDateString();
    const idx = mentor.utterances.findIndex((u: Question) => u.id === videoId);
    mentor.utterances.splice(idx, 1, utterance);
  }
  else {
    const question = mentor.questions.find((q: Question) => q.id === videoId);
    if (!question) {
      throw new Error(`could not find questions ${videoId}`)
    }
    question.video = `https://video.mentorpal.org/videos/mentors/${mentor.id}/web/${mentor.videoId}_${question.id}.mp4`
    question.recordedAt = (new Date()).toLocaleDateString();
    const idx = mentor.questions.findIndex((u: Question) => u.id === videoId);
    mentor.questions.splice(idx, 1, question);
  }
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

/**
 * This is temporary just for
 * the sprint where we're strictly focused on UI
 */
export function useFakeApis() {
  return process.env.GATSBY_USE_FAKE_APIS;
}
