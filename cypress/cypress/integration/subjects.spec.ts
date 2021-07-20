/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import allSubjects from "../fixtures/subjects/all-subjects";
import { mockGQL, cyMockDefault, cySetup } from "../support/functions";

const mentor = {
  _id: "clintanderson",
  subjects: [
    {
      _id: "background",
      name: "Background",
      description:
        "These questions will ask general questions about your background that might be relevant to how people understand your career.",
      isRequired: true,
    },
    {
      _id: "repeat_after_me",
      name: "Repeat After Me",
      description: "These are miscellaneous phrases you'll be asked to repeat.",
      isRequired: true,
    },
  ],
};

describe("Select Subjects", () => {
  it("lists subjects", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: mentor,
      subjects: [allSubjects],
      gqlQueries: [
        mockGQL("UpdateMentorSubjects", { me: { updateMentorSubjects: true } }),
      ],
    });
    cy.visit("/subjects");
    cy.location("pathname").then(($el) => {
      assert($el.replace("/admin", ""), "/subjects");
    });
    cy.get("[data-cy=subjects]").children().should("have.length", 3);
    // required subject background is selected and cannot be deselected
    cy.get("[data-cy=subjects]").within(($subjects) => {
      cy.get("[data-cy=subject-0]").within(($subject) => {
        cy.get("[data-cy=name]").should("have.text", "Background");
        cy.get("[data-cy=description]").should(
          "have.text",
          "These questions will ask general questions about your background that might be relevant to how people understand your career."
        );
        cy.get('[data-cy=select] [type="checkbox"]').should("be.disabled");
        cy.get('[data-cy=select] [type="checkbox"]').should("be.checked");
        cy.get('[data-cy=default] [type="checkbox"]').should("not.be.disabled");
        cy.get('[data-cy=default] [type="checkbox"]').should("not.be.checked");
      });
    });
    // required subject repeat_after_me is selected and cannot be deselected
    cy.get("[data-cy=subjects]").within(($subjects) => {
      cy.get("[data-cy=subject-1]").within(($subject) => {
        cy.get("[data-cy=name]").should("have.text", "Repeat After Me");
        cy.get("[data-cy=description]").should(
          "have.text",
          "These are miscellaneous phrases you'll be asked to repeat."
        );
        cy.get('[data-cy=select] [type="checkbox"]').should("be.disabled");
        cy.get('[data-cy=select] [type="checkbox"]').should("be.checked");
        cy.get('[data-cy=default] [type="checkbox"]').should("not.be.disabled");
        cy.get('[data-cy=default] [type="checkbox"]').should("not.be.checked");
      });
    });
    // non-required subject leadership is not selected and can be selected
    cy.get("[data-cy=subjects]").within(($subjects) => {
      cy.get("[data-cy=subject-2]").within(($subject) => {
        cy.get("[data-cy=name]").should("have.text", "Leadership");
        cy.get("[data-cy=description]").should(
          "have.text",
          "These questions will ask about being in a leadership role."
        );
        cy.get('[data-cy=select] [type="checkbox"]').should("not.be.disabled");
        cy.get('[data-cy=select] [type="checkbox"]').should("not.be.checked");
        cy.get('[data-cy=default] [type="checkbox"]').should("be.disabled");
        cy.get('[data-cy=default] [type="checkbox"]').should("not.be.checked");
      });
    });
    // non-required subject leadership is selected and can be deselected
    cy.get("[data-cy=subjects]").within(($subjects) => {
      cy.get("[data-cy=subject-2]").within(($subject) => {
        cy.get('[data-cy=select] [type="checkbox"]')
          .check()
          .should("be.checked");
        cy.get('[data-cy=select] [type="checkbox"]').should("not.be.disabled");
      });
    });
  });

  it("can select subject + primary subject and save", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: [
        mentor,
        {
          ...mentor,
          defaultSubject: { _id: "leadership" },
          subjects: [
            ...mentor.subjects,
            {
              _id: "leadership",
              name: "Leadership",
              description:
                "These questions will ask about being in a leadership role.",
              isRequired: false,
              categories: [],
              topics: [],
              questions: [],
            },
          ],
        },
      ],
      subjects: [allSubjects],
      gqlQueries: [
        mockGQL("UpdateMentorSubjects", { me: { updateMentorSubjects: true } }),
      ],
    });
    cy.visit("/subjects");
    // can only have one primary subject
    cy.get("[data-cy=subjects]").within(($subjects) => {
      // select background as primary subject
      cy.get("[data-cy=subject-0]").within(($subject) => {
        cy.get('[data-cy=default] [type="checkbox"]')
          .check()
          .should("be.checked");
      });
      cy.get("[data-cy=subject-1]").within(($subject) => {
        cy.get('[data-cy=default] [type="checkbox"]').should("not.be.checked");
      });
      cy.get("[data-cy=subject-2]").within(($subject) => {
        cy.get('[data-cy=default] [type="checkbox"]').should("not.be.checked");
      });
      // select repeat_after_me as primary subject
      cy.get("[data-cy=subject-1]").within(($subject) => {
        cy.get('[data-cy=default] [type="checkbox"]')
          .check()
          .should("be.checked");
      });
      cy.get("[data-cy=subject-0]").within(($subject) => {
        cy.get('[data-cy=default] [type="checkbox"]').should("not.be.checked");
      });
      cy.get("[data-cy=subject-2]").within(($subject) => {
        cy.get('[data-cy=default] [type="checkbox"]').should("not.be.checked");
      });
      // select leadership as primary subject
      cy.get("[data-cy=subject-2]").within(($subject) => {
        cy.get('[data-cy=select] [type="checkbox"]')
          .check()
          .should("be.checked");
        cy.get('[data-cy=default] [type="checkbox"]')
          .check()
          .should("be.checked");
      });
      cy.get("[data-cy=subject-0]").within(($subject) => {
        cy.get('[data-cy=default] [type="checkbox"]').should("not.be.checked");
      });
      cy.get("[data-cy=subject-1]").within(($subject) => {
        cy.get('[data-cy=default] [type="checkbox"]').should("not.be.checked");
      });
    });
    // save changes
    cy.get("[data-cy=save-button]").should("not.be.disabled");
    cy.get("[data-cy=save-button]").trigger("mouseover").click();
    // changes were saved
    cy.get("[data-cy=subjects]").within(($subjects) => {
      cy.get("[data-cy=subject-0]").within(($subject) => {
        cy.get('[data-cy=select] [type="checkbox"]').should("be.disabled");
        cy.get('[data-cy=select] [type="checkbox"]').should("be.checked");
        cy.get('[data-cy=default] [type="checkbox"]').should("not.be.disabled");
        cy.get('[data-cy=default] [type="checkbox"]').should("not.be.checked");
      });
      cy.get("[data-cy=subject-1]").within(($subject) => {
        cy.get('[data-cy=select] [type="checkbox"]').should("be.disabled");
        cy.get('[data-cy=select] [type="checkbox"]').should("be.checked");
        cy.get('[data-cy=default] [type="checkbox"]').should("not.be.disabled");
        cy.get('[data-cy=default] [type="checkbox"]').should("not.be.checked");
      });
      cy.get("[data-cy=subject-2]").within(($subject) => {
        cy.get('[data-cy=select] [type="checkbox"]').should("not.be.disabled");
        cy.get('[data-cy=select] [type="checkbox"]').should("be.checked");
        cy.get('[data-cy=default] [type="checkbox"]').should("not.be.disabled");
        cy.get('[data-cy=default] [type="checkbox"]').should("be.checked");
      });
    });
  });
});
