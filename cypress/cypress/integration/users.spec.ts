/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { cyMockDefault, mockGQL } from "../support/functions";
import newMentor from "../fixtures/mentor/clint_new";
import clint from "../fixtures/mentor/clint_home";
import { login as loginDefault } from "../fixtures/login";
import { UserRole } from "../support/types";
import { users } from "../fixtures/users";
describe("users screen", () => {
  it("admins can edit all users roles", () => {
    cyMockDefault(cy, {
      mentor: [newMentor],
      login: {
        ...loginDefault,
        user: { ...loginDefault.user, userRole: UserRole.ADMIN },
      },
      gqlQueries: [mockGQL("Users", { users })],
    });
    cy.visit("/users");
    cy.get("[data-cy=user-0]").within(($within) => {
      cy.get("[data-cy=name]").should("have.text", "Admin");
      cy.get("[data-cy=select-role]").should("exist");
    });
    cy.get("[data-cy=user-1]").within(($within) => {
      cy.get("[data-cy=name]").should("have.text", "Content Manager");
      cy.get("[data-cy=select-role]").should("exist");
    });
    cy.get("[data-cy=user-2]").within(($within) => {
      cy.get("[data-cy=name]").should("have.text", "User");
      cy.get("[data-cy=select-role]").should("exist");
    });
  });

  it("failed to update user permissions error display", () => {
    cyMockDefault(cy, {
      mentor: [newMentor],
      login: {
        ...loginDefault,
        user: { ...loginDefault.user, userRole: UserRole.ADMIN },
      },
      gqlQueries: [
        mockGQL("Users", { users }),
        mockGQL("UpdateUserPermissions", undefined),
      ],
    });
    cy.visit("/users");
    cy.get("[data-cy=user-0]").within(($within) => {
      cy.get("[data-cy=name]").should("have.text", "Admin");
      cy.get("[data-cy=select-role]").invoke("mouseover").click();
    });
    cy.get("[data-cy=role-dropdown-USER]").invoke("mouseover").click();
    cy.get("[data-cy=error-dialog]").within(($within) => {
      cy.get("[data-cy=error-dialog-title]").should(
        "have.text",
        "Failed to update user permissions"
      );
    });
  });

  it("content managers cannot edit admins, but can edit others", () => {
    cyMockDefault(cy, {
      mentor: [newMentor],
      login: {
        ...loginDefault,
        user: { ...loginDefault.user, userRole: UserRole.CONTENT_MANAGER },
      },
      gqlQueries: [mockGQL("Users", { users })],
    });
    cy.visit("/users");
    cy.get("[data-cy=user-0]").within(($within) => {
      cy.get("[data-cy=name]").should("have.text", "Admin");
      cy.get("[data-cy=select-role]").should("not.exist");
    });
    cy.get("[data-cy=user-1]").within(($within) => {
      cy.get("[data-cy=name]").should("have.text", "Content Manager");
      cy.get("[data-cy=select-role]").should("exist");
    });
    cy.get("[data-cy=user-2]").within(($within) => {
      cy.get("[data-cy=name]").should("have.text", "User");
      cy.get("[data-cy=select-role]").should("exist");
    });
  });
});
