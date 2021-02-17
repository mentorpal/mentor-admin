import { Mentor, Status } from "../../support/types";
import clint_prev from "./clint_setupa";

export const mentor: Mentor = {
  ...clint_prev,
  subjects: [
    ...clint_prev.subjects,
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
          name: null
        },
        {
          _id: "A2_1_1",
          question: "How old are you now?",  
          name: null
        }
      ]
    }
  ],
  answers: [
    ...clint_prev.answers,
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
  ],
};
export default mentor;