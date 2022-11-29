/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  Connection,
  QuestionType,
  Subject,
  SubjectTypes,
  UtteranceName,
} from "../../support/types";

export const subjects: Connection<Partial<Subject>> = {
  edges: [
    {
      cursor: "",
      node: {
        _id: "background",
        name: "Background",
        type: SubjectTypes.SUBJECT,
        description:
          "These questions will ask general questions about your background that might be relevant to how people understand your career.",
        isRequired: true,
        isArchived: false,
        categories: [],
        topics: [],
        questions: [
          {
            question: {
              _id: "A1_1_1",
              clientId: "C1_1_1",
              question: "Who are you and what do you do?",
              type: null,
              name: null,
              paraphrases: [],
            },
            topics: [],
          },
          {
            question: {
              _id: "A2_1_1",
              clientId: "C2_1_1",
              question: "How old are you now?",
              type: null,
              name: null,
              paraphrases: [],
            },
            topics: [],
          },
        ],
      },
    },
    {
      cursor: "",
      node: {
        _id: "idle_and_initial_recordings",
        name: "Idle and Initial Recordings",
        type: SubjectTypes.UTTERANCES,
        description:
          "These are miscellaneous phrases you'll be asked to repeat.",
        isRequired: true,
        isArchived: false,
        categories: [],
        topics: [],
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
          },
        ],
      },
    },
    {
      cursor: "",
      node: {
        _id: "leadership",
        name: "Leadership",
        type: SubjectTypes.SUBJECT,
        description:
          "These questions will ask about being in a leadership role.",
        isRequired: false,
        isArchived: false,
        categories: [],
        topics: [],
        questions: [
          {
            question: {
              _id: "A7_1_1",
              clientId: "C7_1_1",
              question:
                "What's the hardest decision you've had to make as a leader?",
              type: null,
              name: null,
              paraphrases: [],
            },
            topics: [],
          },
        ],
      },
    },
  ],
  pageInfo: {
    startCursor: null,
    endCursor: null,
    hasNextPage: false,
    hasPreviousPage: false,
  },
};
export default subjects;
