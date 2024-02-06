/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { cySetup, cyMockDefault } from "../support/functions";
import clint from "../fixtures/mentor/clint_home";
import { login as loginDefault } from "../fixtures/login";
import { UserRole } from "../support/types";

describe("lrs reports page", () => {
  it("USER's cannot see the LRS reports page hamburger button", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: clint,
    });
    cy.visit("/");
    cy.get("[data-cy=setup-no]").click();
    cy.get("[data-cy=menu-button]").click();
    cy.get("[data-cy=LRS-Reports-menu-button]").should("not.exist");
  });

  it("CONTENT_MANAGER's can see the LRS reports page hamburger button", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      login: {
        ...loginDefault,
        user: { ...loginDefault.user, userRole: UserRole.CONTENT_MANAGER },
      },
      mentor: clint,
    });
    cy.visit("/");
    cy.get("[data-cy=setup-no]").click();
    cy.get("[data-cy=menu-button]").click();
    cy.get("[data-cy=LRS-Reports-menu-button]").should("exist");
    cy.get("[data-cy=LRS-Reports-menu-button]").should("be.visible");
  });

  it("ADMIN's can see the LRS reports page hamburger button", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      login: {
        ...loginDefault,
        user: { ...loginDefault.user, userRole: UserRole.CONTENT_MANAGER },
      },
      mentor: clint,
    });
    cy.visit("/");
    cy.get("[data-cy=setup-no]").click();
    cy.get("[data-cy=menu-button]").click();
    cy.get("[data-cy=LRS-Reports-menu-button]").should("exist");
    cy.get("[data-cy=LRS-Reports-menu-button]").should("be.visible");
  });

  it("USER's cannot see the LRS reports page", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: clint,
    });
    cy.visit("/lrsreports");
    cy.contains("You must be an admin or content manager to view this page.", {
      timeout: 10000,
    });
  });

  it("CONTENT MANAGER's can see the LRS reports page", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      login: {
        ...loginDefault,
        user: { ...loginDefault.user, userRole: UserRole.CONTENT_MANAGER },
      },
      mentor: clint,
    });
    cy.visit("/lrsreports");
    cy.wait(4000);
    cy.contains("Download LRS Statements");
    cy.contains("Download User Questions");
    cy.contains("Download Merged Report");
  });

  it("ADMIN's can see the LRS reports page", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      login: {
        ...loginDefault,
        user: { ...loginDefault.user, userRole: UserRole.ADMIN },
      },
      mentor: clint,
    });
    cy.visit("/lrsreports");
    cy.wait(4000);
    cy.contains("Download LRS Statements");
    cy.contains("Download User Questions");
    cy.contains("Download Merged Report");
  });
});
