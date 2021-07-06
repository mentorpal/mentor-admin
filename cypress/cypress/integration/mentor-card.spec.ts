/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { cySetup, cyMockDefault } from "../support/functions";
import clint from "../fixtures/mentor/clint_home";
import { Status, QuestionType, UtteranceName } from "../support/types";

describe("Mentor Card on My Mentor Page", () => {
  it("mentor card contains correct data", () => {
    cySetup(cy);
    cyMockDefault(cy, { mentor: clint });
    cy.visit("/");
    cy.get("[data-cy=my-mentor-card]").contains("Clinton Anderson");
    cy.get("[data-cy=my-mentor-card]").contains("Video Mentor");
    cy.get("[data-cy=my-mentor-card]").contains(
      "Title: Nuclear Electrician's Mate"
    );
    cy.get("[data-cy=my-mentor-card]").contains("Last Trained: Today");
    cy.get("[data-cy=my-mentor-card]").contains("Scope: Incomplete");
    cy.get("[data-cy=my-mentor-card]").contains(
      "This Mentor can't be built yet."
    );
    cy.get("[data-cy=stage-progress]").should("exist");
    cy.get("[data-cy=my-mentor-card]")
      .find("[data-cy=next-stage-info]")
      .trigger("mouseover");
    cy.contains("This Mentor can select questions from a list");
    cy.get("[data-cy=thumbnail-wrapper]").trigger("mouseover");
    cy.get("[data-cy=upload-file]").should("exist");
    cy.get("[data-cy=bash-button]").should("exist");
  });

  it("shows placeholder when no thumbnail", () => {
    cySetup(cy);
    const testClint = {
      ...clint,
      thumbnail: "",
    };
    cyMockDefault(cy, { mentor: testClint });
    cy.visit("/");
    cy.get("[data-cy=placeholder-thumbnail]").should("exist");
  });

  it("switches to new image when uploaded", () => {
    cySetup(cy);
    const testClint = {
      ...clint,
      thumbnail: "url",
    };
    cyMockDefault(cy, { mentor: testClint });
    cy.visit("/");

    cy.get("[data-cy=uploaded-thumbnail]").should("exist");
  });

  it("does not show toast on incomplete level", () => {
    cySetup(cy);
    cyMockDefault(cy, { mentor: clint });
    cy.visit("/");
    cy.get("[data-cy=stage-toast]").should("not.exist");
  });

  it("shows mentor scope toast on stage floor", () => {
    cySetup(cy);
    const testClint = {
      ...clint,
      answers: clint.answers.map((a, i) => {
        return i !== 4
          ? a
          : {
              ...a,
              status: Status.COMPLETE,
            };
      }),
    };
    cyMockDefault(cy, { mentor: testClint });
    cy.visit("/");
    cy.get("[data-cy=stage-toast]").contains(
      "Your mentor has reached the Scripted stage!"
    );
    cy.get("[data-cy=stage-toast]").contains("You have 5 total questions.");
  });

  it("does not show progress bar at maxed level", () => {
    cySetup(cy);
    const testClint = {
      ...clint,
      answers: [
        ...Array(1000)
          .fill(0)
          .map((x) => ({
            _id: "A1_1_1",
            question: {
              _id: "A1_1_1",
              question: "Who are you and what do you do?",
              type: QuestionType.QUESTION,
              name: null,
              paraphrases: [],
            },
            transcript:
              "My name is Clint Anderson and I'm a Nuclear Electrician's Mate",
            status: Status.COMPLETE,
          })),
      ],
    };
    cyMockDefault(cy, { mentor: testClint });
    cy.visit("/");
    cy.get("[data-cy=my-mentor-card]").contains("Scope: Life-Story");
    cy.get("[data-cy=stage-progress]").should("not.exist");
  });
});
describe("Bash Button Guides User To Improve Mentor", () => {
  const bashClint = {
    ...clint,
  };

  it("Asks user without thumbnail to upload one", () => {
    cySetup(cy);
    bashClint.thumbnail = "";
    cyMockDefault(cy, { mentor: bashClint });
    cy.visit("/");
    cy.get("[data-cy=bash-button]").contains("Add a Thumbnail");
  });

  it("Asks user with thumbnail and without idle video to upload one", () => {
    cySetup(cy);
    bashClint.thumbnail = "url";
    (bashClint.answers = [
      {
        status: Status.INCOMPLETE,
        _id: "idletest",
        transcript:
          "This is an idle calibration video. Please get into position and look at the camera without speaking or moving",
        question: {
          _id: "idletest",
          question:
            "This is an idle calibration video. Please get into position and look at the camera without speaking or moving",
          type: undefined,
          paraphrases: undefined,
          name: UtteranceName.IDLE,
        },
      },
    ]),
      cyMockDefault(cy, { mentor: bashClint });
    cy.visit("/");
    cy.get("[data-cy=bash-button]").contains("Record an Idle Video");
    cy.get("[data-cy=bash-button]").trigger("mouseover").click();
    cy.url().should("include", "videoId=idletest");
  });

  it("Asks user with thumbnail and idle video to add a subject", () => {
    cySetup(cy);
    bashClint.answers[0].status = Status.COMPLETE;
    cyMockDefault(cy, { mentor: bashClint });
    cy.visit("/");
    cy.get("[data-cy=bash-button]").contains("Add a Subject");
    cy.get("[data-cy=bash-button]").trigger("mouseover").click();
    cy.url().should("include", "/subjects");
  });
});
