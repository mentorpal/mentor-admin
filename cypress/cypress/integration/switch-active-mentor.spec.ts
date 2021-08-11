/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { cySetup, cyMockDefault } from "../support/functions";
import clint from "../fixtures/mentor/clint_home";

describe("Switch Active Mentor", () => {
  describe("Shows default mentor and can switch to other mentors.", () => {
    it("views, saves, and updates profile data", () => {
      cySetup(cy);
      cyMockDefault(cy, {
        mentor: [
          { ...clint },
          {
            ...clint,
            _id: "nega-clint",
            name: "Nega Clint",
            title: "Evil Clone",
          },
          { ...clint },
        ],
      });
      cy.visit("/");
      cy.get("[data-cy=setup-no]").trigger("mouseover").click();
      cy.get("[data-cy=my-mentor-wrapper]").should(
        "have.css",
        "background-color",
        "rgb(255, 255, 255)"
      );
      cy.get("[data-cy=mentor-name]").within(($input) => {
        cy.get("input").should("have.value", "Clinton Anderson");
      });
      cy.get("[data-cy=mentor-job-title]").within(($input) => {
        cy.get("input").should("have.value", "Nuclear Electrician's Mate");
      });
      cy.get("[data-cy=switch-mentor-id]").within(($input) => {
        cy.get("input").clear();
      });
      cy.get("[data-cy=switch-mentor-id]").type("nega-clint");
      cy.get("[data-cy=switch-mentor-button]").trigger("mouseover").click();
      cy.get("[data-cy=my-mentor-wrapper]").should(
        "have.css",
        "background-color",
        "rgb(0, 0, 0)"
      );
      cy.get("[data-cy=mentor-name]").within(($input) => {
        cy.get("input").should("have.value", "Nega Clint");
      });
      cy.get("[data-cy=mentor-job-title]").within(($input) => {
        cy.get("input").should("have.value", "Evil Clone");
      });
      cy.get("[data-cy=default-mentor-button]").trigger("mouseover").click();
      cy.get("[data-cy=mentor-name]").within(($input) => {
        cy.get("input").should("have.value", "Clinton Anderson");
      });
      cy.get("[data-cy=mentor-job-title]").within(($input) => {
        cy.get("input").should("have.value", "Nuclear Electrician's Mate");
      });
      cy.get("[data-cy=my-mentor-wrapper]").should(
        "have.css",
        "background-color",
        "rgb(255, 255, 255)"
      );
    });
  });
});
