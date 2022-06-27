/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  cyMockDefault,
  mockGQL,
  cyMockFollowUpQuestions,
} from "../support/functions";
import { Mentor, MentorType, Status, QuestionType } from "../support/types";
import {
  completeMentor,
  completeQuestion,
  completeSubject,
  completeSubjectQuestion,
} from "../support/helpers";

const chatMentor: Mentor = completeMentor({
  _id: "clintanderson",
  mentorType: MentorType.CHAT,
  lastTrainedAt: null,
  subjects: [
    completeSubject({
      _id: "background",
      name: "background",
      categories: [{ id: "cat", name: "cat", description: "cat" }],
      questions: [
        completeSubjectQuestion({
          question: {
            _id: "A1_1_1",
            clientId: "C1_1_1",
            question: "Question 1",
            name: null,
            type: QuestionType.QUESTION,
            paraphrases: [],
          },
          category: { id: "cat", name: "cat", description: "cat" },
          topics: [],
        }),
        completeSubjectQuestion({
          question: completeQuestion({
            _id: "A2_1_1",
          }),
          // mentor: "clintanderson",
        }),
      ],
    }),
    completeSubject({
      _id: "idle_and_initial_recordings",
      questions: [
        completeSubjectQuestion({
          question: completeQuestion({
            _id: "A3_1_1",
          }),
        }),
        completeSubjectQuestion({
          question: completeQuestion({
            _id: "A4_1_1",
          }),
        }),
        completeSubjectQuestion({
          question: completeQuestion({
            _id: "A5_1_1",
          }),
        }),
        completeSubjectQuestion({
          question: completeQuestion({
            _id: "A6_1_1",
          }),
          // mentor: "notclint",
        }),
      ],
    }),
  ],
  answers: [
    {
      _id: "A1_1_1",
      question: completeQuestion({
        _id: "A1_1_1",
      }),
      transcript:
        "My name is Clint Anderson and I'm a Nuclear Electrician's Mate",
      status: Status.COMPLETE,
    },
    {
      _id: "A2_1_1",
      question: completeQuestion({
        _id: "A2_1_1",
      }),
      transcript: "",
      status: Status.INCOMPLETE,
    },
    {
      _id: "A3_1_1",
      question: completeQuestion({
        _id: "A3_1_1",
      }),
      transcript: "",
      status: Status.INCOMPLETE,
    },
    {
      _id: "A4_1_1",
      question: completeQuestion({
        _id: "A4_1_1",
      }),
      transcript:
        "My name is Clint Anderson and I'm a Nuclear Electrician's Mate",
      status: Status.COMPLETE,
    },
    {
      _id: "A5_1_1",
      question: completeQuestion({
        _id: "A5_1_1",
      }),
      transcript: "",
      status: Status.INCOMPLETE,
    },
  ],
});

describe("generating followups", () => {
  it("can navigate to followups page from record", () => {
    cyMockDefault(cy, {
      mentor: [chatMentor],
      gqlQueries: [
        mockGQL("UploadTaskDelete", { me: { uploadTaskDelete: true } }),
        mockGQL("UpdateAnswer", { me: { updateAnswer: true } }),
        mockGQL("UpdateQuestion", { me: { updateQuestion: true } }),
        mockGQL("UpdateMentorSubjects", { me: { updateMentorSubjects: true } }),
        mockGQL("FetchUploadTasks", []),
        mockGQL("Subject", [{ subject: [] }]),
      ],
    });
    cyMockFollowUpQuestions(cy, {
      errors: null,
      data: {
        followups: [
          {
            question: "Can you tell me more about Aaron?",
            entityType: "profession",
          },
          {
            question: "What was Florida like?",
          },
          {
            question: "What does an Intern do?",
          },
          {
            question: "What is foosball?",
          },
          {
            question: "Can you tell me more about Aaron?",
            entityType: "profession",
          },
          {
            question: "What was Florida like?",
          },
          {
            question: "What does an Intern do?",
          },
          {
            question: "What is foosball?",
          },
          {
            question: "Can you tell me more about Aaron?",
            entityType: "profession",
          },
          {
            question: "What was Florida like?",
          },
          {
            question: "What does an Intern do?",
          },
          {
            question: "What is foosball?",
          },
          {
            question: "Can you tell me more about Aaron?",
            entityType: "profession",
          },
          {
            question: "What was Florida like?",
          },
          {
            question: "What does an Intern do?",
          },
          {
            question: "What is foosball?",
          },
        ],
      },
    });
    cy.visit("/record?subject=background&category=cat");
    cy.get("[data-cy=done-btn]").invoke("mouseover").click();
    cy.get("[data-cy=generate-followups-dialog]").should("exist");
  });

  it("can generate followups and display them", () => {
    cyMockDefault(cy, {
      mentor: [chatMentor],
      gqlQueries: [
        mockGQL("UploadTaskDelete", { me: { uploadTaskDelete: true } }),
        mockGQL("UpdateAnswer", { me: { updateAnswer: true } }),
        mockGQL("UpdateQuestion", { me: { updateQuestion: true } }),
        mockGQL("UpdateMentorSubjects", { me: { updateMentorSubjects: true } }),
        mockGQL("FetchUploadTasks", []),
        mockGQL("Subject", [{ subject: [] }]),
      ],
    });
    cyMockFollowUpQuestions(cy, {
      errors: null,
      data: {
        followups: [
          {
            question: "Can you tell me more about Aaron?",
            entityType: "profession",
          },
          {
            question: "What was Florida like?",
          },
          {
            question: "What does an Intern do?",
          },
          {
            question: "What is foosball?",
          },
          {
            question: "Can you tell me more about Aaron?",
            entityType: "profession",
          },
          {
            question: "What was Florida like?",
          },
          {
            question: "What does an Intern do?",
          },
          {
            question: "What is foosball?",
          },
          {
            question: "Can you tell me more about Aaron?",
            entityType: "profession",
          },
          {
            question: "What was Florida like?",
          },
          {
            question: "What does an Intern do?",
          },
          {
            question: "What is foosball?",
          },
          {
            question: "Can you tell me more about Aaron?",
            entityType: "profession",
          },
          {
            question: "What was Florida like?",
          },
          {
            question: "What does an Intern do?",
          },
          {
            question: "What is foosball?",
          },
        ],
      },
    });
    cy.visit("/followups?subject=background&category=cat");
    cy.get("[data-cy=generate-followups-dialog]").should("exist");
    cy.get("[data-cy=generate-followups-button]").invoke("mouseover").click();
    cy.get("[data-cy=follow-up-question-0]").should("be.visible");
    cy.get("[data-cy=follow-up-question-1]").should("be.visible");
    cy.get("[data-cy=follow-up-question-2]").should("be.visible");
  });

  it("when no followups are generated, prompt user to leave page", () => {
    cyMockDefault(cy, {
      mentor: [chatMentor],
      gqlQueries: [
        mockGQL("UploadTaskDelete", { me: { uploadTaskDelete: true } }),
        mockGQL("UpdateAnswer", { me: { updateAnswer: true } }),
        mockGQL("UpdateQuestion", { me: { updateQuestion: true } }),
        mockGQL("UpdateMentorSubjects", { me: { updateMentorSubjects: true } }),
        mockGQL("FetchUploadTasks", []),
        mockGQL("Subject", [{ subject: [] }]),
      ],
    });
    cyMockFollowUpQuestions(cy, {
      errors: null,
      data: {
        followups: [],
      },
    });
    cy.visit("/followups?subject=background&category=cat");
    cy.get("[data-cy=generate-followups-dialog]").should("exist");
    cy.get("[data-cy=generate-followups-button]").invoke("mouseover").click();
    cy.get("[data-cy=no-followups-generated-dialog]").should("be.visible");
  });
});
