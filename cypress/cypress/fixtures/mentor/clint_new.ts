/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  Mentor,
  MentorType,
  QuestionType,
  Status,
  SubjectTypes,
  UtteranceName,
} from "../../support/types";

export const mentor: Mentor = {
  _id: "clintanderson",
  name: "Clint Anderson",
  firstName: "",
  title: "The Original Clint",
  mentorType: MentorType.VIDEO,
  lastTrainedAt: null,
  email: "",
  thumbnail: "",
  isDirty: false,
  questions: [
    {
      question: {
        _id: "A6_1_1",
        clientId: "C6_1_1",
        question: "Complete",
        type: QuestionType.QUESTION,
        name: null,
        paraphrases: [],
      },
      topics: [],
      category: null,
    },
  ],
  subjects: [
    {
      _id: "background",
      name: "Background",
      type: SubjectTypes.SUBJECT,
      isRequired: true,
      description:
        "These questions will ask general questions about your background that might be relevant to how people understand your career.",
      categories: [
        {
          id: "category1",
          name: "Category1",
          description: "A category",
        },
        {
          id: "category3",
          name: "Category3",
          description: "",
        },
      ],
      topics: [
        {
          id: "back-topic1-id",
          name: "back topic 1",
          description: "",
        },
        {
          id: "back-topic2-id",
          name: "back topic 2",
          description: "",
        },
      ],
      questions: [
        {
          question: {
            _id: "A1_1_1",
            clientId: "C1_1_1",
            question: "Who are you and what do you do?",
            type: QuestionType.QUESTION,
            name: null,
            paraphrases: [],
          },
          topics: [],
          category: {
            id: "category",
            name: "Category",
            description: "A category",
          },
        },
        {
          question: {
            _id: "A2_1_1",
            clientId: "C2_1_1",
            question: "How old are you now?",
            type: QuestionType.QUESTION,
            name: null,
            paraphrases: [],
          },
          topics: [],
        },
      ],
    },
    {
      _id: "idle_and_initial_recordings",
      name: "Idle and Initial Recordings",
      type: SubjectTypes.UTTERANCES,
      isRequired: true,
      description: "These are miscellaneous phrases you'll be asked to repeat.",
      categories: [
        {
          id: "category2",
          name: "Category2",
          description: "Another category",
        },
        {
          id: "category4",
          name: "Category4",
          description: "",
        },
      ],
      topics: [
        {
          id: "repeat-topic1-id",
          name: "repeat topic 1",
          description: "",
        },
        {
          id: "repeat-topic2-id",
          name: "repeat topic 2",
          description: "",
        },
      ],
      questions: [
        {
          question: {
            _id: "A3_1_1",
            clientId: "C3_1_1",
            question:
              "Please look at the camera for 30 seconds without speaking. Try to remain in the same position.",
            type: QuestionType.UTTERANCE,
            name: UtteranceName.IDLE,
            paraphrases: [],
            mentorType: MentorType.VIDEO,
            minVideoLength: 10,
          },
          topics: [],
        },
        {
          question: {
            _id: "A4_1_1",
            clientId: "C4_1_1",
            question:
              "Please give a short introduction of yourself, which includes your name, current job, and title.",
            type: QuestionType.UTTERANCE,
            name: UtteranceName.INTRO,
            paraphrases: [],
          },
          topics: [],
        },
        {
          question: {
            _id: "A5_1_1",
            clientId: "C5_1_1",
            question:
              "Please repeat the following: 'I couldn't understand the question. Try asking me something else.'",
            type: QuestionType.UTTERANCE,
            name: UtteranceName.OFF_TOPIC,
            paraphrases: [],
          },
          topics: [],
          category: {
            id: "category2",
            name: "Category2",
            description: "Another category",
          },
        },
        {
          question: {
            _id: "A8_1_1",
            clientId: "C8_1_1",
            question: "test",
            type: QuestionType.UTTERANCE,
            name: UtteranceName.OFF_TOPIC,
            paraphrases: [],
            mentor: "clintanderson",
          },
          topics: [],
          category: {
            id: "category2",
            name: "Category2",
            description: "Another category",
          },
        },
      ],
    },
  ],
  topics: [],
  answers: [
    {
      _id: "A1_1_1",
      question: {
        _id: "A1_1_1",
        clientId: "C1_1_1",
        question: "Who are you and what do you do?",
        type: QuestionType.QUESTION,
        name: null,
        paraphrases: [],
      },
      transcript: "",
      status: Status.INCOMPLETE,
    },
    {
      _id: "A2_1_1",
      question: {
        _id: "A2_1_1",
        clientId: "C2_1_1",
        question: "How old are you now?",
        type: QuestionType.QUESTION,
        name: null,
        paraphrases: [],
      },
      transcript: "",
      status: Status.INCOMPLETE,
    },
    {
      _id: "A3_1_1",
      question: {
        _id: "A3_1_1",
        clientId: "C3_1_1",
        question:
          "Please look at the camera for 30 seconds without speaking. Try to remain in the same position.",
        type: QuestionType.UTTERANCE,
        name: UtteranceName.IDLE,
        paraphrases: [],
        mentorType: MentorType.VIDEO,
        minVideoLength: 10,
      },
      transcript: "",
      status: Status.INCOMPLETE,
    },
    {
      _id: "A4_1_1",
      question: {
        _id: "A4_1_1",
        clientId: "C4_1_1",
        question:
          "Please give a short introduction of yourself, which includes your name, current job, and title.",
        type: QuestionType.UTTERANCE,
        name: UtteranceName.INTRO,
        paraphrases: [],
      },
      transcript: "",
      status: Status.INCOMPLETE,
    },
    {
      _id: "A5_1_1",
      question: {
        _id: "A5_1_1",
        clientId: "C5_1_1",
        question:
          "Please repeat the following: 'I couldn't understand the question. Try asking me something else.'",
        type: QuestionType.UTTERANCE,
        name: UtteranceName.OFF_TOPIC,
        paraphrases: [],
      },
      transcript: "",
      status: Status.INCOMPLETE,
    },
    {
      _id: "A6_1_1",
      question: {
        _id: "A6_1_1",
        clientId: "C6_1_1",
        question: "Complete answer",
        type: QuestionType.QUESTION,
        name: null,
        paraphrases: [],
      },
      transcript: "Complete answer",
      status: Status.COMPLETE,
    },
  ],
};
export default mentor;
