import { Subject } from "../../support/types";

export const subject: Subject = {
  _id: "background",
  name: "Background",
  description: "These questions will ask general questions about your background that might be relevant to how people understand your career.",
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
      name: null,
    }
  ]
}
export default subject;