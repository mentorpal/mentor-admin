/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { cySetup, cyMockDefault, mockGQL } from "../support/functions";
import { feedback as userQuestions } from "../fixtures/feedback/feedback";
import { feedback as trendingUserQuestions } from "../fixtures/feedback/trendingFeedback";

describe("Feedback", () => {
  it.only("testing", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      gqlQueries: [
        mockGQL("UserQuestions", userQuestions),
        mockGQL("TrendingUserQuestions", trendingUserQuestions),
        mockGQL("UserQuestionSetAnswer", {}),
      ],
    });
    cy.visit("/feedback");
  });

  it("Selecting an answer puts it under selection box", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      gqlQueries: [
        mockGQL("UserQuestions", userQuestions),
        mockGQL("UserQuestionSetAnswer", {}),
      ],
    });
    cy.visit("/feedback");
    cy.get("[data-cy=row-628d11b08dbec2a7fa50bc79]").within(() => {
      cy.get("[data-cy=graderAnswer]").within(() => {
        cy.get("[data-cy=select-answer]")
          .get("input")
          .type("Complete Question?")
          .type("{downarrow}{enter}");
        cy.get("[data-cy=grader-answer-question-text]").should(
          "contain.text",
          "Complete Question?"
        );
      });
    });
  });

  it("Can clear selected answer via X button", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      gqlQueries: [
        mockGQL("UserQuestions", userQuestions),
        mockGQL("UserQuestionSetAnswer", {}),
      ],
    });
    cy.visit("/feedback");
    cy.get("[data-cy=row-6286c9ae60719ae10dfd70b8]").within(() => {
      cy.get("[data-cy=grader-answer-question-text]").should(
        "contain.text",
        "Who are you and what do you do?"
      );
      cy.get("[data-cy=clear-answer-button]").click();
      cy.get("[data-cy=grader-answer-question-text]").should("have.text", "");
    });
  });
});
