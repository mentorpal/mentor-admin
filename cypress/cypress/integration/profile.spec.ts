import { cySetup, cyInterceptGraphQL, cyMockLogin, cyMockGQL } from "../support/functions";
import login from "../fixtures/login";
import {
  setup0,
  setup1,
  setup2,
  setup3,
} from "../fixtures/mentor"

describe("Profile", () => {
  it("redirects to login page if the user is not logged in", () => {
    cySetup(cy);
    cy.visit("/profile");
    cy.location("pathname").should("contain", "/login");
  });

  it("views, saves, and updates profile data", () => {
    cySetup(cy);
    cyMockLogin();
    cyInterceptGraphQL(cy, [
      cyMockGQL("login", login),
      cyMockGQL("mentor", [setup0, setup1, setup2, setup3], true),
      cyMockGQL("updateMentor", true, true),
    ]);
    cy.visit("/profile");

    cy.contains("My Profile");
    cy.get("#name").should("have.value", "");
    cy.get("#first-name").should("have.value", "");
    cy.get("#title").should("have.value", "");
    cy.get("#update-btn");

    // fill out full name and save
    cy.get("#name").clear().type("Clinton Anderson");
    cy.get("#update-btn").trigger("mouseover").click();
    cy.get("Profile updated!");
    cy.get("#name").should("have.value", "Clinton Anderson");
    cy.get("#first-name").should("have.value", "Clint");
    cy.get("#title").should("have.value", "");

    // fill out first name and save
    cy.get("#first-name").clear().type("Clint");
    cy.get("#update-btn").trigger("mouseover").click();
    cy.get("Profile updated!");
    cy.get("#name").should("have.value", "");
    cy.get("#first-name").should("have.value", "Clint");
    cy.get("#title").should("have.value", "");

    // fill out title and save
    cy.get("#title").clear().type("Nuclear Electrician's Mate");
    cy.get("#update-btn").trigger("mouseover").click();
    cy.get("Profile updated!");
    cy.get("#name").should("have.value", "Clinton Anderson");
    cy.get("#first-name").should("have.value", "Clint");
    cy.get("#title").should("have.value", "Nuclear Electrician's Mate");
  });
});
