/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { cySetup, cyMockDefault } from "../support/functions";
import mentor from "../fixtures/mentor/clint_new";

describe("Login", () => {
  describe("redirects to login page if the user is not logged in", () => {
    it("from profile page", () => {
      cySetup(cy);
      cyMockDefault(cy, { noAccessTokenStored: true });
      cy.visit("/profile");
      cy.location("pathname").then(($el) => {
        assert($el.replace("/admin", ""), "/");
      });
      cy.contains("Please sign in to access the Mentor Studio portal");
      cy.get("[data-cy=nav-bar]").should("not.exist");
    });

    it("from setup page", () => {
      cySetup(cy);
      cyMockDefault(cy, { noAccessTokenStored: true });
      cy.visit("/setup");
      cy.location("pathname").then(($el) => {
        assert($el.replace("/admin", ""), "/");
      });
      cy.contains("Please sign in to access the Mentor Studio portal");
      cy.get("[data-cy=nav-bar]").should("not.exist");
    });

    it("from record page", () => {
      cySetup(cy);
      cyMockDefault(cy, { noAccessTokenStored: true });
      cy.visit("/record");
      cy.location("pathname").then(($el) => {
        assert($el.replace("/admin", ""), "/");
      });
      cy.contains("Please sign in to access the Mentor Studio portal");
      cy.get("[data-cy=nav-bar]").should("not.exist");
    });

    it("from subjects page", () => {
      cySetup(cy);
      cyMockDefault(cy, { noAccessTokenStored: true });
      cy.visit("/subjects");
      cy.location("pathname").then(($el) => {
        assert($el.replace("/admin", ""), "/");
      });
      cy.contains("Please sign in to access the Mentor Studio portal");
      cy.get("[data-cy=nav-bar]").should("not.exist");
    });

    it("from author subjects page", () => {
      cySetup(cy);
      cyMockDefault(cy, { noAccessTokenStored: true });
      cy.visit("/author/subjects");
      cy.location("pathname").then(($el) => {
        assert($el.replace("/admin", ""), "/");
      });
      cy.contains("Please sign in to access the Mentor Studio portal");
      cy.get("[data-cy=nav-bar]").should("not.exist");
    });

    it("from author subject page", () => {
      cySetup(cy);
      cyMockDefault(cy, { noAccessTokenStored: true });
      cy.visit("/author/subject");
      cy.location("pathname").then(($el) => {
        assert($el.replace("/admin", ""), "/");
      });
      cy.contains("Please sign in to access the Mentor Studio portal");
      cy.get("[data-cy=nav-bar]").should("not.exist");
    });

    it("from feedback page", () => {
      cySetup(cy);
      cyMockDefault(cy, { noAccessTokenStored: true });
      cy.visit("/feedback");
      cy.location("pathname").then(($el) => {
        assert($el.replace("/admin", ""), "/");
      });
      cy.contains("Please sign in to access the Mentor Studio portal");
      cy.get("[data-cy=nav-bar]").should("not.exist");
    });
  });

  it("shows login on home page if user is not logged in", () => {
    cySetup(cy);
    cyMockDefault(cy, { noAccessTokenStored: true });
    cy.visit("/");
    cy.contains("Please sign in to access the Mentor Studio portal");
    cy.get("[data-cy=nav-bar]").should("not.exist");
  });

  it("shows user name on home page if user is logged in", () => {
    cySetup(cy);
    cyMockDefault(cy, { mentor });
    cy.visit("/");
    cy.get("[data-cy=nav-bar]").within(($navbar) => {
      cy.get("[data-cy=login-option]").should("have.text", "Clinton Anderson");
    });
  });

  it("can logout and redirect to login page", () => {
    cySetup(cy);
    cyMockDefault(cy, { mentor });
    cy.visit("/setup");
    cy.contains("Welcome to MentorPal!");
    cy.get("[data-cy=login-option]").trigger("mouseover").click();
    cy.get("[data-cy=logout-button]").trigger("mouseover").click();
    cy.location("pathname").then(($el) => {
      assert($el.replace("/admin", ""), "/");
    });
    cy.contains("Please sign in to access the Mentor Studio portal");
    cy.get("[data-cy=nav-bar]").should("not.exist");
  });
});
