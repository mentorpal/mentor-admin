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
import importJson from "../fixtures/imports/import";
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

describe("Import", () => {
  // it("exports mentor and downloads file", () => {
  //   cy.exec("rm cypress/downloads/*", { log: true, failOnNonZeroExit: false });
  //   cySetup(cy);
  //   cyMockDefault(cy, {
  //     mentor: [clint],
  //     gqlQueries: [mockGQL("MentorExport", { mentorExport: exportJson })],
  //   });
  //   cy.visit("/importexport");
  //   cy.get("[data-cy=download-mentor]").trigger("mouseover").click();
  //   cy.task("isExistFile", "mentor.json").should("equal", true);
  // });
  // it("uploads import json and views import preview", () => {
  //   cySetup(cy);
  //   cyMockDefault(cy, {
  //     mentor: clintNew,
  //     subjects: [allSubjects],
  //     gqlQueries: [
  //       mockGQL("Questions", { questions: questions }),
  //       mockGQL("MentorExport", { mentorExport: exportJson }),
  //       mockGQL("MentorImport", { me: { mentorImport: clint } }),
  //       mockGQL("MentorImportPreview", {
  //         mentorImportPreview: importPreview,
  //       }),
  //     ],
  //   });
  //   cy.visit("/importexport");
  //   cy.fixture("mentor-import.json").then((fileContent) => {
  //     cy.get("[data-cy=upload-mentor]").attachFile({
  //       fileContent: fileContent.toString(),
  //       fileName: "mentor-import.json",
  //       mimeType: "text/json",
  //     });
  //   });
  // });
});
