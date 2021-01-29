import { Status } from "../../support/types";
import clint_prev from "./clint_setupb";

export const mentor = {
  ...clint_prev,
  subjects: [
    ...clint_prev.subjects,
    {
      _id: "repeat_after_me",
      name: "Repeat After Me",
      description: "These are miscellaneous phrases you'll be asked to repeat.",
      isRequired: true,
    }
  ],
  answers: [
    ...clint_prev.answers,
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