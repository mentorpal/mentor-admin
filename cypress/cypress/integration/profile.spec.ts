import { cySetup, cyMockDefault, mockGQL } from "../support/functions";

const mentor = {
  _id: "clintanderson",
  name: "",
  firstName: "",
  title: "",
  lastTrainedAt: null,
  subjects: [],
};

describe("Profile", () => {
  it("views, saves, and updates profile data", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: [
        mentor,
        { ...mentor, name: "Clinton Anderson" },
        { ...mentor, name: "Clinton Anderson", firstName: "Clint" },
        {
          ...mentor,
          name: "Clinton Anderson",
          firstName: "Clint",
          title: "Nuclear Electrician's Mate",
        },
      ],
      gqlQueries: [mockGQL("updateMentorDetails", true, true)],
    });
    cy.visit("/profile");
    cy.contains("My Profile");
    cy.get("[data-cy=mentor-name]").within($input => {
      cy.get("input").should('have.value', "")
    });
    cy.get("[data-cy=mentor-first-name]").within($input => {
      cy.get("input").should('have.value', "")
    });
    cy.get("[data-cy=mentor-job-title]").within($input => {
      cy.get("input").should('have.value', "")
    });
    cy.get("[data-cy=update-btn]").should("be.disabled");

    // fill out full name and save
    cy.get("[data-cy=mentor-name]").type("Clinton Anderson");
    cy.get("[data-cy=update-btn]").should("not.be.disabled");
    cy.get("[data-cy=update-btn]").trigger("mouseover").click();
    cy.get("[data-cy=update-btn]").should("be.disabled");
    cy.get("[data-cy=mentor-name]").within($input => {
      cy.get("input").should('have.value', "Clinton Anderson")
    });
    cy.get("[data-cy=mentor-first-name]").within($input => {
      cy.get("input").should('have.value', "")
    });
    cy.get("[data-cy=mentor-job-title]").within($input => {
      cy.get("input").should('have.value', "")
    });

    // fill out first name and save
    cy.get("[data-cy=mentor-first-name]").type("Clint");
    cy.get("[data-cy=update-btn]").should("not.be.disabled");
    cy.get("[data-cy=update-btn]").trigger("mouseover").click();
    cy.get("[data-cy=update-btn]").should("be.disabled");
    cy.get("[data-cy=mentor-name]").within($input => {
      cy.get("input").should('have.value', "Clinton Anderson")
    });
    cy.get("[data-cy=mentor-first-name]").within($input => {
      cy.get("input").should('have.value', "Clint")
    });
    cy.get("[data-cy=mentor-job-title]").within($input => {
      cy.get("input").should('have.value', "")
    });

    // fill out title and save
    cy.get("[data-cy=mentor-job-title]").type("Nuclear Electrician's Mate");
    cy.get("[data-cy=update-btn]").should("not.be.disabled");
    cy.get("[data-cy=update-btn]").trigger("mouseover").click();
    cy.get("[data-cy=update-btn]").should("be.disabled");
    cy.get("[data-cy=mentor-name]").within($input => {
      cy.get("input").should('have.value', "Clinton Anderson")
    });
    cy.get("[data-cy=mentor-first-name]").within($input => {
      cy.get("input").should('have.value', "Clint")
    });
    cy.get("[data-cy=mentor-job-title]").within($input => {
      cy.get("input").should('have.value', "Nuclear Electrician's Mate")
    });
  });
});
