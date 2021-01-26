import { QuestionSet, Status } from "../../support/types";

export const questionSet: QuestionSet = {
  subject: {
    _id: "leadership",
    name: "Leadership",
    description: "These questions will ask about being in a leadership role.",
  },
  questions: [
    {
      id: "A7_1_1",
      question: "What's the hardest decision you've had to make as a leader?",
      subject: {
        _id: "leadership",
        name: "Leadership",
        description: "These questions will ask about being in a leadership role.",
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
export default questionSet;