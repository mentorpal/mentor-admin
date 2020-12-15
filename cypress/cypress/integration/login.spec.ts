/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { cySetup, cyLogin, cyMockGraphQL, cyMockByQueryName } from "../support/functions";

describe("Login", () => {

  describe("navbar", () => {
    it("navbar shows username if the user is logged in", () => {
      cySetup(cy);
      cyMockGraphQL(cy, {
        mocks: [cyLogin(cy)],
      });
      cy.visit("/");
      cy.get("#nav-bar #login-option").contains("Clinton Anderson");
    });

    it("navbar does not show username if the user is not logged in", () => {
      cySetup(cy);
      cyMockGraphQL(cy, {
        mocks: [cyLogin(cy)],
      });
      cy.visit("/");
      cy.get("#nav-bar #login-option").should("not.exist");
    });

    it("can logout from navbar and redirect to login page", () => {
      cySetup(cy);
      cyMockGraphQL(cy, {
        mocks: [cyLogin(cy)],
      });
      cy.visit("/");
      cy.get("#nav-bar #login-option").trigger('mouseover').click();
      cy.get("#nav-bar #login-menu #logout-button").trigger('mouseover').click();
      cy.location("pathname").should("contain", "/login");
      cy.get("#nav-bar #login-option").should("not.exist");
    });

    it("can navigate to home page from navbar", () => {
      cySetup(cy);
      cyMockGraphQL(cy, {
        mocks: [cyLogin(cy)],
      });
      cy.visit("/");
      cy.get("#nav-bar #login-option").trigger('mouseover').click();
      cy.get("#home-button").trigger('mouseover').click();
      cy.location("pathname").should("eq", "/");
      cy.get("#nav-bar #login-option").contains("Clinton Anderson");
    })
  });

  it("shows login page", () => {
    cySetup(cy);
    cy.visit("/login");
    cy.get("#nav-bar #title").contains("Mentor Studio");
    cy.contains("Please sign in to access the Mentor Studio portal");
    cy.get("#login-button").contains("Sign in");
  });

  it("redirects to login page from home page if the user is not logged in", () => {
    cySetup(cy);
    cy.visit("/");
    cy.location("pathname").should("contain", "/login");
  });

  it("redirects to home page after the user logs in", () => {
    cySetup(cy);
    cyMockGraphQL(cy, {
      mocks: [cyMockByQueryName("login", {
        login: {
          user: {
            id: "kayla",
            name: "Kayla Carr",
          },
          accessToken: 'accessToken'
        },
      })],
    });
    cy.visit("/login");
    cy.location("pathname").should("contain", "/login");
    cy.get("#login-button").trigger('mouseover').click();
    cy.location("pathname").should("not.contain", "/login");
    cy.get("#nav-bar #title").contains("Mentor Studio");
  });

  it("logs in automatically if the user has an accessToken", () => {
    cySetup(cy);
    cyMockGraphQL(cy, {
      mocks: [cyLogin(cy)],
    });
    cy.visit("/login");
    cy.location("pathname").should("not.contain", "/login");
    cy.get("#nav-bar #title").contains("Mentor Studio");
  });
});
