import { QuestionSet, Status } from "../../support/types";

export const subject: QuestionSet = {
  subject: {
    _id: "stem",
    name: "STEM",
    description: "These questions will ask about STEM careers.",
  },
  questions: [
    {
      id: "A3_1_1",
      question: "Should I get a college degree if I want a job in STEM?",
      subject: {
        _id: "stem",
        name: "STEM",
        description: "These questions will ask about STEM careers.",    
      },
      topics: [
        {
          _id: "advice",
          name: "Advice",
          description: "These questions will ask you to give some general advice to newcomers interested in entering into your field",
        }
      ],
      video: "",
      transcript: "",
      recordedAt: "",
      status: Status.INCOMPLETE,
      },
  ]
}
export default subject;