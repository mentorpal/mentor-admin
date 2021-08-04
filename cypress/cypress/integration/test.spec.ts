/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import allSubjects from "../fixtures/subjects/all-subjects";
import { mockGQL, cyMockDefault, cySetup } from "../support/functions";
import { QuestionType, Status } from "../support/types";

const mentor = {
  _id: "clintanderson",
  name: "Clint",
  firstName: "Clint",
  title: "Clint",
  subjects: [
    // {
    //   _id: "background",
    //   name: "Background",
    //   description:
    //     "These questions will ask general questions about your background that might be relevant to how people understand your career.",
    //   questions: [
    //     {
    //       question: {
    //         _id: "A1_1_1",
    //         question: "Who are you and what do you do?",
    //         type: QuestionType.QUESTION,
    //         name: null,
    //         paraphrases: [],
    //       },
    //       topics: [],
    //       category: { id: "category" },
    //     },
    //   ],
    //   categories: [],
    //   topics: [],
    // },
    {
      _id: "repeat_after_me",
      name: "Repeat After Me",
      description: "These are miscellaneous phrases you'll be asked to repeat.",
      questions: [
        {
          question: {
            _id: "A2_1_1",
            question: "How old are you now?",
            type: QuestionType.QUESTION,
            name: null,
            paraphrases: [],
          },
          topics: [],
        },
      ],
      categories: [],
      topics: [],
    },
  ],
  questions: [],
  answers: [
    // {
    //   _id: "A1_1_1",
    //   question: {
    //     _id: "A1_1_1",
    //     question: "Who are you and what do you do?",
    //     type: QuestionType.QUESTION,
    //     name: null,
    //     paraphrases: [],
    //   },
    //   transcript: "",
    //   status: Status.INCOMPLETE,
    // },
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
      status: Status.INCOMPLETE,
    },
  ],
};

const mentor2 = {
  _id: "clintanderson",
  name: "Clint",
  firstName: "Clint",
  title: "Clint",
  subjects: [
    {
      _id: "background",
      name: "Background",
      description:
        "These questions will ask general questions about your background that might be relevant to how people understand your career.",
      questions: [
        {
          question: {
            _id: "A1_1_1",
            question: "Who are you and what do you do?",
            type: QuestionType.QUESTION,
            name: null,
            paraphrases: [],
          },
          topics: [],
          category: { id: "category" },
        },
      ],
      categories: [],
      topics: [],
    },
    {
      _id: "repeat_after_me",
      name: "Repeat After Me",
      description: "These are miscellaneous phrases you'll be asked to repeat.",
      questions: [
        {
          question: {
            _id: "A2_1_1",
            question: "How old are you now?",
            type: QuestionType.QUESTION,
            name: null,
            paraphrases: [],
          },
          topics: [],
        },
      ],
      categories: [],
      topics: [],
    },
  ],
  questions: [],
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
      status: Status.INCOMPLETE,
    },
  ],
};

describe.only("Test broken redux", () => {
  it("can change and save subjects", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: [mentor, mentor, mentor2],
      subjects: [allSubjects],
      gqlQueries: [
        mockGQL("UpdateMentorSubjects", { me: { updateMentorSubjects: true } }),
      ],
    });
    cy.visit("/");
  });
});
