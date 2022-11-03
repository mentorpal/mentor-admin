/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  hasGoal,
  hasIdle,
  hasIntroAndNoOffTopicVideo,
  hasIntroNoTranscript,
  hasKeywords,
  hasOffTopicComplete,
  hasSubjects,
  missingOffTopicTranscript,
  startState,
} from "../fixtures/mentor-statuses/recommender-phase-1-statuses";
import { cySetup, cyMockDefault } from "../support/functions";

describe("Recommender Any Phase Recommendations", () => {
  it("Can skip through recommendations", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: startState,
    });
    cy.visit("/");
    cy.get("[data-cy=setup-no]").click();
    cy.get("[data-cy=recommended-action-reason]").contains(
      "It's important to establish the goal of your mentor."
    );
    cy.get("[data-cy=skip-action-button]").click();
    cy.get("[data-cy=recommended-action-reason]").contains(
      "Adding keywords respective to your experiences and identities allows users to easily find mentors they can relate to."
    );
    cy.get("[data-cy=skip-action-button]").click();
    cy.get("[data-cy=recommended-action-reason]").contains(
      "Your mentor doesn't have any subject areas. Subjects give you sets of questions to record."
    );
    cy.get("[data-cy=skip-action-button]").click();
    cy.get("[data-cy=recommended-action-reason]").contains(
      "Users see your idle video while typing a question"
    );

    cy.get("[data-cy=skip-action-button]").click();
    cy.get("[data-cy=recommended-action-reason]").contains(
      "Your mentor's introduction is what they say when a user starts."
    );

    cy.get("[data-cy=skip-action-button]").click();
    cy.get("[data-cy=recommended-action-reason]").contains(
      "The off topic response helps tell the user that the AI didn't understand their question."
    );

    cy.get("[data-cy=skip-action-button]").click();
    cy.get("[data-cy=recommended-action-reason]").contains(
      "A thumbnail helps a user pick out your mentor from other mentors."
    );

    cy.get("[data-cy=skip-action-button]").click();
    cy.get("[data-cy=recommended-action-reason]").contains(
      "It's important to establish the goal of your mentor."
    );
  });
  it("Goal is missing", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: startState,
    });
    cy.visit("/");
    cy.get("[data-cy=recommended-action-reason]").contains(
      "It's important to establish the goal of your mentor."
    );
  });
  it("Keywords required", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: hasGoal,
    });
    cy.visit("/");
    cy.get("[data-cy=recommended-action-reason]").contains(
      "Adding keywords respective to your experiences and identities allows users to easily find mentors they can relate to."
    );
  });
  it("Needs a subject", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: hasKeywords,
    });
    cy.visit("/");
    cy.get("[data-cy=recommended-action-reason]").contains(
      "Your mentor doesn't have any subject areas. Subjects give you sets of questions to record."
    );
  });
  it("Needs Idle Video: Idle is missing video", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: hasSubjects,
    });
    cy.visit("/");
    cy.get("[data-cy=recommended-action-reason]").contains(
      "Users see your idle video while typing a question"
    );
  });

  it("Needs intro: intro is missing video", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: hasIdle,
    });
    cy.visit("/");
    cy.get("[data-cy=recommended-action-reason]").contains(
      "Your mentor's introduction is what they say when a user starts."
    );
  });

  it("Needs intro: intro is missing transcript", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: hasIntroNoTranscript,
    });
    cy.visit("/");
    cy.get("[data-cy=recommended-action-reason]").contains(
      "Your mentor's introduction is what they say when a user starts."
    );
  });

  it("Needs off topic: off topic is missing video", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: hasIntroAndNoOffTopicVideo,
    });
    cy.visit("/");
    cy.get("[data-cy=recommended-action-reason]").contains(
      "The off topic response helps tell the user that the AI didn't understand their question."
    );
  });

  it("Needs off topic: off topic is missing transcript", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: missingOffTopicTranscript,
    });
    cy.visit("/");
    cy.get("[data-cy=recommended-action-reason]").contains(
      "The off topic response helps tell the user that the AI didn't understand their question."
    );
  });

  it("Needs thumbnail", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: hasOffTopicComplete,
    });
    cy.visit("/");
    cy.get("[data-cy=recommended-action-reason]").contains(
      "A thumbnail helps a user pick out your mentor from other mentors."
    );
  });
});
