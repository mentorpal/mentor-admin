import { Connection, QuestionType, Subject, UtteranceName } from "../support/types";

export const subjects: Connection<Subject> = {
  edges: [
    {
      cursor: "",
      node: {
        _id: "background",
        name: "Background",
        description: "These questions will ask general questions about your background that might be relevant to how people understand your career.",
        isRequired: true,
        questions: [
          {
            _id: "A1_1_1",
            question: "Who are you and what do you do?",
            type: null,
            name: null,
          },
          {
            _id: "A2_1_1",
            question: "How old are you now?",
            type: null,
            name: null,
          }
        ]
      }
    },
    {
      cursor: "",
      node: {
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
    },
    {
      cursor: "",
      node: {
        _id: "stem",
        name: "STEM",
        description: "These questions will ask about STEM careers.",
        isRequired: false,
        questions: [
          {
            _id: "A6_1_1",
            question: "What does STEM mean?",
            type: null,
            name: null,
          }
        ]
      }
    },
    {
      cursor: "",
      node: {
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