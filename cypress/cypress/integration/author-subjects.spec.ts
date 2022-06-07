/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { cySetup, cyMockDefault } from "../support/functions";
import allSubjects from "../fixtures/subjects/all-subjects";
import { background } from "../fixtures/subjects";

const mentor = {
  _id: "clint",
};

describe("Edit subjects", () => {
  it("shows list of subjects", () => {
    cySetup(cy);
    cyMockDefault(cy, { mentor, subjects: [allSubjects] });
    cy.visit("/author/subjects");
    cy.get("[data-cy=subjects]").children().should("have.length", 3);
    cy.get("[data-cy=subjects]").within(($subjects) => {
      cy.get("[data-cy=subject-background]").within(($subject) => {
        cy.get("[data-cy=name]").should("have.text", "Background");
        cy.get("[data-cy=description]").should(
          "have.text",
          "These questions will ask general questions about your background that might be relevant to how people understand your career."
        );
      });
      cy.get("[data-cy=subject-repeat_after_me]").within(($subject) => {
        cy.get("[data-cy=name]").should("have.text", "Idle and Initial Recordings");
        cy.get("[data-cy=description]").should(
          "have.text",
          "These are miscellaneous phrases you'll be asked to repeat."
        );
      });
      cy.get("[data-cy=subject-leadership]").within(($subject) => {
        cy.get("[data-cy=name]").should("have.text", "Leadership");
        cy.get("[data-cy=description]").should(
          "have.text",
          "These questions will ask about being in a leadership role."
        );
      });
    });
  });

  it("can go to edit subject page", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor,
      subjects: [allSubjects],
      subject: background,
    });
    cy.visit("/author/subjects");
    cy.get("[data-cy=subjects]").within(($subjects) => {
      cy.get("[data-cy=subject-background]").within(($subject) => {
        cy.get("[data-cy=name]").within(($name) => {
          cy.get("a").trigger("mouseover").click();
        });
      });
    });
    cy.location("pathname").then(($el) =>
      assert($el.replace("/admin", ""), "/author/subject")
    );
    cy.location("search").should("equal", "?id=background");
  });

  it("can create a new subject", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor,
      subjects: [allSubjects],
    });
    cy.visit("/author/subjects");
    cy.get("[data-cy=create-button]").trigger("mouseover").click();
    cy.location("pathname").then(($el) =>
      assert($el.replace("/admin", ""), "/author/subject")
    );
    cy.location("search").should("equal", "");
  });
});
