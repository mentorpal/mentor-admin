import { Mentor, QuestionType, Status } from "../../support/types";
import clint_prev from "./clint_setupa";

export const mentor: Partial<Mentor> = {
  ...clint_prev,
  subjects: [
    ...clint_prev.subjects,
    {
      _id: "background",
      name: "Background",
      description:
        "These questions will ask general questions about your background that might be relevant to how people understand your career.",
      isRequired: true,
      categories: [],
      topics: [],
      questions: [
        {
          question: {
            _id: "A1_1_1",
            question: "Who are you and what do you do?",
            type: QuestionType.QUESTION,
            name: null,
            paraphrases: [],  
          },
          topics: []
        },
        {
          question: {
            _id: "A2_1_1",
            question: "How old are you now?",
            type: QuestionType.QUESTION,
            name: null,
            paraphrases: [],  
          },
          topics: []
        }
      ]
    }
  ],
  answers: [
    ...clint_prev.answers,
    {
      _id: "A1_1_1",
      question: {
        _id: "A1_1_1",
        question: "Who are you and what do you do?",
        type: QuestionType.QUESTION,
        name: null,
        paraphrases: [],
      },
      transcript: "",
      recordedAt: "",
      status: Status.INCOMPLETE,
    },
    {
      _id: "A2_1_1",
      question: {
        _id: "A2_1_1",
        question: "How old are you now?",
        type: QuestionType.QUESTION,
        name: null,
        paraphrases: [],
      },
      transcript: "",
      recordedAt: "",
      status: Status.INCOMPLETE,
    },
  ],
};
export default mentor;