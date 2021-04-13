import { cySetup, cyInterceptGraphQL, cyMockLogin, cyMockGQL } from "../support/functions";
import login from "../fixtures/login";

const mentor = {
  _id: "clintanderson",
  name: "",
  firstName: "",
  title: "",
  lastTrainedAt: null,
  subjects: [],
};

describe("Profile", () => {
  it("redirects to login page if the user is not logged in", () => {
    cySetup(cy);
    cy.visit("/profile");
    cy.location("pathname").should("contain", "/login");
  });

  it("views, saves, and updates profile data", () => {
    cySetup(cy);
    cyMockLogin(cy);
    cyInterceptGraphQL(cy, [
      cyMockGQL("login", login),
      cyMockGQL("mentor", [
        mentor,
        { ...mentor, name: "Clinton Anderson" },
        { ...mentor, name: "Clinton Anderson", firstName: "Clint" },
        { ...mentor, name: "Clinton Anderson", firstName: "Clint", title: "Nuclear Electrician's Mate" }
      ],
        true),
      cyMockGQL("updateMentor", true, true),
    ]);
    cy.visit("/profile");
    cy.contains("My Profile");
    cy.get("#name").should("have.value", "");
    cy.get("#first-name").should("have.value", "");
    cy.get("#job-title").should("have.value", "");

    // fill out full name and save
    cy.get("#name").clear().type("Clinton Anderson");
    cy.get("#update-btn").trigger("mouseover").click();
    cy.contains("Profile updated!");
    cy.get("#name").should("have.value", "Clinton Anderson");
    cy.get("#first-name").should("have.value", "");
    cy.get("#job-title").should("have.value", "");

    // fill out first name and save
    cy.get("#first-name").clear().type("Clint");
    cy.get("#update-btn").trigger("mouseover").click();
    cy.contains("Profile updated!");
    cy.get("#name").should("have.value", "Clinton Anderson");
    cy.get("#first-name").should("have.value", "Clint");
    cy.get("#job-title").should("have.value", "");

    // fill out title and save
    cy.get("#job-title").clear().type("Nuclear Electrician's Mate");
    cy.get("#update-btn").trigger("mouseover").click();
    cy.contains("Profile updated!");
    cy.get("#name").should("have.value", "Clinton Anderson");
    cy.get("#first-name").should("have.value", "Clint");
    cy.get("#job-title").should("have.value", "Nuclear Electrician's Mate");
  });
});
