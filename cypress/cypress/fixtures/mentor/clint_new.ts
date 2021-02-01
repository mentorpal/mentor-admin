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
        },
        {
          _id: "A2_1_1",
          question: "How old are you now?",  
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
        },
        {
          _id: "A4_1_1",
          question:
            "Please give a short introduction of yourself, which includes your name, current job, and title.",
        },
        {
          _id: "A5_1_1",
          question:
            "Please repeat the following: 'I couldn't understand the question. Try asking me something else.'",
        }
      ]
    },
  ],
  answers: [
    {
      question: {
        _id: "A1_1_1",
        question: "Who are you and what do you do?",
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
      },
      video: "",
      transcript: "",
      recordedAt: "",
      status: Status.INCOMPLETE,
    },
  ],
};
export default mentor;