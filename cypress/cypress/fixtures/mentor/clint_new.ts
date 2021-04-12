import { Mentor, MentorType, QuestionType, Status, UtteranceName } from "../../support/types";

export const mentor: Partial<Mentor> = {
  _id: "clintanderson",
  name: "",
  firstName: "",
  title: "",
  mentorType: MentorType.VIDEO,
  lastTrainedAt: null,
  subjects: [
    {
      _id: "background",
      name: "Background",
      description: "These questions will ask general questions about your background that might be relevant to how people understand your career.",
      isRequired: true,
      categories: [],
      topics: [],
      questions: [
        {
          question: {
            _id: "A1_1_1",
            question: "Who are you and what do you do?",
            type: QuestionType.QUESTION,
            name: null,
            paraphrases: [],  
          },
          topics: []
        },
        {
          question: {
            _id: "A2_1_1",
            question: "How old are you now?",
            type: QuestionType.QUESTION,
            name: null,
            paraphrases: [],  
          },
          topics: []
        }
      ]
    },
    {
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
          topics: []
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
          topics: []
        }
      ]
    },
  ],
  topics: [],
  answers: [
    {
      _id: "A1_1_1",
      question: {
        _id: "A1_1_1",
        question: "Who are you and what do you do?",
        type: QuestionType.QUESTION,
        name: null,
        paraphrases: [],
      },
      transcript: "",
      recordedAt: "",
      status: Status.INCOMPLETE,
    },
    {
      _id: "A2_1_1",
      question: {
        _id: "A2_1_1",
        question: "How old are you now?",
        type: QuestionType.QUESTION,
        name: null,
        paraphrases: [],
      },
      transcript: "",
      recordedAt: "",
      status: Status.INCOMPLETE,
    },
    {
      _id: "A3_1_1",
      question: {
        _id: "A3_1_1",
        question:
          "Please look at the camera for 30 seconds without speaking. Try to remain in the same position.",
        type: QuestionType.UTTERANCE,
        name: UtteranceName.IDLE,
        paraphrases: [],
      },
      transcript: "",
      recordedAt: "",
      status: Status.INCOMPLETE,
    },
    {
      _id: "A4_1_1",
      question: {
        _id: "A4_1_1",
        question:
          "Please give a short introduction of yourself, which includes your name, current job, and title.",
        type: QuestionType.UTTERANCE,
        name: UtteranceName.INTRO,
        paraphrases: [],
      },
      transcript: "",
      recordedAt: "",
      status: Status.INCOMPLETE,
    },
    {
      _id: "A5_1_1",
      question: {
        _id: "A5_1_1",
        question:
          "Please repeat the following: 'I couldn't understand the question. Try asking me something else.'",
        type: QuestionType.UTTERANCE,
        name: UtteranceName.OFF_TOPIC,
        paraphrases: [],
      },
      transcript: "",
      recordedAt: "",
      status: Status.INCOMPLETE,
    },
  ],
};
export default mentor;