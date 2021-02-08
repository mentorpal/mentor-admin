import { QuestionType, Subject, UtteranceName } from "../../support/types";

export const subject: Subject = {
  _id: "repeat_after_me",
  name: "Repeat After Me",
  description: "These are miscellaneous phrases you'll be asked to repeat.",
  isRequired: true,
  questions: [
    {
      _id: "A3_1_1",
      question:
        "Please look at the camera for 30 seconds without speaking. Try to remain in the same position.",
      type: QuestionType.UTTERANCE,
      name: UtteranceName.IDLE
    },
    {
      _id: "A4_1_1",
      question:
        "Please give a short introduction of yourself, which includes your name, current job, and title.",
      type: QuestionType.UTTERANCE,
      name: UtteranceName.INTRO
    },
    {
      _id: "A5_1_1",
      question:
        "Please repeat the following: 'I couldn't understand the question. Try asking me something else.'",
      type: QuestionType.UTTERANCE,
      name: UtteranceName.OFF_TOPIC
    }
  ]
}
export default subject;