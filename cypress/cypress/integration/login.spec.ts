/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { cySetup, cyInterceptGraphQL, cyMockLogin, cyMockGQL } from "../support/functions";
import login from "../fixtures/login"
import subjects from "../fixtures/subjects";
import mentor from "../fixtures/mentor/clint_new"

describe("Login", () => {

  describe("redirects to login page if the user is not logged in", () => {
    it("from home page", () => {
      cySetup(cy);
      cy.visit("/");
      cy.location("pathname").should("contain", "/login");
    });

    it("from profile page", () => {
      cySetup(cy);
      cy.visit("/profile");
      cy.location("pathname").should("contain", "/login");
    });

    it("from setup page", () => {
      cySetup(cy);
      cy.visit("/setup");
      cy.location("pathname").should("contain", "/login");
    });

    it("from record page", () => {
      cySetup(cy);
      cy.visit("/record");
      cy.location("pathname").should("contain", "/login");
    });

    it("from subjects page", () => {
      cySetup(cy);
      cy.visit("/author/subjects");
      cy.location("pathname").should("contain", "/login");
    });

    it("from subject page", () => {
      cySetup(cy);
      cy.visit("/author/subject");
      cy.location("pathname").should("contain", "/login");
    });

    it("from questions page", () => {
      cySetup(cy);
      cy.visit("/author/questions");
      cy.location("pathname").should("contain", "/login");
    });

    it("from feedback page", () => {
      cySetup(cy);
      cy.visit("/feedback");
      cy.location("pathname").should("contain", "/login");
    });
  });

  describe("navbar", () => {
    it("shows username if the user is logged in", () => {
      cySetup(cy);
      cyMockLogin();
      cyInterceptGraphQL(cy, [
        cyMockGQL("login", login),
        cyMockGQL("mentor", mentor, true)
      ]);
      cy.visit("/");
      cy.get("#nav-bar #login-option").contains("Clinton Anderson");
    });

    it("does not show username if the user is not logged in", () => {
      cySetup(cy);
      cy.visit("/");
      cy.get("#nav-bar #login-option").should("not.exist");
    });

    it("can logout and redirect to login page", () => {
      cySetup(cy);
      cyMockLogin();
      cyInterceptGraphQL(cy, [
        cyMockGQL("login", login),
        cyMockGQL("mentor", mentor, true),
        cyMockGQL("subjects", [subjects])
      ]);
      cy.visit("/");
      cy.get("#login-option").trigger('mouseover').click();
      cy.get("#logout-button").trigger('mouseover').click();
      cy.location("pathname").should("contain", "/login");
      cy.get("#login-option").should("not.exist");
    });
  });

  it("shows login page", () => {
    cySetup(cy);
    cy.visit("/login");
    cy.get("#nav-bar #title").contains("Mentor Studio");
    cy.contains("Please sign in to access the Mentor Studio portal");
    cy.get("#login-button").contains("Sign in");
  });

  it("logs in automatically if the user has an accessToken", () => {
    cySetup(cy);
    cyMockLogin();
    cyInterceptGraphQL(cy, [
      cyMockGQL("login", login)
    ]);
    cy.visit("/login");
    cy.location("pathname").should("not.contain", "/login");
  });

  it("redirects to setup page after logging in for the first time", () => {
    cySetup(cy);
    cyMockLogin();
    cyInterceptGraphQL(cy, [
      cyMockGQL("login", login),
      cyMockGQL("mentor", mentor, true)
    ]);
    cy.visit("/login");
    cy.location("pathname").should("contain", "/setup");
    cy.location("pathname").should("not.contain", "/login");
  });
});
