/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { cySetup, cyMockDefault } from "../support/functions";
import mentor from "../fixtures/mentor/clint_new";

describe("Login", () => {
  describe("redirects to login page if the user visits a client-only page and is not authorized", () => {
    it("from author questions page", () => {
      cySetup(cy);
      cy.visit("/app/author/questions");
      cy.location("pathname").should("not.contain", "/app/author/questions");
      cy.get("#login-button");
    });

    it("from author subjects page", () => {
      cySetup(cy);
      cy.visit("/app/author/subjects");
      cy.location("pathname").should("not.contain", "/app/author/subjects");
      cy.get("#login-button");
    });

    it("from author subject page", () => {
      cySetup(cy);
      cy.visit("/app/author/subject");
      cy.location("pathname").should("not.contain", "/app/author/subject");
      cy.get("#login-button");
    });

    it("from feedback page", () => {
      cySetup(cy);
      cy.visit("/app/feedback");
      cy.location("pathname").should("not.contain", "/app/feedback");
      cy.get("#login-button");
    });

    it("from profile page", () => {
      cySetup(cy);
      cy.visit("/app/profile");
      cy.location("pathname").should("not.contain", "/app/profile");
      cy.get("#login-button");
    });

    it("from record page", () => {
      cySetup(cy);
      cy.visit("/app/record");
      cy.location("pathname").should("not.contain", "/app/record");
      cy.get("#login-button");
    });

    it("from profile page", () => {
      cySetup(cy);
      cy.visit("/app/setup");
      cy.location("pathname").should("not.contain", "/app/setup");
      cy.get("#login-button");
    });
  });

  describe("navbar", () => {
    it("shows username if the user is logged in", () => {
      cySetup(cy);
      cyMockDefault(cy, { mentor });
      cy.visit("/");
      cy.get("#nav-bar #login-option").contains("Clinton Anderson");
    });

    it("does not show username if the user is not logged in", () => {
      cySetup(cy);
      cyMockDefault(cy, { noLogin: true });
      cy.visit("/");
      cy.get("#nav-bar #login-option").should("not.exist");
    });

    it("can logout and redirect to login page", () => {
      cySetup(cy);
      cyMockDefault(cy, { mentor });
      cy.visit("/");
      cy.get("#login-option").trigger("mouseover").click();
      cy.get("#logout-button").trigger("mouseover").click();
      cy.location("pathname").should("contain", "/login");
      cy.get("#login-option").should("not.exist");
    });
  });

  it("shows login page if user is not logged in", () => {
    cySetup(cy);
    cyMockDefault(cy, { noLogin: true });
    cy.visit("/app");
    cy.get("#login-button");
  });

  it("shows home page if user is logged in", () => {
    cySetup(cy);
    cyMockDefault(cy);
    cy.visit("/app/login");
    cy.get("#login-button").should("not.exist");
  });
});
