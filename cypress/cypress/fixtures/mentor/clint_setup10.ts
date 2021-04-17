import { Mentor, QuestionType, Status } from "../../support/types";
import clint_prev from "./clint_setup9";

export const mentor: Mentor = {
  ...clint_prev,
  subjects: [
    ...clint_prev.subjects,
    {
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
      _id: "A7_1_1",
      question: {
        _id: "A7_1_1",
        question: "What's the hardest decision you've had to make as a leader?",
        type: QuestionType.QUESTION,
        name: null,
        paraphrases: [],
      },
      transcript: "",
      recordedAt: "",
      status: Status.INCOMPLETE,
    }
  ]
}
export default mentor;
