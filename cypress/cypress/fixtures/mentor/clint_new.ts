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
      _id: "background",
      name: "Background",
      description:
        "These questions will ask general questions about your background that might be relevant to how people understand your career.",
      isRequired: true,
      questions: [
        {
          _id: "A1_1_1",
          question: "Who are you and what do you do?",
          name: null,
        },
        {
          _id: "A2_1_1",
          question: "How old are you now?",
          name: null
        }
      ]
    },
    {
      _id: "repeat_after_me",
      name: "Repeat After Me",
      description: "These are miscellaneous phrases you'll be asked to repeat.",
      isRequired: true,
      questions: [
        {
          _id: "A3_1_1",
          question:
            "Please look at the camera for 30 seconds without speaking. Try to remain in the same position.",
          name: "Idle"
        },
        {
          _id: "A4_1_1",
          question:
            "Please give a short introduction of yourself, which includes your name, current job, and title.",
          name: null
        },
        {
          _id: "A5_1_1",
          question:
            "Please repeat the following: 'I couldn't understand the question. Try asking me something else.'",
          name: null
        }
      ]
    },
  ],
  answers: [
    {
      question: {
        _id: "A1_1_1",
        question: "Who are you and what do you do?",
        name: null
      },
      video: "",
      transcript: "",
      recordedAt: "",
      status: Status.INCOMPLETE,
    },
    {
      question: {
        _id: "A2_1_1",
        question: "How old are you now?",
        name: null
      },
      video: "",
      transcript: "",
      recordedAt: "",
      status: Status.INCOMPLETE,
    },
    {
      question: {
        _id: "A3_1_1",
        question:
          "Please look at the camera for 30 seconds without speaking. Try to remain in the same position.",
        name: "Idle"
      },
      video: "",
      transcript: "",
      recordedAt: "",
      status: Status.INCOMPLETE,
    },
    {
      question: {
        _id: "A4_1_1",
        question:
          "Please give a short introduction of yourself, which includes your name, current job, and title.",
        name: null
      },
      video: "",
      transcript: "",
      recordedAt: "",
      status: Status.INCOMPLETE,
    },
    {
      question: {
        _id: "A5_1_1",
        question:
          "Please repeat the following: 'I couldn't understand the question. Try asking me something else.'",
        name: null
      },
      video: "",
      transcript: "",
      recordedAt: "",
      status: Status.INCOMPLETE,
    },
  ],
};
export default mentor;