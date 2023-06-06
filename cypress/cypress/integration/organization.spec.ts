/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { CONFIG_DEFAULT, cyMockDefault, mockGQL } from "../support/functions";
import newMentor from "../fixtures/mentor/clint_new";
import { login as loginDefault } from "../fixtures/login";
import { UserRole } from "../support/types";

const users = {
  edges: [
    {
      node: {
        _id: "superadmin",
        name: "Super Admin",
        email: "superadmin@opentutor.org",
        userRole: UserRole.SUPER_ADMIN,
        defaultMentor: {
          _id: "clintanderson",
          name: "Admin",
          isPrivate: false,
        },
      },
    },
    {
      node: {
        _id: "supercontentmanager",
        name: "Super Content Manager",
        email: "supercontentmanager@opentutor.org",
        userRole: UserRole.SUPER_CONTENT_MANAGER,
        defaultMentor: {
          _id: "clintanderson",
          name: "Super Content Manager",
          isPrivate: false,
        },
      },
    },
    {
      node: {
        _id: "admin",
        name: "Admin",
        email: "admin@opentutor.org",
        userRole: UserRole.ADMIN,
        defaultMentor: {
          _id: "clintanderson",
          name: "Admin",
          isPrivate: false,
        },
      },
    },
    {
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
      node: {
        _id: "user",
        name: "User",
        email: "user@opentutor.org",
        userRole: UserRole.USER,
        defaultMentor: { _id: "clintanderson", name: "User", isPrivate: false },
      },
    },
    {
      node: {
        _id: "user2",
        name: "User2",
        email: "user2@opentutor.org",
        userRole: UserRole.USER,
        defaultMentor: {
          _id: "clintanderson",
          name: "User2",
          isPrivate: false,
        },
      },
    },
  ],
};
const orgUsc = {
  node: {
    _id: "usc",
    uuid: "usc",
    name: "USC",
    subdomain: "usc",
    isPrivate: true,
    members: [
      {
        user: {
          _id: "admin",
          name: "Admin",
          defaultMentor: {
            name: "Admin",
          },
        },
        role: UserRole.ADMIN,
      },
      {
        user: {
          _id: "contentmanager",
          name: "Content Manager",
          defaultMentor: {
            name: "Content Manager",
          },
        },
        role: UserRole.CONTENT_MANAGER,
      },
      {
        user: {
          _id: "user2",
          name: "User2",
          defaultMentor: {
            name: "User2",
          },
        },
        role: UserRole.USER,
      },
    ],
  },
};
const orgCsuf = {
  node: {
    _id: "csuf",
    uuid: "csuf",
    name: "CSUF",
    subdomain: "careerfair",
    isPrivate: false,
    members: [
      {
        user: {
          _id: "superadmin",
          name: "Super Admin",
        },
        role: UserRole.ADMIN,
      },
      {
        user: {
          _id: "supercontentmanager",
          name: "Super Content Manager",
        },
        role: UserRole.CONTENT_MANAGER,
      },
      {
        user: {
          _id: "user",
          name: "User",
        },
        role: UserRole.USER,
      },
    ],
  },
};

describe("organization screen", () => {
  it("users can view organizations (even if not a member)", () => {
    cyMockDefault(cy, {
      mentor: [newMentor],
      config: CONFIG_DEFAULT,
      login: {
        ...loginDefault,
        user: { ...loginDefault.user, userRole: UserRole.USER },
      },
      gqlQueries: [
        mockGQL("Organizations", { organizations: { edges: [orgCsuf] } }),
        mockGQL("Users", { users }),
      ],
    });
    cy.visit("/organizations");
    cy.get("[data-cy=org-0]").within(($org) => {
      cy.get("[data-cy=name]").should("have.text", "CSUF");
      cy.get("[data-cy=subdomain]").should("have.text", "careerfair");
      cy.get("[data-cy=edit]").should("be.disabled");
      cy.get("[data-cy=config]").should("be.disabled");
    });
    cy.get("[data-cy=create]").should("not.exist");
  });

  it("super admins can view and edit all organizations (even if not a member)", () => {
    cyMockDefault(cy, {
      mentor: [newMentor],
      config: CONFIG_DEFAULT,
      login: {
        ...loginDefault,
        user: { ...loginDefault.user, userRole: UserRole.SUPER_ADMIN },
      },
      gqlQueries: [
        mockGQL("Organizations", {
          organizations: { edges: [orgUsc, orgCsuf] },
        }),
        mockGQL("Users", { users }),
      ],
    });
    cy.visit("/organizations");
    cy.get("[data-cy=org-0]").within(($org) => {
      cy.get("[data-cy=name]").should("have.text", "USC");
      cy.get("[data-cy=subdomain]").should("have.text", "usc");
      cy.get("[data-cy=edit]").should("not.be.disabled");
      cy.get("[data-cy=config]").should("not.be.disabled");
    });
    cy.get("[data-cy=org-1]").within(($org) => {
      cy.get("[data-cy=name]").should("have.text", "CSUF");
      cy.get("[data-cy=subdomain]").should("have.text", "careerfair");
      cy.get("[data-cy=edit]").should("not.be.disabled");
      cy.get("[data-cy=config]").should("not.be.disabled");
    });
    cy.get("[data-cy=create]").should("exist");
  });

  it("super managers can view and edit all organizations (even if not a member)", () => {
    cyMockDefault(cy, {
      mentor: [newMentor],
      config: CONFIG_DEFAULT,
      login: {
        ...loginDefault,
        user: {
          ...loginDefault.user,
          userRole: UserRole.SUPER_CONTENT_MANAGER,
        },
      },
      gqlQueries: [
        mockGQL("Organizations", {
          organizations: { edges: [orgUsc, orgCsuf] },
        }),
        mockGQL("Users", { users }),
      ],
    });
    cy.visit("/organizations");
    cy.get("[data-cy=org-0]").within(($org) => {
      cy.get("[data-cy=name]").should("have.text", "USC");
      cy.get("[data-cy=subdomain]").should("have.text", "usc");
      cy.get("[data-cy=edit]").should("not.be.disabled");
      cy.get("[data-cy=config]").should("not.be.disabled");
    });
    cy.get("[data-cy=org-1]").within(($org) => {
      cy.get("[data-cy=name]").should("have.text", "CSUF");
      cy.get("[data-cy=subdomain]").should("have.text", "careerfair");
      cy.get("[data-cy=edit]").should("not.be.disabled");
      cy.get("[data-cy=config]").should("not.be.disabled");
    });
    cy.get("[data-cy=create]").should("exist");
  });

  it("members of org can edit if admin of org", () => {
    cyMockDefault(cy, {
      mentor: [newMentor],
      config: CONFIG_DEFAULT,
      login: {
        ...loginDefault,
        user: { ...loginDefault.user, _id: "admin", userRole: UserRole.USER },
      },
      gqlQueries: [
        mockGQL("Organizations", {
          organizations: { edges: [orgUsc, orgCsuf] },
        }),
        mockGQL("Users", { users }),
      ],
    });
    cy.visit("/organizations");
    cy.get("[data-cy=org-0]").within(($org) => {
      cy.get("[data-cy=name]").should("have.text", "USC");
      cy.get("[data-cy=subdomain]").should("have.text", "usc");
      cy.get("[data-cy=edit]").should("not.be.disabled");
    });
    cy.get("[data-cy=org-1]").within(($org) => {
      cy.get("[data-cy=name]").should("have.text", "CSUF");
      cy.get("[data-cy=subdomain]").should("have.text", "careerfair");
      cy.get("[data-cy=edit]").should("be.disabled");
    });
    cy.get("[data-cy=create]").should("not.exist");
  });

  it("members of org can edit if content manager of org", () => {
    cyMockDefault(cy, {
      mentor: [newMentor],
      config: CONFIG_DEFAULT,
      login: {
        ...loginDefault,
        user: {
          ...loginDefault.user,
          _id: "contentmanager",
          userRole: UserRole.USER,
        },
      },
      gqlQueries: [
        mockGQL("Organizations", {
          organizations: { edges: [orgUsc, orgCsuf] },
        }),
        mockGQL("Users", { users }),
      ],
    });
    cy.visit("/organizations");
    cy.get("[data-cy=org-0]").within(($org) => {
      cy.get("[data-cy=name]").should("have.text", "USC");
      cy.get("[data-cy=subdomain]").should("have.text", "usc");
      cy.get("[data-cy=edit]").should("not.be.disabled");
    });
    cy.get("[data-cy=org-1]").within(($org) => {
      cy.get("[data-cy=name]").should("have.text", "CSUF");
      cy.get("[data-cy=subdomain]").should("have.text", "careerfair");
      cy.get("[data-cy=edit]").should("be.disabled");
    });
    cy.get("[data-cy=create]").should("not.exist");
  });

  it("members of org cannot edit if user of org", () => {
    cyMockDefault(cy, {
      mentor: [newMentor],
      config: CONFIG_DEFAULT,
      login: {
        ...loginDefault,
        user: { ...loginDefault.user, _id: "user2", userRole: UserRole.USER },
      },
      gqlQueries: [
        mockGQL("Organizations", {
          organizations: { edges: [orgUsc, orgCsuf] },
        }),
        mockGQL("Users", { users }),
      ],
    });
    cy.visit("/organizations");
    cy.get("[data-cy=org-0]").within(($org) => {
      cy.get("[data-cy=name]").should("have.text", "USC");
      cy.get("[data-cy=subdomain]").should("have.text", "usc");
      cy.get("[data-cy=edit]").should("be.disabled");
    });
    cy.get("[data-cy=org-1]").within(($org) => {
      cy.get("[data-cy=name]").should("have.text", "CSUF");
      cy.get("[data-cy=subdomain]").should("have.text", "careerfair");
      cy.get("[data-cy=edit]").should("be.disabled");
    });
    cy.get("[data-cy=create]").should("not.exist");
  });

  it("edits organization", () => {
    cyMockDefault(cy, {
      mentor: [newMentor],
      config: CONFIG_DEFAULT,
      login: {
        ...loginDefault,
        user: { ...loginDefault.user, userRole: UserRole.SUPER_ADMIN },
      },
      gqlQueries: [
        mockGQL("Organizations", {
          organizations: { edges: [orgUsc, orgCsuf] },
        }),
        mockGQL("Users", { users }),
      ],
    });
    cy.visit("/organizations");
    cy.get("[data-cy=edit-org]").should("not.exist");
    cy.get("[data-cy=org-0]").within(($org) => {
      cy.get("[data-cy=edit]").click({ force: true });
    });
    cy.get("[data-cy=edit-org]").should("exist");
    cy.get("[data-cy=edit-name]").should("contain", "USC");
    cy.get("[data-cy=edit-subdomain]").should("contain", "usc");
    cy.get("[data-cy=edit-privacy]").should("have.attr", "data-test", "true");
    cy.get("[data-cy=edit-members]").within(($members) => {
      cy.get("[data-cy=member-0]").within(($member) => {
        cy.get("[data-cy=member-name]").should("contain", "Admin");
        cy.get("[data-cy=member-select-role]").should("contain", "Admin");
      });
      cy.get("[data-cy=member-1]").within(($member) => {
        cy.get("[data-cy=member-name]").should("contain", "Content Manager");
        cy.get("[data-cy=member-select-role]").should(
          "contain",
          "Content Manager"
        );
      });
      cy.get("[data-cy=member-2]").within(($member) => {
        cy.get("[data-cy=member-name]").should("contain", "User2");
        cy.get("[data-cy=member-select-role]").should("contain", "User");
      });
    });
    cy.get("[data-cy=save]").should("not.be.disabled");
  });

  it("can add, delete, and edit access codes for private orgs", () => {
    cyMockDefault(cy, {
      mentor: [newMentor],
      config: CONFIG_DEFAULT,
      login: {
        ...loginDefault,
        user: { ...loginDefault.user, userRole: UserRole.SUPER_ADMIN },
      },
      gqlQueries: [
        mockGQL("Organizations", {
          organizations: { edges: [orgUsc, orgCsuf] },
        }),
        mockGQL("Users", { users }),
      ],
    });
    cy.visit("/organizations");
  });
});
