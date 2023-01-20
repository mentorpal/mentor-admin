/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { cyMockDefault, mockGQL } from "../support/functions";
import newMentor from "../fixtures/mentor/clint_new";
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
      cy.get("[data-cy=name]").should("have.text", "Admin User");
      cy.get("[data-cy=defaultMentor]").should("have.text", "Admin");
      cy.get("[data-cy=select-role]").should("exist");
    });
    cy.get("[data-cy=user-1]").within(($within) => {
      cy.get("[data-cy=name]").should("have.text", "Content Manager");
      cy.get("[data-cy=defaultMentor]").should("have.text", "Content Manager");
      cy.get("[data-cy=select-role]").should("exist");
    });
    cy.get("[data-cy=user-2]").within(($within) => {
      cy.get("[data-cy=name]").should("have.text", "User");
      cy.get("[data-cy=defaultMentor]").should("have.text", "User");
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
      cy.get("[data-cy=defaultMentor]").should("have.text", "Admin");
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

  it("content managers cannot edit user roles", () => {
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
      cy.get("[data-cy=defaultMentor]").should("have.text", "Admin");
      cy.get("[data-cy=select-role]").should("not.exist");
    });
    cy.get("[data-cy=user-1]").within(($within) => {
      cy.get("[data-cy=defaultMentor]").should("have.text", "Content Manager");
      cy.get("[data-cy=select-role]").should("not.exist");
    });
    cy.get("[data-cy=user-2]").within(($within) => {
      cy.get("[data-cy=defaultMentor]").should("have.text", "User");
      cy.get("[data-cy=select-role]").should("not.exist");
    });
  });

  it("admin can edit mentor privacy", () => {
    cyMockDefault(cy, {
      mentor: [newMentor],
      login: {
        ...loginDefault,
        user: { ...loginDefault.user, userRole: UserRole.ADMIN },
      },
      gqlQueries: [
        mockGQL("Users", [
          { users },
          {
            users: {
              edges: [
                {
                  cursor: "cursor 1",
                  node: {
                    _id: "admin",
                    name: "Admin",
                    email: "admin@opentutor.org",
                    userRole: UserRole.ADMIN,
                    defaultMentor: {
                      _id: "clintanderson",
                      name: "Admin",
                      isPrivate: true,
                    },
                  },
                },
                {
                  cursor: "cursor 2",
                  node: {
                    _id: "contentmanager",
                    name: "Content Manager",
                    email: "contentmanager@opentutor.org",
                    userRole: UserRole.CONTENT_MANAGER,
                    defaultMentor: {
                      _id: "clintanderson",
                      name: "Content Manager",
                      isPrivate: false,
                    },
                  },
                },
                {
                  cursor: "cursor 2",
                  node: {
                    _id: "user",
                    name: "User",
                    email: "user@opentutor.org",
                    userRole: UserRole.USER,
                    defaultMentor: {
                      _id: "clintanderson",
                      name: "User",
                      isPrivate: false,
                    },
                  },
                },
              ],
              pageInfo: {
                hasNextPage: false,
                endCursor: "cursor 2",
              },
            },
          },
        ]),
        mockGQL("UpdateMentorPrivacy", {
          me: {
            updateMentorPrivacy: true,
          },
        }),
      ],
    });
    cy.visit("/users");
    cy.get("[data-cy=user-0]").within(($within) => {
      cy.get("[data-cy=defaultMentor]").should("have.text", "Admin");
      cy.get("[data-cy=select-privacy]").should("exist");
      cy.get("[data-cy=select-privacy]")
        .contains("Public")
        .trigger("mouseover")
        .click();
    });
    cy.get("[data-cy=privacy-dropdown-private]")
      .contains("Private")
      .trigger("mouseover")
      .click();
    cy.get("[data-cy=user-0]").within(($within) => {
      cy.get("[data-cy=defaultMentor]").should("have.text", "Admin");
      cy.get("[data-cy=select-privacy]").should("exist");
      cy.get("[data-cy=select-privacy]").contains("Private");
    });
  });

  it("can toggle archived mentors", () => {
    cyMockDefault(cy, {
      mentor: [newMentor],
      login: {
        ...loginDefault,
        user: { ...loginDefault.user, userRole: UserRole.ADMIN },
      },
      gqlQueries: [
        mockGQL("Users", {
          users: {
            edges: [
              {
                cursor: "cursor 3",
                node: {
                  _id: "archived",
                  name: "Archived",
                  email: "archived@mentor.com",
                  userRole: UserRole.USER,
                  defaultMentor: {
                    _id: "clintanderson",
                    name: "User",
                    isPrivate: false,
                    isArchived: true,
                  },
                },
              },
              ...users.edges,
            ],
          },
        }),
      ],
    });
    cy.visit("/users");
    cy.get("[data-cy=user-0]").within(($within) => {
      cy.get("[data-cy=name]").should("have.text", "Admin User");
      cy.get("[data-cy=defaultMentor]").should("have.text", "Admin");
      cy.get("[data-cy=select-role]").should("exist");
    });
    cy.get("[data-cy=user-1]").within(($within) => {
      cy.get("[data-cy=name]").should("have.text", "Content Manager");
      cy.get("[data-cy=defaultMentor]").should("have.text", "Content Manager");
      cy.get("[data-cy=select-role]").should("exist");
    });
    cy.get("[data-cy=user-2]").within(($within) => {
      cy.get("[data-cy=name]").should("have.text", "User");
      cy.get("[data-cy=defaultMentor]").should("have.text", "User");
      cy.get("[data-cy=select-role]").should("exist");
    });
    cy.get("[data-cy=archive-mentor-switch]").should(
      "have.attr",
      "data-test",
      "false"
    );
    cy.get("[data-cy=archive-mentor-switch]").click();
    cy.get("[data-cy=user-0]").within(($within) => {
      cy.get("[data-cy=name]").should("have.text", "Admin User");
      cy.get("[data-cy=defaultMentor]").should("have.text", "Admin");
      cy.get("[data-cy=select-role]").should("exist");
    });
    cy.get("[data-cy=user-1]").within(($within) => {
      cy.get("[data-cy=name]").should("have.text", "Content Manager");
      cy.get("[data-cy=defaultMentor]").should("have.text", "Content Manager");
      cy.get("[data-cy=select-role]").should("exist");
    });
    cy.get("[data-cy=user-2]").within(($within) => {
      cy.get("[data-cy=name]").should("have.text", "User");
      cy.get("[data-cy=defaultMentor]").should("have.text", "User");
      cy.get("[data-cy=select-role]").should("exist");
    });
    cy.get("[data-cy=user-3]").within(($within) => {
      cy.get("[data-cy=name]").should("have.text", "Archived");
      cy.get("[data-cy=defaultMentor]").should("have.text", "User Archived");
    });
  });
});
