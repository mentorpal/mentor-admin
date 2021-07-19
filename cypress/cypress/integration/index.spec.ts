/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { cyMockDefault, mockGQL } from "../support/functions";
import newMentor from "../fixtures/mentor/clint_new";
import clint from "../fixtures/mentor/clint_home";
import login, { login as loginDefault } from "../fixtures/login";
import { UserRole } from "../support/types";

describe("Index page", () => {
  it("if not logged in, show login page", () => {
    cyMockDefault(cy, { noAccessTokenStored: true });
    cy.visit("/");
    cy.location("pathname").then(($el) => {
      assert($el.replace("/admin", ""), "/");
    });
    cy.contains("Please sign in to access the Mentor Studio portal");
  });

  it("if logged in and setup not complete, redirect to setup page", () => {
    cyMockDefault(cy, { mentor: newMentor });
    cy.visit("/");
    cy.location("pathname").then(($el) => {
      assert($el.replace("/admin", ""), "/setup");
    });
  });

  it("if logged in and setup complete, show home page", () => {
    cyMockDefault(cy, { mentor: clint });
    cy.visit("/");
    cy.location("pathname").then(($el) => {
      assert($el.replace("/admin", ""), "/");
    });
    cy.get("[data-cy=select-subject]").should("exist");
  });

  //TODO: update this to actually navigate to the page
  it.only("an admin can navigate to users page from hamburger menu", () => {
    cyMockDefault(cy, {
      mentor: [clint],
      login: {
        ...loginDefault,
        user: { ...loginDefault.user, userRole: UserRole.ADMIN },
      },
    });
    cy.visit("/");
    cy.location("pathname").then(($el) => {
      assert($el.replace("/admin", ""), "/");
    });
    cy.get("[data-cy=select-subject]").should("exist");
  });
});
