/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  cySetup,
  cyMockDefault,
  mockGQL,
  testIndexedDbData,
  cyAttachCsv,
} from "../support/functions";
import allSubjects from "../fixtures/subjects/all-subjects";

describe("Import Questions", () => {
  it("Warned to save data before navigating to Import CSV page", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      subjects: [allSubjects],
      subject: allSubjects.edges[2].node,
    });
    cy.visit("/author/subject/?id=leadership");
    cy.get("[data-cy=toggle-questions]").click();
    cy.get("[data-cy=question]").click().type("test");
    cy.get("[data-cy=save-button]").should("be.enabled");
    cy.get("[data-cy=import-questions]").click();
    cy.get("[data-cy=two-option-dialog]")
      .should("be.visible")
      .should("contain.text", "You have unsaved changes.");
  });

  it("Warned if try to cancel CSV Import", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      subjects: [allSubjects],
      subject: allSubjects.edges[2].node,
    });
    cy.visit("/author/subject/importquestions?id=leadership");
    cy.get("[data-cy=cancel-import-questions]").should("be.visible").click();
    cy.get("[data-cy=two-option-dialog]")
      .should("be.visible")
      .should("contain.text", "Are you sure you want to cancel");
  });

  it("Can upload CSV", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      subjects: [allSubjects],
      subject: allSubjects.edges[2].node,
    });
    cy.visit("/author/subject/importquestions?id=leadership");
    cy.get("[data-cy=cancel-import-questions]").should("be.visible");
    cyAttachCsv(cy);
    cy.contains("Successfully Imported Questions");
  });

  it("Successfully imported questions are displayed", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      subjects: [allSubjects],
      subject: allSubjects.edges[2].node,
    });
    cy.visit("/author/subject/importquestions?id=leadership");
    cy.get("[data-cy=cancel-import-questions]").should("be.visible");
    cyAttachCsv(cy);
    cy.contains("Successfully Imported Questions");
    cy.get("[data-cy=question-0]").should(
      "contain.text",
      "Test import question 2"
    );
  });

  it("Un-successfully imported questions are displayed", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      subjects: [allSubjects],
      subject: allSubjects.edges[2].node,
    });
    cy.visit("/author/subject/importquestions?id=leadership");
    cy.get("[data-cy=cancel-import-questions]").should("be.visible");
    cyAttachCsv(cy);
    cy.contains("Un-successful Imports");
    cy.get("[data-cy=ignored-imported-question]")
      .should("exist")
      .should(
        "contain.text",
        "What's the hardest decision you've had to make as a leader?"
      );
  });

  it("Can change the question text, topic, subject, and paraphrases to an imported question", () => {
    const subjWithCategories = {
      ...allSubjects.edges[2].node,
      categories: [
        {
          id: "test-category",
          name: "test category",
          description: "test category",
        },
      ],
      topics: [
        {
          id: "test topic",
          name: "test topic",
          description: "test topic",
        },
      ],
    };
    cySetup(cy);
    cyMockDefault(cy, {
      subjects: [subjWithCategories],
      subject: subjWithCategories,
    });
    cy.visit("/author/subject/importquestions?id=leadership");
    cy.get("[data-cy=cancel-import-questions]").should("be.visible");
    cyAttachCsv(cy);
    cy.get("[data-cy=question-0]").within(() => {
      cy.get("[data-cy=question]").click().type("test");
      cy.get("[data-cy=question]").should("contain.text", "2test");
      cy.get("[data-cy=category-remap-input]")
        .click()
        .type("test category")
        .type("{downarrow}{enter}");
      cy.get("[data-cy=category-remap-input]")
        .get("input")
        .should("have.attr", "value", "test category");
      cy.get("[data-cy=topic-remap-input]")
        .click()
        .type("test topic")
        .type("{downarrow}{enter}");
      cy.get("[data-cy=topic-remap-input]")
        .get("input")
        .should("have.attr", "value", "test category");
      cy.get("[data-cy=paraphrases-expand]").click();
      cy.get("[data-cy=paraphrase-0]")
        .click()
        .type("test paraphrase")
        .within(() => {
          cy.get("input").should(
            "have.attr",
            "value",
            "paraphrase1 for question 2test paraphrase"
          );
        });
    });
  });
});
