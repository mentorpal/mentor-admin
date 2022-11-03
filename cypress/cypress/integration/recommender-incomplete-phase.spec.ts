/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { hasThumbnail } from "../fixtures/mentor-statuses/recommender-phase-1-statuses";
import {
  builtMentor,
  hasSubjectQuestionsOver5,
  needsBuilding,
} from "../fixtures/mentor-statuses/recommender-phase-2-statuses";
import { cyMockDefault, cySetup } from "../support/functions";

describe("Recommender Incomplete Phase (answers < 5)", () => {
  it("Needs a new subject: not enough subject questions to reach target of 5 questions", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: hasThumbnail,
    });
    cy.visit("/");
    cy.get("[data-cy=recommended-action-reason]").contains(
      "Your mentor doesn't have any subject areas. Subjects give you sets of questions to record."
    );
  });

  it("Needs more recordings: needs more answers to reach target", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: hasSubjectQuestionsOver5,
    });
    cy.visit("/");
    cy.get("[data-cy=recommended-action-reason]").contains(
      "Record more questions to further improve your mentor."
    );
  });

  it("Needs first build", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: needsBuilding,
    });
    cy.visit("/");
    cy.get("[data-cy=recommended-action-reason]").contains(
      "You've answered new questions since you last trained your mentor. Rebuild so you can preview."
    );
  });

  it("Goes to scripted phase after 5 questions answers and built", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: builtMentor,
    });
    cy.visit("/");
    cy.get("[data-cy=recommended-action-reason]").contains(
      "Your mentor doesn't have any subject areas. Subjects give you sets of questions to record."
    );
  });
});
