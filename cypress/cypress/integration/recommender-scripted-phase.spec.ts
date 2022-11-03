/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { builtMentor } from "../fixtures/mentor-statuses/recommender-phase-2-statuses";
import {
  answered20Questions,
  hasSubjectQuestionsOver20,
  isBuiltButNotPreviewed,
  isDirtyMentor,
} from "../fixtures/mentor-statuses/recommender-phase-3-statuses";
import { cyMockDefault, cySetup, mockGQL } from "../support/functions";
import { feedback as trendingUserQuestions } from "../fixtures/feedback/trendingFeedback";

describe("Recommender Scripted Phase (5 <= answers < 20)", () => {
  it("Needs a new subject: not enough subject questions to reach target of 20 questions", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: builtMentor,
    });
    cy.visit("/");
    cy.get("[data-cy=recommended-action-reason]").contains(
      "Your mentor doesn't have any subject areas. Subjects give you sets of questions to record."
    );
  });

  it("Needs more answers: need 20 answers to reach target.", () => {
    const [mentor, newQuestionSet] = hasSubjectQuestionsOver20();
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

  it("Build Mentor: mentor is dirty", () => {
    const [mentor, newQuestionSet] = isDirtyMentor();
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: mentor,
      questions: newQuestionSet,
    });
    cy.visit("/");
    cy.get("[data-cy=setup-no]").click();
    cy.get("[data-cy=skip-action-button]").click();
    cy.get("[data-cy=recommended-action-reason]").contains(
      "You've answered new questions since you last trained your mentor. Rebuild so you can preview."
    );
  });

  it("Preview Mentor: mentor has not been previewed since last build", () => {
    const [mentor, newQuestionSet] = isBuiltButNotPreviewed();
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: mentor,
      questions: newQuestionSet,
    });
    cy.visit("/");
    cy.get("[data-cy=setup-no]").click();
    cy.get("[data-cy=skip-action-button]").click();
    cy.get("[data-cy=recommended-action-reason]").contains(
      "Preview your mentor to review its current status."
    );
  });

  it("Answer Trending Questions: At least 5 trending questions exist", () => {
    const [mentor, newQuestionSet] = isBuiltButNotPreviewed();
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

  it("Goes to limited phase once reaching 20 questions", () => {
    const [mentor, newQuestionSet] = answered20Questions();
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: mentor,
      questions: newQuestionSet,
      gqlQueries: [mockGQL("TrendingUserQuestions", trendingUserQuestions)],
    });
    cy.visit("/");
    cy.get("[data-cy=setup-no]").click();
  });
});
