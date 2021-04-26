import { Subject } from "../../support/types";

export const subject: Partial<Subject> = {
  _id: "leadership",
  name: "Leadership",
  description: "These questions will ask about being in a leadership role.",
  isRequired: false,
  categories: [],
  topics: [],
  questions: [
    {
      question: {
        _id: "A7_1_1",
        question: "What's the hardest decision you've had to make as a leader?",
        type: null,
        name: null,
        paraphrases: [],  
      },
      topics: [],
    }
  ]
}
export default subject;