/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { cySetup, cyMockDefault, mockGQL } from "../support/functions";
import clint from "../fixtures/mentor/clint_home";
import { login as loginDefault } from "../fixtures/login";
import { UserRole } from "../support/types";

export const users = {
  edges: [
    {
      cursor: "cursor 1",
      node: {
        _id: "clintanderson",
        name: "Clinton Anderson",
        email: "clint@anderson.com",
        userRole: UserRole.ADMIN,
        defaultMentor: { _id: "clintanderson" },
      },
    },
    {
      cursor: "cursor 2",
      node: {
        _id: "user",
        name: "User",
        email: "user@opentutor.org",
        userRole: UserRole.USER,
        defaultMentor: "nega-clint",
      },
    },
  ],
  pageInfo: {
    hasNextPage: false,
    endCursor: "cursor 2",
  },
};

describe("Switch Active Mentor", () => {
  describe("Shows default mentor and can switch to other mentors.", () => {
    it("Regular users can't see mentor selection tools", () => {
      cySetup(cy);
      cyMockDefault(cy, {
        mentor: [{ ...clint }],
        login: {
          ...loginDefault,
          user: { ...loginDefault.user, userRole: UserRole.USER },
        },
      });
      cy.visit("/");
      cy.get("[data-cy=setup-no]").trigger("mouseover").click();
      cy.get("[data-cy=default-mentor-button]").should("not.exist");
    });

    it("loads other mentors' profile data if user is admin", () => {
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
        ],
        login: {
          ...loginDefault,
          user: { ...loginDefault.user, userRole: UserRole.ADMIN },
        },
        gqlQueries: [mockGQL("Users", { users })],
      });
      cy.visit("/");
      cy.get("[data-cy=setup-no]").trigger("mouseover").click();
      cy.get("[data-cy=default-mentor-button]").should("exist");
      cy.contains("Clinton Anderson");
      cy.visit("/users");
      cy.get("[data-cy=user-1]").within(($within) => {
        cy.get("[data-cy=edit-button]").invoke("mouseover").click();
      });
      cy.get("[data-cy=setup-no]").trigger("mouseover").click();
      cy.contains("Nega Clint");
    });
  });
});
