/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { cyMockDefault, mockGQL, cySetup } from "../support/functions";
import { feedback as userQuestions } from "../fixtures/feedback/feedback";
import mentor from "../fixtures/mentor/clint_new";

describe("Mentor Record Queue", () => {
  describe("Feedback Page", () => {
    it.only("dropdown un-recorded questions are greyed out", () => {
      cySetup(cy);
      cyMockDefault(cy, {
        mentor,
        gqlQueries: [
          mockGQL("UserQuestions", userQuestions),
          mockGQL("ImportTask", { importTask: null }),
          mockGQL("FetchMentorRecordQueue", {
            me: {
              mentorRecordQueue: [],
            },
          }),
        ],
      });
      cy.visit("/feedback");
      cy.get("[data-cy=select-answer]").click();
      cy.get("[data-cy=Drop-down-qu-A6_1_1]").should("be.visible");
      cy.get("[data-cy=Drop-down-qu-A6_1_1]").should(
        "have.css",
        "color",
        "rgb(0, 0, 0)"
      );
      cy.get("[data-cy=Drop-down-qu-A5_1_1]").should("be.visible");
      cy.get("[data-cy=Drop-down-qu-A5_1_1]").should(
        "have.css",
        "color",
        "rgb(128, 128, 128)"
      );
    });
    it("Modal shows correct data", () => {
      cySetup(cy);
      cyMockDefault(cy, {
        mentor,
        gqlQueries: [
          mockGQL("UserQuestions", userQuestions),
          mockGQL("ImportTask", { importTask: null }),
          mockGQL("FetchMentorRecordQueue", {
            me: {
              mentorRecordQueue: [],
            },
          }),
          mockGQL("SubjectAddOrUpdateQuestions", {
            me: { subjectAddOrUpdateQuestions: {} },
          }),
          mockGQL("AddQuestionToRecordQueue", {
            me: {
              addQuestionToRecordQueue: [],
            },
          }),
          mockGQL("RemoveQuestionFromRecordQueue", {
            me: {
              removeQuestionFromRecordQueue: [],
            },
          }),
        ],
      });
      cy.visit("/feedback");
      cy.get("[data-cy=queue-btn]").click();
      cy.get("[data-cy=create-question-modal]").should("be.visible");

      cy.get("[data-cy=subject-drop-down]").click();
      cy.get("[data-cy=Subject-option-background]").should("be.visible");
      cy.get("[data-cy=Subject-option-repeat_after_me]").should("be.visible");
      cy.get("[data-cy=Subject-option-background]").click();

      cy.get("[data-cy=category-drop-down]").click();
      cy.get("[data-cy=Category-option-category1]").should("be.visible");
      cy.get("[data-cy=Category-option-category3]").should("be.visible");
      cy.get("[data-cy=Category-option-category1]").click();

      cy.get("[data-cy=topic-selector]").click();
      cy.get("[data-cy=Topic-option-back-topic1-id]").should("be.visible");
      cy.get("[data-cy=Topic-option-back-topic2-id]").should("be.visible");
    });
    it("Modal creates new question", () => {
      cySetup(cy);
      cyMockDefault(cy, {
        mentor,
        gqlQueries: [
          mockGQL("UserQuestions", userQuestions),
          mockGQL("ImportTask", { importTask: null }),
          mockGQL("FetchMentorRecordQueue", {
            me: {
              mentorRecordQueue: [],
            },
          }),
          mockGQL("SubjectAddOrUpdateQuestions", {
            me: { subjectAddOrUpdateQuestions: {} },
          }),
          mockGQL("AddQuestionToRecordQueue", {
            me: {
              addQuestionToRecordQueue: [],
            },
          }),
          mockGQL("RemoveQuestionFromRecordQueue", {
            me: {
              removeQuestionFromRecordQueue: [],
            },
          }),
          mockGQL("UserQuestionSetAnswer", {}),
        ],
      });
      cy.visit("/feedback");
      cy.get("[data-cy=queue-btn]").click();
      cy.get("[data-cy=subject-drop-down]").click();
      cy.get("[data-cy=Subject-option-background]").click();
      cy.get("[data-cy=category-drop-down]").click();
      cy.get("[data-cy=Category-option-category1]").click();
      cy.get("[data-cy=topic-selector]").click();
      cy.get("[data-cy=Topic-option-back-topic2-id]").click();
      cy.get("[data-cy=modal-OK-btn]").click();
    });
  });
});
