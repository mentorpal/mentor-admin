import { Mentor, Status } from "../../support/types";
import clint_prev from "./clint_setupb";

export const mentor: Mentor = {
  ...clint_prev,
  subjects: [
    ...clint_prev.subjects,
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
    }
  ],
  answers: [
    ...clint_prev.answers,
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