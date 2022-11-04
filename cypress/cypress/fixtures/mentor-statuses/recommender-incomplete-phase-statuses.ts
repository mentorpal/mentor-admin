/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  Answer,
  Mentor,
  QuestionType,
  Status,
  SubjectTypes,
} from "../../support/types";
import { hasThumbnail } from "./recommender-any-phase-statuses";

export const hasSubjectQuestionsOver5: Mentor = {
  ...hasThumbnail,
  subjects: [
    ...hasThumbnail.subjects,
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
  ],
  answers: [
    ...hasThumbnail.answers,
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
      transcript:
        "My name is Clint Anderson and I'm a Nuclear Electrician's Mate",
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
      transcript: "I'm 37 years old",
      status: Status.INCOMPLETE,
    },
  ],
};

export const needsBuilding: Mentor = {
  ...hasSubjectQuestionsOver5,
  answers: hasSubjectQuestionsOver5.answers.map((a) => {
    const aCopy: Answer = JSON.parse(JSON.stringify(a));
    aCopy.status = Status.COMPLETE;
    return aCopy;
  }),
  lastTrainedAt: "",
};

export const builtMentor: Mentor = {
  ...needsBuilding,
  lastTrainedAt: "123456",
};
