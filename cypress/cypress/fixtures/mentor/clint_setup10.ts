import { Status } from "../../support/types";
import clint_prev from "./clint_setup9";

export const mentor = {
  ...clint_prev,
  subjects: [
    ...clint_prev.subjects,
    {
      _id: "leadership",
      name: "Leadership",
      description: "These questions will ask about being in a leadership role.",
    }
  ],
  answers: [
    ...clint_prev.answers,
    {
      question: {
        _id: "A7_1_1",
        text: "What's the hardest decision you've had to make as a leader?",
        subject: {
          _id: "leadership",
          name: "Leadership",
          description: "These questions will ask about being in a leadership role.",
        },
      },
      video: "",
      transcript: "",
      recordedAt: "",
      status: Status.INCOMPLETE,
    }
  ]
}
export default mentor;
