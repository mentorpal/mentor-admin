/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { cySetup, cyMockDefault, mockGQL } from "../support/functions";
import clint from "../fixtures/mentor/clint_home";
import clintNew from "../fixtures/mentor/clint_new";
import allSubjects from "../fixtures/subjects/all-subjects";
import exportJson from "../fixtures/imports/export";
import importPreview from "../fixtures/imports/import-preview";
import { Connection, Question } from "../support/types";

const questions: Connection<Partial<Question>> = {
  edges: [
    {
      cursor: "",
      node: {
        _id: "q1",
        question: "Question 1",
      },
    },
    {
      cursor: "",
      node: {
        _id: "q2",
        question: "Question 2",
      },
    },
    {
      cursor: "",
      node: {
        _id: "q3",
        question: "Question 3",
      },
    },
    {
      cursor: "",
      node: {
        _id: "q4",
        question: "Added Question 4",
      },
    },
    {
      cursor: "",
      node: {
        _id: "q5",
        question: "Removed Question 5",
      },
    },
    {
      cursor: "",
      node: {
        _id: "q6",
        question: "Pick me!",
      },
    },
  ],
  pageInfo: {
    startCursor: null,
    endCursor: null,
    hasNextPage: false,
    hasPreviousPage: false,
  },
};

describe("Import", { scrollBehavior: "center" }, () => {
  it("shows page", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: clintNew,
      subjects: [allSubjects],
      gqlQueries: [
        mockGQL("Questions", { questions: questions }),
        mockGQL("MentorExport", { mentorExport: exportJson }),
        mockGQL("MentorImport", { me: { mentorImport: clint } }),
        mockGQL("MentorImportPreview", {
          mentorImportPreview: {
            ...importPreview,
          },
        }),
      ],
    });
    cy.visit("/importexport");
    cy.contains("Export Mentor");
    cy.get("[data-cy=download-mentor]");
    cy.get("[data-cy=upload-mentor]");
  });

  it("Displays close when import complete", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: clintNew,
      subjects: [allSubjects],
      gqlQueries: [
        mockGQL("ImportTask", [
          {
            importTask: {
              graphQLUpdate: {
                status: "DONE",
              },
              s3VideoMigrate: {
                status: "IN_PROGRESS",
                answerMediaMigrations: [
                  {
                    question: "q1",
                    status: "DONE",
                  },
                  {
                    question: "q2",
                    status: "DONE",
                  },
                  {
                    question: "q3",
                    status: "DONE",
                  },
                  {
                    question: "q4",
                    status: "IN_PROGRESS",
                  },
                ],
              },
            },
          },
          {
            importTask: {
              graphQLUpdate: {
                status: "DONE",
              },
              s3VideoMigrate: {
                status: "DONE",
                answerMediaMigrations: [
                  {
                    question: "q1",
                    status: "DONE",
                  },
                  {
                    question: "q2",
                    status: "DONE",
                  },
                  {
                    question: "q3",
                    status: "DONE",
                  },
                  {
                    question: "q4",
                    status: "DONE",
                  },
                ],
              },
            },
          },
        ]),
        mockGQL("ImportTaskDelete", { me: { importTaskDelete: true } }),
      ],
    });
    cy.visit("/importexport");
    cy.get("[data-cy=import-progress-dialog]").within(($within) => {
      cy.get("[data-cy=close-button]").should("be.visible");
    });
  });

  it("Displays logout when import in progress", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: clintNew,
      subjects: [allSubjects],
      gqlQueries: [
        mockGQL("ImportTask", {
          importTask: {
            graphQLUpdate: {
              status: "DONE",
            },
            s3VideoMigrate: {
              status: "IN_PROGRESS",
              answerMediaMigrations: [
                {
                  question: "q1",
                  status: "DONE",
                },
                {
                  question: "q2",
                  status: "DONE",
                },
                {
                  question: "q3",
                  status: "DONE",
                },
                {
                  question: "q4",
                  status: "IN_PROGRESS",
                },
              ],
            },
          },
        }),
        mockGQL("ImportTaskDelete", { me: { importTaskDelete: true } }),
      ],
    });
    cy.visit("/importexport");
    cy.get("[data-cy=import-progress-dialog]").within(($within) => {
      cy.get("[data-cy=logout-button]").should("be.visible");
    });
  });

  it("import in progress detected when visiting mentor studio", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: clintNew,
      subjects: [allSubjects],
      gqlQueries: [
        mockGQL("ImportTask", {
          importTask: {
            graphQLUpdate: {
              status: "DONE",
            },
            s3VideoMigrate: {
              status: "IN_PROGRESS",
              answerMediaMigrations: [
                {
                  question: "q1",
                  status: "DONE",
                },
                {
                  question: "q2",
                  status: "DONE",
                },
                {
                  question: "q3",
                  status: "DONE",
                },
                {
                  question: "q4",
                  status: "IN_PROGRESS",
                },
              ],
            },
          },
        }),
        mockGQL("ImportTaskDelete", { me: { importTaskDelete: true } }),
      ],
    });
    cy.visit("/");
    cy.get("[data-cy=import-progress-dialog]").should("be.visible");
  });

  it("uploads import json and views import preview", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: clintNew,
      subjects: [allSubjects],
      gqlQueries: [
        mockGQL("Questions", { questions: questions }),
        mockGQL("MentorExport", { mentorExport: exportJson }),
        mockGQL("MentorImport", { me: { mentorImport: clint } }),
        mockGQL("MentorImportPreview", {
          mentorImportPreview: {
            ...importPreview,
          },
        }),
      ],
    });
    cy.visit("/importexport");
    cy.fixture("mentor-import.json").then((fileContent) => {
      cy.get("[data-cy=upload-mentor]").attachFile({
        fileContent: fileContent,
        fileName: "mentor-import.json",
        mimeType: "application/json",
      });
    });
    cy.contains("Confirm Import?");
    cy.contains(
      "The following changes will be made to your mentor if you import this JSON:"
    );
    cy.get("[data-cy=subjects]").children().should("have.length", 5);
    cy.get("[data-cy=subject]").eq(0).contains("Repeat After Me");
    cy.get("[data-cy=subject]")
      .eq(0)
      .find("[data-cy=change-icon]")
      .should("be.visible");
    cy.get("[data-cy=subject]").eq(1).contains("New subject");
    cy.get("[data-cy=subject]").eq(1).find("[data-cy=new-icon]");
    cy.get("[data-cy=subject]").eq(2).contains("Leadership");
    cy.get("[data-cy=subject]").eq(2).find("[data-cy=add-icon]");
    cy.get("[data-cy=subject]").eq(3).contains("Background");
    cy.get("[data-cy=subject]").eq(3).find("[data-cy=remove-icon]");

    cy.get("[data-cy=answers]").scrollIntoView();
    cy.get("[data-cy=answers]").children().should("have.length", 5);
    cy.get("[data-cy=answer]").eq(0).contains("Question 1");
    cy.get("[data-cy=answer]").eq(0).contains("Answer 1");
    cy.get("[data-cy=answer]")
      .eq(0)
      .find("[data-cy=change-icon]")
      .should("not.be.visible");
    cy.get("[data-cy=answer]").eq(1).contains("Edited Question 2");
    cy.get("[data-cy=answer]").eq(1).contains("Edited Answer 2");
    cy.get("[data-cy=answer]")
      .eq(1)
      .find("[data-cy=change-icon]")
      .should("be.visible");
    cy.get("[data-cy=answer]").eq(2).contains("A new question being created");
    cy.get("[data-cy=answer]").eq(2).contains("A new answer");
    cy.get("[data-cy=answer]").eq(2).find("[data-cy=new-icon]");
    cy.get("[data-cy=answer]").eq(3).contains("Removed Question 5");
    cy.get("[data-cy=answer]").eq(3).contains("Removed Answer 5");
    cy.get("[data-cy=answer]").eq(3).find("[data-cy=remove-icon]");
  });

  it("new subject names can be edited", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: clintNew,
      subjects: [allSubjects],
      gqlQueries: [
        mockGQL("Questions", { questions: questions }),
        mockGQL("MentorExport", { mentorExport: exportJson }),
        mockGQL("MentorImport", { me: { mentorImport: clint } }),
        mockGQL("MentorImportPreview", {
          mentorImportPreview: {
            ...importPreview,
          },
        }),
        mockGQL("ImportTask", { importTask: null }),
      ],
    });
    cy.visit("/importexport");
    cy.fixture("mentor-import.json").then((fileContent) => {
      cy.get("[data-cy=upload-mentor]").attachFile({
        fileContent: fileContent,
        fileName: "mentor-import.json",
        mimeType: "application/json",
      });
    });
    cy.contains("Confirm Import?");
    cy.get("[data-cy=subjects]").within(($within) => {
      cy.get("[data-cy=subject]")
        .eq(1)
        .within(() => {
          cy.get("[data-cy=subject-title-edit]").clear().type("Hello, world!");
          cy.get("[data-cy=save-subject-name-icon]").should("be.visible");
        });
    });
  });

  it("new subjects can be mapped to existing subjects", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: clintNew,
      subjects: [allSubjects],
      gqlQueries: [
        mockGQL("Questions", { questions: questions }),
        mockGQL("MentorExport", { mentorExport: exportJson }),
        mockGQL("MentorImport", { me: { mentorImport: clint } }),
        mockGQL("MentorImportPreview", {
          mentorImportPreview: {
            ...importPreview,
          },
        }),
        mockGQL("ImportTask", { importTask: null }),
      ],
    });
    cy.visit("/importexport");
    cy.fixture("mentor-import.json").then((fileContent) => {
      cy.get("[data-cy=upload-mentor]").attachFile({
        fileContent: fileContent,
        fileName: "mentor-import.json",
        mimeType: "application/json",
      });
    });
    cy.contains("Confirm Import?");
    cy.get("[data-cy=subjects]").within(($within) => {
      cy.get("[data-cy=subject]")
        .eq(1)
        .within(() => {
          cy.get("[data-cy=subject-input]").should("exist");
        });
    });
  });

  it("new questions question and category can be mapped", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: clintNew,
      subjects: [allSubjects],
      gqlQueries: [
        mockGQL("Questions", { questions: questions }),
        mockGQL("MentorExport", { mentorExport: exportJson }),
        mockGQL("MentorImport", { me: { mentorImport: clint } }),
        mockGQL("MentorImportPreview", {
          mentorImportPreview: {
            ...importPreview,
          },
        }),
        mockGQL("ImportTask", { importTask: null }),
      ],
    });
    cy.visit("/importexport");
    cy.fixture("mentor-import.json").then((fileContent) => {
      cy.get("[data-cy=upload-mentor]").attachFile({
        fileContent: fileContent,
        fileName: "mentor-import.json",
        mimeType: "application/json",
      });
    });
    cy.contains("Confirm Import?");
    cy.get("[data-cy=subjects]").within(($within) => {
      cy.get("[data-cy=subject]")
        .eq(0)
        .within(() => {
          cy.get("[data-cy=toggle]").click();
          cy.get("[data-cy=new-questions]").within(() => {
            cy.get("[data-cy=question]").within(() => {
              cy.get("[data-cy=category-remap-input]").should("exist");
              cy.get("[data-cy=question-input]").should("exist");
            });
          });
        });
    });
  });
});
