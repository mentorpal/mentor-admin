/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { cySetup, cyMockDefault, mockGQL } from "../support/functions";
import clint from "../fixtures/mentor/clint_home";
import clintNew from "../fixtures/mentor/clint_new";

describe("Import", () => {
  it("exports mentor", () => {
    cySetup(cy);
    cy.fixture("mentor-export.json").then((json) => {
      cyMockDefault(cy, {
        mentor: [clint],
        gqlQueries: [mockGQL("exportMentor", json, false)],
      });
      cy.visit("/importexport");
      cy.get("[data-cy=download-mentor]").trigger("mouseover").click();
    });
  });

  it.only("imports a mentor", () => {
    cySetup(cy);
    cy.fixture("mentor-export.json").then((exportJson) => {
      cyMockDefault(cy, {
        mentor: [clintNew],
        gqlQueries: [
          mockGQL("exportMentor", exportJson, false),
          mockGQL("importMentor", clint, true),
        ],
      });
      cy.visit("/importexport");
      cy.fixture("mentor-import.json").then((fileContent) => {
        cy.get("[data-cy=upload-mentor]").attachFile({
          fileContent: fileContent.toString(),
          fileName: "mentor-import.json",
          mimeType: "text/json",
        });
      });
    });
  });
});
