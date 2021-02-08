import { Mentor, Status } from "../../support/types";
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
      questions: [
        {
          _id: "A7_1_1",
          question: "What's the hardest decision you've had to make as a leader?",  
          type: null,
          name: null,
        }
      ]
    }
  ],
  answers: [
    ...clint_prev.answers,
    {
      question: {
        _id: "A7_1_1",
        question: "What's the hardest decision you've had to make as a leader?",
        type: null,
        name: null,
    },
      video: "",
      transcript: "",
      recordedAt: "",
      status: Status.INCOMPLETE,
    }
  ]
}
export default mentor;
