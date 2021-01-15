import { Mentor, Subject, Topic, Question, Status } from "types";

export const sets: Subject[] = [
  {
    _id: "repeat_after_me",
    name: "Repeat After Me",
    description: "These are miscellaneous phrases you'll be asked to repeat.",
  },
  {
    _id: "background",
    name: "Background",
    description:
      "These questions will ask general questions about your background that might be relevant to how people understand your career.",
  },
  {
    _id: "stem",
    name: "STEM",
    description: "These questions will ask about STEM careers.",
  },
  {
    _id: "leadership",
    name: "Leadership",
    description: "These questions will ask about being in a leadership role.",
  },
];

export const topics: Topic[] = [
  {
    _id: "background",
    name: "Background",
    description:
      "These questions will ask general questions about your background, that might be relevant to how people understand your career",
  },
  {
    _id: "advice",
    name: "Advice",
    description:
      "These questions will ask you to give some general advice to newcomers interested in entering into your field",
  },
  {
    _id: "idle",
    name: "Idle",
    description: "30-second idle clip",
  },
  {
    _id: "intro",
    name: "Intro",
    description: "Short introduction about you",
  },
  {
    _id: "off_topic",
    name: "Off-Topic",
    description:
      "Short responses to off-topic questions you do not have answers for or do not understand",
  },
];

export const questions: Question[] = [
  {
    id: "A1_1_1",
    question: "Who are you and what do you do?",
    subject: sets[1],
    topics: [topics[0]],
    video: "",
    transcript: "",
    recordedAt: "",
    status: Status.INCOMPLETE,
  },
  {
    id: "A2_1_1",
    question: "How old are you now?",
    subject: sets[1],
    topics: [topics[0]],
    video: "",
    transcript: "",
    recordedAt: "",
    status: Status.INCOMPLETE,
  },
  {
    id: "A3_1_1",
    question: "Should I get a college degree if I want a job in STEM?",
    subject: sets[2],
    topics: [topics[1]],
    video: "",
    transcript: "",
    recordedAt: "",
    status: Status.INCOMPLETE,
  },
  {
    id: "A4_1_1",
    question:
      "Please look at the camera for 30 seconds without speaking. Try to remain in the same position.",
    subject: sets[0],
    topics: [topics[2]],
    video: "",
    transcript: "",
    recordedAt: "",
    status: Status.INCOMPLETE,
  },
  {
    id: "A5_1_1",
    question:
      "Please give a short introduction of yourself, which includes your name, current job, and title.",
    subject: sets[0],
    topics: [topics[3]],
    video: "",
    transcript: "",
    recordedAt: "",
    status: Status.INCOMPLETE,
  },
  {
    id: "A6_1_1",
    question:
      "Please repeat the following: 'I couldn't understand the question. Try asking me something else.'",
    subject: sets[0],
    topics: [topics[4]],
    video: "",
    transcript: "",
    recordedAt: "",
    status: Status.INCOMPLETE,
  },
  {
    id: "A7_1_1",
    question: "What's the hardest decision you've had to make as a leader?",
    subject: sets[3],
    topics: [topics[1]],
    video: "",
    transcript: "",
    recordedAt: "",
    status: Status.INCOMPLETE,
  },
];

export const newMentor: Mentor = {
  _id: "clintanderson",
  name: "",
  firstName: "",
  title: "",
  isBuilt: false,
  subjects: [sets[0], sets[1]],
  questions: [
    questions[0],
    questions[1],
    questions[3],
    questions[4],
    questions[5],
  ],
};
