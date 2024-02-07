/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import {
  answered100Questions,
  builtMentor,
  hasBuiltButNotPreviewed,
  hasSubjectQuestionsOver100,
} from "../fixtures/mentor-statuses/recommender-interactive-phase-statuses";
import { answered20Questions } from "../fixtures/mentor-statuses/recommender-scripted-phase-statuses";
import { cyMockDefault, cySetup } from "../support/functions";

describe("Recommender Interactive Phase (20 <= answers < 50)", () => {
  it("Build Mentor (high precedence): mentor is dirty", () => {
    const [mentor, newQuestionSet] = answered20Questions();
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

  it("Add a subject: need more subject questions to reach target", () => {
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

  it("Record more answers: has enough questions to reach target", () => {
    const [mentor, newQuestionSet] = hasSubjectQuestionsOver100();
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

  it("Preview mentor: mentor has been built but not previewed", () => {
    const [mentor, newQuestionSet] = hasBuiltButNotPreviewed();
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

  it("Moves to Specialist Area Phase once reaches 50 answers", () => {
    const [mentor, newQuestionSet] = answered100Questions();
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: mentor,
      questions: newQuestionSet,
    });
    cy.visit("/");
    cy.get("[data-cy=mentor-card-scope]").should("contain.text", "Specialist");
  });
});
