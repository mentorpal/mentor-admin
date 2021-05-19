import { Connection, QuestionType, Subject, UtteranceName } from "../../support/types";

export const subjects: Connection<Subject> = {
  edges: [
    {
      cursor: "",
      node: {
        _id: "repeat_after_me",
        name: "Repeat After Me",
        description: "These are miscellaneous phrases you'll be asked to repeat.",
        isRequired: true,
        categories: [],
        topics: [],
        questions: [
          {
            question: {
              _id: "A3_1_1",
              question:
                "Please look at the camera for 30 seconds without speaking. Try to remain in the same position.",
              type: QuestionType.UTTERANCE,
              name: UtteranceName.IDLE,
              paraphrases: [],
            },
            topics: [],
          },
          {
            question: {
              _id: "A4_1_1",
              question:
                "Please give a short introduction of yourself, which includes your name, current job, and title.",
              type: QuestionType.UTTERANCE,
              name: UtteranceName.INTRO,
              paraphrases: [],
            },
            topics: []
          },
          {
            question: {
              _id: "A5_1_1",
              question:
                "Please repeat the following: 'I couldn't understand the question. Try asking me something else.'",
              type: QuestionType.UTTERANCE,
              name: UtteranceName.OFF_TOPIC,
              paraphrases: [],
            },
            topics: [],
          }
        ]
      }
    }
  ],
  pageInfo: {
    startCursor: null,
    endCursor: null,
    hasNextPage: false,
    hasPreviousPage: false,
  }
}
export default subjects;