import { Subject } from "../../support/types";

export const subject: Partial<Subject> = {
  _id: "background",
  name: "Background",
  description: "These questions will ask general questions about your background that might be relevant to how people understand your career.",
  isRequired: true,
  categories: [],
  topics: [],
  questions: [
    {
      question: {
        _id: "A1_1_1",
        question: "Who are you and what do you do?",
        type: null,
        name: null,
        paraphrases: [],
      },
      topics: [],
    },
    {
      question: {
        _id: "A2_1_1",
        question: "How old are you now?",
        type: null,
        name: null,
        paraphrases: [],
      },
      topics: [],
    }
  ]
}
export default subject;