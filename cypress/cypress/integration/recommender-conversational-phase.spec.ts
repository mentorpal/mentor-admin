/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { cyMockDefault, cySetup, mockGQL } from "../support/functions";
import { feedback as trendingUserQuestions } from "../fixtures/feedback/trendingFeedback";
import { answered200Questions } from "../fixtures/mentor-statuses/recommender-specialist-phase-statuses";
import {
  answered400Questions,
  builtMentor,
  hasSubjectQuestionsOver400,
} from "../fixtures/mentor-statuses/recommender-conversational-status";

describe("Recommender Conversational Phase (150 <= answers < 250)", () => {
  it("Build Mentor (high precedence): mentor is dirty", () => {
    const [mentor, newQuestionSet] = answered200Questions();
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: mentor,
      questions: newQuestionSet,
    });
    cy.visit("/");
    cy.get("[data-cy=recommended-action-reason]").contains(
      "You've answered new questions since you last trained your mentor. Rebuild so you can preview."
    );
  });

  it("Add a subject: ran out of subject questions to answer", () => {
    const [mentor, newQuestionSet] = builtMentor();
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: mentor,
      questions: newQuestionSet,
    });
    cy.visit("/");
    cy.get("[data-cy=recommended-action-reason]").contains(
      "Your mentor doesn't have any subject areas. Subjects give you sets of questions to record."
    );
  });

  it("Record more answers: has unanswered subject questions", () => {
    const [mentor, newQuestionSet] = hasSubjectQuestionsOver400();
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: mentor,
      questions: newQuestionSet,
    });
    cy.visit("/");
    cy.get("[data-cy=recommended-action-reason]").contains(
      "Record more questions to further improve your mentor."
    );
  });

  it("Answer Trending Questions: At least 5 trending questions exist", () => {
    const [mentor, newQuestionSet] = hasSubjectQuestionsOver400();
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: mentor,
      questions: newQuestionSet,
      gqlQueries: [mockGQL("TrendingUserQuestions", trendingUserQuestions)],
    });
    cy.visit("/");
    cy.get("[data-cy=setup-no]").click();
    cy.get("[data-cy=skip-action-button]").click();
    cy.get("[data-cy=recommended-action-reason]").contains(
      "Users have asked questions that your mentor was unable to confidently answer."
    );
  });

  it("Preview Mentor: Has not previewed mentor since last build", () => {
    const [mentor, newQuestionSet] = hasSubjectQuestionsOver400();
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: { ...mentor, lastPreviewedAt: "" },
      questions: newQuestionSet,
    });
    cy.visit("/");
    cy.get("[data-cy=setup-no]").click();
    cy.get("[data-cy=skip-action-button]").click();
    cy.get("[data-cy=recommended-action-reason]").contains(
      "Preview your mentor to review its current status."
    );
  });

  it("Moves on to Full Subject phase once reaching over 250 answers", () => {
    const [mentor, newQuestionSet] = answered400Questions();
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: mentor,
      questions: newQuestionSet,
    });
    cy.visit("/");
    cy.get("[data-cy=mentor-card-scope]").should(
      "contain.text",
      "Full-Subject"
    );
  });
});
