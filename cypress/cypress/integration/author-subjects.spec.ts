/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { cySetup, cyMockDefault } from "../support/functions";
import allSubjects from "../fixtures/subjects/all-subjects";
import { background } from "../fixtures/subjects";
import { login as loginDefault } from "../fixtures/login";
import { UserRole } from "../support/types";
import clint from "../fixtures/mentor/clint_home";

const mentor = {
  _id: "clint",
};

const singleArchivedSubject = {
  ...allSubjects,
  edges: allSubjects.edges.map((edge, i) => {
    if (i == 0) {
      return {
        ...edge,
        node: {
          ...edge.node,
          isArchived: true,
        },
      };
    }
    return {
      ...edge,
    };
  }),
};

describe("Edit subjects", () => {
  it("shows list of subjects", () => {
    cySetup(cy);
    cyMockDefault(cy, { mentor, subjects: [allSubjects] });
    cy.visit("/author/subjects");
    cy.get("[data-cy=subjects]").children().should("have.length", 3);
    cy.get("[data-cy=subjects]").within(($subjects) => {
      cy.get("[data-cy=subject-background]").within(($subject) => {
        cy.get("[data-cy=name]").should("have.text", "Background");
        cy.get("[data-cy=description]").should(
          "have.text",
          "These questions will ask general questions about your background that might be relevant to how people understand your career."
        );
      });
      cy.get("[data-cy=subject-idle_and_initial_recordings]").within(
        ($subject) => {
          cy.get("[data-cy=name]").should(
            "have.text",
            "Idle and Initial Recordings"
          );
          cy.get("[data-cy=description]").should(
            "have.text",
            "These are miscellaneous phrases you'll be asked to repeat."
          );
        }
      );
      cy.get("[data-cy=subject-leadership]").within(($subject) => {
        cy.get("[data-cy=name]").should("have.text", "Leadership");
        cy.get("[data-cy=description]").should(
          "have.text",
          "These questions will ask about being in a leadership role."
        );
      });
    });
  });

  it("can go to edit subject page", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor,
      subjects: [allSubjects],
      subject: background,
    });
    cy.visit("/author/subjects");
    cy.get("[data-cy=subjects]").within(($subjects) => {
      cy.get("[data-cy=subject-background]").within(($subject) => {
        cy.get("[data-cy=name]").within(($name) => {
          cy.get("a").trigger("mouseover").click();
        });
      });
    });
    cy.location("pathname").then(($el) =>
      assert($el.replace("/admin", ""), "/author/subject")
    );
    cy.location("search").should("equal", "?id=background");
  });

  it("can create a new subject", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor,
      subjects: [allSubjects],
    });
    cy.visit("/author/subjects");
    cy.get("[data-cy=create-button]").trigger("mouseover").click();
    cy.location("pathname").then(($el) =>
      assert($el.replace("/admin", ""), "/author/subject")
    );
    cy.location("search").should("equal", "");
  });

  describe("archived subjects", () => {
    it("View Archived Subjects button not visible to Users", () => {
      cySetup(cy);
      cyMockDefault(cy, {
        mentor,
        login: {
          ...loginDefault,
          user: { ...loginDefault.user, userRole: UserRole.USER },
        },
        subjects: [singleArchivedSubject],
      });
      cy.visit("/author/subjects");
      cy.contains("Leadership");
      cy.get("[data-cy=archived-subject-view-switch]").should("not.exist");
    });

    it("View Archived Subjects button visible to Content Managers", () => {
      cySetup(cy);
      cyMockDefault(cy, {
        mentor,
        login: {
          ...loginDefault,
          user: { ...loginDefault.user, userRole: UserRole.CONTENT_MANAGER },
        },
        subjects: [singleArchivedSubject],
      });
      cy.visit("/author/subjects");
      cy.contains("Leadership");
      cy.get("[data-cy=archived-subject-view-switch]").should("exist");
    });

    it("View Archived Subjects button visible to Admins", () => {
      cySetup(cy);
      cyMockDefault(cy, {
        mentor,
        login: {
          ...loginDefault,
          user: { ...loginDefault.user, userRole: UserRole.ADMIN },
        },
        subjects: [singleArchivedSubject],
      });
      cy.visit("/author/subjects");
      cy.contains("Leadership");
      cy.get("[data-cy=archived-subject-view-switch]").should("exist");
    });

    it("Archived subjects are not visible by default", () => {
      cySetup(cy);
      cyMockDefault(cy, {
        mentor,
        login: {
          ...loginDefault,
          user: { ...loginDefault.user, userRole: UserRole.ADMIN },
        },
        subjects: [singleArchivedSubject],
      });
      cy.visit("/author/subjects");
      cy.contains("Leadership");
      cy.get("[data-cy=subject-background]").should("not.exist");
    });

    it("Archived subjects are visible to users if they had those subjects prior to being archived", () => {
      cySetup(cy);
      cyMockDefault(cy, {
        mentor: { ...clint },
        login: {
          ...loginDefault,
          user: { ...loginDefault.user, userRole: UserRole.ADMIN },
        },
        subjects: [singleArchivedSubject],
      });
      cy.visit("/author/subjects");
      cy.get("[data-cy=subject-background]").should("exist");
      cy.get("[data-cy=subject-background]").should("contain", "Archived");
    });

    it("Archived subjects appear via toggle", () => {
      cySetup(cy);
      cyMockDefault(cy, {
        mentor,
        login: {
          ...loginDefault,
          user: { ...loginDefault.user, userRole: UserRole.ADMIN },
        },
        subjects: [singleArchivedSubject],
      });
      cy.visit("/author/subjects");
      cy.contains("Leadership");
      cy.get("[data-cy=subject-background]").should("not.exist");
      cy.get("[data-cy=archived-subject-view-switch]").click();
      cy.get("[data-cy=subject-background]").should("exist");
      cy.get("[data-cy=subject-background]").should("contain", "Archived");
      cy.get("[data-cy=archived-subject-view-switch]").click();
      cy.get("[data-cy=subject-background]").should("not.exist");
    });
  });
});
