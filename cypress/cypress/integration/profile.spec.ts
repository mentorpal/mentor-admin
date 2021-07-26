/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
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
      gqlQueries: [
        mockGQL("UpdateMentorDetails", { me: { updateMentorDetails: true } }),
      ],
    });
    cy.visit("/profile");
    cy.contains("My Profile");
    cy.get("[data-cy=mentor-name]").within(($input) => {
      cy.get("input").should("have.value", "");
    });
    cy.get("[data-cy=mentor-first-name]").within(($input) => {
      cy.get("input").should("have.value", "");
    });
    cy.get("[data-cy=mentor-job-title]").within(($input) => {
      cy.get("input").should("have.value", "");
    });
    cy.get("[data-cy=update-btn]").should("be.disabled");

    // fill out full name and save
    cy.get("[data-cy=mentor-name]").type("Clinton Anderson");
    cy.get("[data-cy=update-btn]").should("not.be.disabled");
    cy.get("[data-cy=update-btn]").trigger("mouseover").click();
    cy.get("[data-cy=update-btn]").should("be.disabled");
    cy.get("[data-cy=mentor-name]").within(($input) => {
      cy.get("input").should("have.value", "Clinton Anderson");
    });
    cy.get("[data-cy=mentor-first-name]").within(($input) => {
      cy.get("input").should("have.value", "");
    });
    cy.get("[data-cy=mentor-job-title]").within(($input) => {
      cy.get("input").should("have.value", "");
    });

    // fill out first name and save
    cy.get("[data-cy=mentor-first-name]").type("Clint");
    cy.get("[data-cy=update-btn]").should("not.be.disabled");
    cy.get("[data-cy=update-btn]").trigger("mouseover").click();
    cy.get("[data-cy=update-btn]").should("be.disabled");
    cy.get("[data-cy=mentor-name]").within(($input) => {
      cy.get("input").should("have.value", "Clinton Anderson");
    });
    cy.get("[data-cy=mentor-first-name]").within(($input) => {
      cy.get("input").should("have.value", "Clint");
    });
    cy.get("[data-cy=mentor-job-title]").within(($input) => {
      cy.get("input").should("have.value", "");
    });

    // fill out title and save
    cy.get("[data-cy=mentor-job-title]").type("Nuclear Electrician's Mate");
    cy.get("[data-cy=update-btn]").should("not.be.disabled");
    cy.get("[data-cy=update-btn]").trigger("mouseover").click();
    cy.get("[data-cy=update-btn]").should("be.disabled");
    cy.get("[data-cy=mentor-name]").within(($input) => {
      cy.get("input").should("have.value", "Clinton Anderson");
    });
    cy.get("[data-cy=mentor-first-name]").within(($input) => {
      cy.get("input").should("have.value", "Clint");
    });
    cy.get("[data-cy=mentor-job-title]").within(($input) => {
      cy.get("input").should("have.value", "Nuclear Electrician's Mate");
    });
  });
});
