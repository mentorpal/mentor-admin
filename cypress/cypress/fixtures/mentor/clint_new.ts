import { Mentor, Status } from "../../support/types";

export const mentor: Mentor = {
  _id: "clintanderson",
  name: "",
  firstName: "",
  title: "",
  isBuilt: false,
  lastTrainedAt: "",
  subjects: [
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
  ],
  questions: [
    {
      id: "A1_1_1",
      question: "Who are you and what do you do?",
      subject: {
        _id: "background",
        name: "Background",
        description:
          "These questions will ask general questions about your background that might be relevant to how people understand your career.",
      },
      topics: [
        {
          _id: "background",
          name: "Background",
          description:
            "These questions will ask general questions about your background, that might be relevant to how people understand your career",
        },
      ],
      video: "",
      transcript: "",
      recordedAt: "",
      status: Status.INCOMPLETE,
    },
    {
      id: "A2_1_1",
      question: "How old are you now?",
      subject: {
        _id: "background",
        name: "Background",
        description:
          "These questions will ask general questions about your background that might be relevant to how people understand your career.",
      },
      topics: [
        {
          _id: "background",
          name: "Background",
          description:
            "These questions will ask general questions about your background, that might be relevant to how people understand your career",
        },
      ],
      video: "",
      transcript: "",
      recordedAt: "",
      status: Status.INCOMPLETE,
    },
    {
      id: "A3_1_1",
      question:
        "Please look at the camera for 30 seconds without speaking. Try to remain in the same position.",
      subject: {
        _id: "repeat_after_me",
        name: "Repeat After Me",
        description:
          "These are miscellaneous phrases you'll be asked to repeat.",
      },
      topics: [
        {
          _id: "idle",
          name: "Idle",
          description: "30-second idle clip",
        },
      ],
      video: "",
      transcript: "",
      recordedAt: "",
      status: Status.INCOMPLETE,
    },
    {
      id: "A4_1_1",
      question:
        "Please give a short introduction of yourself, which includes your name, current job, and title.",
      subject: {
        _id: "repeat_after_me",
        name: "Repeat After Me",
        description:
          "These are miscellaneous phrases you'll be asked to repeat.",
      },
      topics: [
        {
          _id: "intro",
          name: "Intro",
          description: "Short introduction about you",
        },
      ],
      video: "",
      transcript: "",
      recordedAt: "",
      status: Status.INCOMPLETE,
    },
    {
      id: "A5_1_1",
      question:
        "Please repeat the following: 'I couldn't understand the question. Try asking me something else.'",
      subject: {
        _id: "repeat_after_me",
        name: "Repeat After Me",
        description:
          "These are miscellaneous phrases you'll be asked to repeat.",
      },
      topics: [
        {
          _id: "off_topic",
          name: "Off-Topic",
          description:
            "Short responses to off-topic questions you do not have answers for or do not understand",
        },
      ],
      video: "",
      transcript: "",
      recordedAt: "",
      status: Status.INCOMPLETE,
    },
  ],
};
export default mentor;