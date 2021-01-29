import { Status } from "../../support/types";
import clint_prev from "./clint_setupa";

export const mentor = {
  ...clint_prev,
  subjects: [
    ...clint_prev.subjects,
    {
      _id: "background",
      name: "Background",
      description:
        "These questions will ask general questions about your background that might be relevant to how people understand your career.",
      isRequired: true,
    }
  ],
  answers: [
    ...clint_prev.answers,
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
  ],
};
export default mentor;