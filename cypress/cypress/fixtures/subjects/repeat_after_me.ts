/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  QuestionType,
  Subject,
  SubjectTypes,
  UtteranceName,
} from "../../support/types";

export const subject: Partial<Subject> = {
  _id: "idle_and_initial_recordings",
  name: "Idle and Initial Recordings",
  type: SubjectTypes.UTTERANCES,
  description: "These are miscellaneous phrases you'll be asked to repeat.",
  isRequired: true,
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
};
export default subject;
