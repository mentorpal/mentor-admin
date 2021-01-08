import {
  Mentor,
  Set,
  Topic,
  Question,
  Status,
} from "types";

export const sets: Set[] = [
  {
    id: "repeat_after_me",
    name: "Repeat After Me",
    description: "These are miscellaneous phrases you'll be asked to repeat.",
  },
  {
    id: "background",
    name: "Background",
    description: "These questions will ask general questions about your background that might be relevant to how people understand your career.",
  },
  {
    id: "stem",
    name: "STEM",
    description: "These questions will ask about STEM careers.",
  },
  {
    id: "leadership",
    name: "Leadership",
    description: "These questions will ask about being in a leadership role.",
  },
]

export const topics: Topic[] = [
  {
    id: "background",
    name: "Background",
    description: "These questions will ask general questions about your background, that might be relevant to how people understand your career",
  },
  {
    id: "advice",
    name: "Advice",
    description: "These questions will ask you to give some general advice to newcomers interested in entering into your field",
  },
  {
    id: "idle",
    name: "Idle",
    description: '30-second idle clip',
  },
  {
    id: "intro",
    name: "Intro",
    description: 'Short introduction about you',
  },
  {
    id: "off_topic",
    name: "Off-Topic",
    description: 'Short responses to off-topic questions you do not have answers for or do not understand',
  }
]

export const questions: Question[] = [
  {
    id: "A1_1_1",
    question: "Who are you and what do you do?",
    set: sets[1],
    topics: [topics[0]],
    video: "",
    transcript: "",
    recordedAt: "",
    status: Status.INCOMPLETE,
  },
  {
    id: "A2_1_1",
    question: "How old are you now?",
    set: sets[1],
    topics: [topics[0]],
    video: "",
    transcript: "",
    recordedAt: "",
    status: Status.INCOMPLETE,
  },
  {
    id: "A3_1_1",
    question: "Should I get a college degree if I want a job in STEM?",
    set: sets[2],
    topics: [topics[1]],
    video: "",
    transcript: "",
    recordedAt: "",
    status: Status.INCOMPLETE,
  },
  {
    id: "A4_1_1",
    question: "Please look at the camera for 30 seconds without speaking. Try to remain in the same position.",
    set: sets[0],
    topics: [topics[2]],
    video: "",
    transcript: "",
    recordedAt: "",
    status: Status.INCOMPLETE
  },
  {
    id: "A5_1_1",
    question: "Please give a short introduction of yourself, which includes your name, current job, and title.",
    set: sets[0],
    topics: [topics[3]],
    video: "",
    transcript: "",
    recordedAt: "",
    status: Status.INCOMPLETE
  },
  {
    id: "A6_1_1",
    question: "Please repeat the following: 'I couldn't understand the question. Try asking me something else.'",
    set: sets[0],
    topics: [topics[4]],
    video: "",
    transcript: "",
    recordedAt: "",
    status: Status.INCOMPLETE
  },
  {
    id: "A7_1_1",
    question: "What's the hardest decision you've had to make as a leader?",
    set: sets[3],
    topics: [topics[1]],
    video: "",
    transcript: "",
    recordedAt: "",
    status: Status.INCOMPLETE,
  },
]

export const newMentor: Mentor = {
  id: "clintanderson",
  name: "",
  shortName: "",
  title: "",
  isBuilt: false,
  sets: [sets[0], sets[1]],
  questions: [questions[0], questions[1], questions[3], questions[4], questions[5]],
}
