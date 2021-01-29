import { Status } from "../../support/types";

export const mentor = {
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
  answers: [
    {
      question: {
        _id: "A1_1_1",
        text: "Who are you and what do you do?",
        subject: {
          _id: "background",
          name: "Background",
          description:
            "These questions will ask general questions about your background that might be relevant to how people understand your career.",
        },
      },
      video: "",
      transcript: "",
      recordedAt: "",
      status: Status.INCOMPLETE,
    },
    {
      question: {
        _id: "A2_1_1",
        text: "How old are you now?",
        subject: {
          _id: "background",
          name: "Background",
          description:
            "These questions will ask general questions about your background that might be relevant to how people understand your career.",
        },
      },
      video: "",
      transcript: "",
      recordedAt: "",
      status: Status.INCOMPLETE,
    },
    {
      question: {
        _id: "A3_1_1",
        text:
          "Please look at the camera for 30 seconds without speaking. Try to remain in the same position.",
        subject: {
          _id: "repeat_after_me",
          name: "Repeat After Me",
          description:
            "These are miscellaneous phrases you'll be asked to repeat.",
        },
      },
      video: "",
      transcript: "",
      recordedAt: "",
      status: Status.INCOMPLETE,
    },
    {
      question: {
        _id: "A4_1_1",
        text:
          "Please give a short introduction of yourself, which includes your name, current job, and title.",
        subject: {
          _id: "repeat_after_me",
          name: "Repeat After Me",
          description:
            "These are miscellaneous phrases you'll be asked to repeat.",
        },
      },
      video: "",
      transcript: "",
      recordedAt: "",
      status: Status.INCOMPLETE,
    },
    {
      question: {
        _id: "A5_1_1",
        text:
          "Please repeat the following: 'I couldn't understand the question. Try asking me something else.'",
        subject: {
          _id: "repeat_after_me",
          name: "Repeat After Me",
          description:
            "These are miscellaneous phrases you'll be asked to repeat.",
        },
      },
      video: "",
      transcript: "",
      recordedAt: "",
      status: Status.INCOMPLETE,
    },
  ],
};
export default mentor;