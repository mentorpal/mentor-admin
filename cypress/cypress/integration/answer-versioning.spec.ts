/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  videoMentor,
  videoQuestions,
} from "../fixtures/recording/video_mentors";
import {
  cyAttachUpload,
  cyMockDefault,
  cyMockVttUpload,
  mockGQL,
} from "../support/functions";
import { taskListBuild, uploadTaskMediaBuild } from "../support/helpers";
import { Mentor } from "../support/types";

const singlePreviousVersionsMentor: Mentor = {
  ...videoMentor,
  answers: videoMentor.answers.map((a) => ({
    ...a,
    vttMedia: {
      ...a.vttMedia,
      vttText: "vtt test text",
      type: "subtitles",
      tag: "en",
      url: "old-vtt-url",
    },
    previousVersions: [
      {
        transcript: "previous transcript 1",
        vttText: "previous vtt 1",
        webVideoHash: "previous hash 1",
        videoDuration: 100,
        dateVersioned: "1689363024446",
      },
      {
        transcript: "previous transcript 2",
        vttText: "previous vtt 2",
        webVideoHash: "previous hash 2",
        videoDuration: 200,
        dateVersioned: "1689363024446",
      },
      {
        transcript: "previous transcript 3",
        vttText: "previous vtt 3",
        webVideoHash: "previous hash 3",
        videoDuration: 300,
        dateVersioned: "1689363024446",
      },
    ],
  })),
};

describe("answer versioning", () => {
  describe("versions UI", () => {
    it("versions icon disabled if no previous versions", () => {
      cyMockDefault(cy, {
        mentor: [videoMentor],
        questions: videoQuestions,
      });
      cy.visit("/record");
      cy.get("[data-cy=versions-icon]").should("be.disabled");
    });

    it("versions icon enabled if previous versions", () => {
      cyMockDefault(cy, {
        mentor: [singlePreviousVersionsMentor],
        questions: videoQuestions,
      });
      cy.visit("/record");
      cy.get("[data-cy=versions-icon]").should("be.enabled");
    });

    it("can open and view previous versions", () => {
      cyMockDefault(cy, {
        mentor: [singlePreviousVersionsMentor],
        questions: videoQuestions,
      });
      cy.visit("/record");
      cy.get("[data-cy=versions-icon]").should("be.enabled");
      cy.get("[data-cy=versions-icon]").click();
      cy.get("[data-cy=versions-dialog]").should("be.visible");
      cy.get("[data-cy=previous-version]").should("be.visible");
      cy.get("[data-cy=previous-version]").should(
        "contain.text",
        "previous transcript 1"
      );
      cy.get("[data-cy=previous-version]").should(
        "contain.text",
        "previous vtt 1"
      );
      cy.get("[data-cy=previous-version]").should(
        "contain.text",
        "Date Versioned: 7/14/2023"
      );

      cy.get("[data-cy=versions-dialog-pagination]").within(() => {
        cy.get("[data-cy=single-right]").click();
      });

      cy.get("[data-cy=previous-version]").should("be.visible");
      cy.get("[data-cy=previous-version]").should(
        "contain.text",
        "previous transcript 2"
      );
      cy.get("[data-cy=previous-version]").should(
        "contain.text",
        "previous vtt 2"
      );
      cy.get("[data-cy=previous-version]").should(
        "contain.text",
        "Date Versioned: 7/14/2023"
      );

      cy.get("[data-cy=versions-dialog-pagination]").within(() => {
        cy.get("[data-cy=single-right]").click();
      });

      cy.get("[data-cy=previous-version]").should("be.visible");
      cy.get("[data-cy=previous-version]").should(
        "contain.text",
        "previous transcript 3"
      );
      cy.get("[data-cy=previous-version]").should(
        "contain.text",
        "previous vtt 3"
      );
      cy.get("[data-cy=previous-version]").should(
        "contain.text",
        "Date Versioned: 7/14/2023"
      );
    });

    it("can only select one version at a time", () => {
      cyMockDefault(cy, {
        mentor: [singlePreviousVersionsMentor],
        questions: videoQuestions,
      });
      cy.visit("/record");
      cy.get("[data-cy=versions-icon]").should("be.enabled");
      cy.get("[data-cy=versions-icon]").click();
      cy.get("[data-cy=versions-dialog]").should("be.visible");

      cy.get("[data-cy=previous-version]").within(() => {
        cy.get("[data-cy=both-radio-button]").click();
        cy.get("[data-cy=both-radio-button]").get("input").should("be.checked");

        cy.get("[data-cy=transcript-radio-button]").click();
        cy.get("[data-cy=transcript-radio-button]").within(() => {
          cy.get("input").should("be.checked");
        });

        cy.get("[data-cy=both-radio-button]").scrollIntoView();
        cy.get("[data-cy=both-radio-button]").within(() => {
          cy.get("input").should("not.be.checked");
        });
      });
    });

    it("closing dialog resets selections", () => {
      cyMockDefault(cy, {
        mentor: [singlePreviousVersionsMentor],
        questions: videoQuestions,
      });
      cy.visit("/record");
      cy.get("[data-cy=versions-icon]").should("be.enabled");
      cy.get("[data-cy=versions-icon]").click();
      cy.get("[data-cy=versions-dialog]").should("be.visible");

      cy.get("[data-cy=previous-version]").within(() => {
        cy.get("[data-cy=both-radio-button]").click();
        cy.get("[data-cy=both-radio-button]").get("input").should("be.checked");
      });

      cy.get("[data-cy=versions-close-dialog-button]").click();

      cy.wait(1000);
      cy.get("[data-cy=versions-icon]").click();

      cy.get("[data-cy=previous-version]").within(() => {
        cy.get("[data-cy=both-radio-button]")
          .get("input")
          .should("not.be.checked");
      });
    });

    it("can use arrows to navigate versions", () => {
      cyMockDefault(cy, {
        mentor: [singlePreviousVersionsMentor],
        questions: videoQuestions,
      });
      cy.visit("/record");
      cy.get("[data-cy=versions-icon]").should("be.enabled");
      cy.get("[data-cy=versions-icon]").click();
      cy.get("[data-cy=versions-dialog]").should("be.visible");

      cy.get("[data-cy=previous-version]").should(
        "contain.text",
        "previous transcript 1"
      );
      cy.get("[data-cy=versions-dialog-pagination]").within(() => {
        cy.get("[data-cy=single-right]").click();
      });
      cy.get("[data-cy=previous-version]").should(
        "contain.text",
        "previous transcript 2"
      );
      cy.get("[data-cy=versions-dialog-pagination]").within(() => {
        cy.get("[data-cy=single-right]").click();
      });
      cy.get("[data-cy=previous-version]").should(
        "contain.text",
        "previous transcript 3"
      );
      cy.get("[data-cy=versions-dialog-pagination]").within(() => {
        cy.get("[data-cy=single-left]").click();
      });
      cy.get("[data-cy=previous-version]").should(
        "contain.text",
        "previous transcript 2"
      );
      cy.get("[data-cy=versions-dialog-pagination]").within(() => {
        cy.get("[data-cy=single-left]").click();
      });
      cy.get("[data-cy=previous-version]").should(
        "contain.text",
        "previous transcript 1"
      );

      cy.get("[data-cy=versions-dialog-pagination]").within(() => {
        cy.get("[data-cy=double-right]").click();
      });
      cy.get("[data-cy=previous-version]").should(
        "contain.text",
        "previous transcript 3"
      );
      cy.get("[data-cy=versions-dialog-pagination]").within(() => {
        cy.get("[data-cy=double-left]").click();
      });
      cy.get("[data-cy=previous-version]").should(
        "contain.text",
        "previous transcript 1"
      );
    });

    it("only shows transcript replacement if vtt not available", () => {
      cyMockDefault(cy, {
        mentor: [
          {
            ...singlePreviousVersionsMentor,
            answers: singlePreviousVersionsMentor.answers.map((a) => ({
              ...a,
              previousVersions: [
                {
                  transcript: "previous transcript 1",
                  vttText: "",
                  webVideoHash: "previous hash 1",
                  videoDuration: 100,
                  dateVersioned: "1689363024446",
                },
              ],
            })),
          },
        ],
        questions: videoQuestions,
      });
      cy.visit("/record");
      cy.get("[data-cy=versions-icon]").should("be.enabled");
      cy.get("[data-cy=versions-icon]").click();
      cy.get("[data-cy=versions-dialog]").should("be.visible");

      cy.get("[data-cy=previous-version]").should(
        "contain.text",
        "previous transcript 1"
      );
      cy.get("[data-cy=previous-version]").should("not.contain.text", "vtt");
      cy.get("[data-cy=previous-version]").within(() => {
        cy.get("[data-cy=transcript-radio-button]")
          .should("exist")
          .should("be.visible");
        cy.get("[data-cy=both-radio-button]").should("not.exist");
        cy.get("[data-cy=vtt-radio-button]").should("not.exist");
      });
    });
  });

  describe("answsers are versioned when:", () => {
    it("transcript is edited", () => {
      cyMockDefault(cy, {
        mentor: [singlePreviousVersionsMentor],
        questions: videoQuestions,
      });
      cy.visit("/record?videoId=A2_1_1&videoId=A3_1_1");

      cy.get("[data-cy=versions-icon]").click();
      cy.get("[data-cy=previous-version]").within(() => {
        cy.get("[data-cy=transcript]").should(
          "have.text",
          "previous transcript 1"
        );
      });
      cy.get("[data-cy=versions-close-dialog-button]").click();

      cy.get(".editor-class").type(". Edited Transcript");
      cy.get("[data-cy=next-btn]").click();
      cy.get("[data-cy=transcript]").should(
        "contain.text",
        "In Howard City, Michigan"
      );
      cy.get("[data-cy=back-btn]").click();

      // check that previous version was stored
      cy.get("[data-cy=versions-icon]").click();
      cy.get("[data-cy=versions-dialog]").should("be.visible");

      cy.get("[data-cy=previous-version]").within(() => {
        cy.get("[data-cy=transcript]").should("have.text", "I'm 37 years old");
      });

      cy.get("[data-cy=versions-dialog-pagination]").within(() => {
        cy.get("[data-cy=single-right]").click();
      });

      cy.get("[data-cy=previous-version]").within(() => {
        cy.get("[data-cy=transcript]").should(
          "have.text",
          "previous transcript 1"
        );
      });
    });

    it("subsequent videos are uploaded", () => {
      cyMockDefault(cy, {
        mentor: [singlePreviousVersionsMentor],
        questions: videoQuestions,
        gqlQueries: [
          mockGQL("FetchUploadTasks", [
            {
              me: {
                uploadTasks: [
                  {
                    question: {
                      _id: videoMentor.answers[1].question._id,
                      question: videoMentor.answers[1].question.question,
                    },
                    ...taskListBuild("DONE"),
                    ...uploadTaskMediaBuild(),
                    transcript: "i am aaron",
                  },
                ],
              },
            },
          ]),
        ],
      });
      cy.visit("/record?videoId=A2_1_1");
      cyAttachUpload(cy).then(() => {
        // upload video
        cy.get("[data-cy=upload-video]").trigger("mouseover").click();
        cy.wait(3000);
        cy.get(".editor-class").within(($input) => {
          cy.get("[data-text]").should("have.text", "i am aaron");
        });

        // check that previous version was stored
        cy.get("[data-cy=versions-icon]").click();
        cy.get("[data-cy=versions-dialog]").should("be.visible");

        cy.get("[data-cy=previous-version]").within(() => {
          cy.get("[data-cy=transcript]").should(
            "have.text",
            "I'm 37 years old"
          );
        });

        cy.get("[data-cy=versions-dialog-pagination]").within(() => {
          cy.get("[data-cy=single-right]").click();
        });

        cy.get("[data-cy=previous-version]").within(() => {
          cy.get("[data-cy=transcript]").should(
            "have.text",
            "previous transcript 1"
          );
        });
      });
    });

    it("video upload + trim", () => {
      cyMockDefault(cy, {
        mentor: [singlePreviousVersionsMentor],
        questions: videoQuestions,
        gqlQueries: [
          mockGQL("FetchUploadTasks", [
            {
              me: {
                uploadTasks: [
                  {
                    question: {
                      _id: videoMentor.answers[1].question._id,
                      question: videoMentor.answers[1].question.question,
                    },
                    ...taskListBuild("DONE"),
                    ...uploadTaskMediaBuild(),
                    transcript: "i am aaron",
                  },
                ],
              },
            },
          ]),
        ],
      });
      cy.visit("/record?videoId=A2_1_1");
      cyAttachUpload(cy).then(() => {
        // upload video
        cy.get("[data-cy=upload-video]").trigger("mouseover").click();
        cy.wait(3000);
        cy.get(".editor-class").within(($input) => {
          cy.get("[data-text]").should("have.text", "i am aaron");
        });

        cy.get("[data-cy=slider]")
          .invoke("mouseover")
          .trigger("mousedown", { button: 0 });

        cy.get("[data-cy=upload-video]").trigger("mouseover").click();
        cy.get("[data-cy=close-error-dialog]").click();

        // check that previous version was stored
        cy.get("[data-cy=versions-icon]").click();
        cy.get("[data-cy=versions-dialog]").should("be.visible");

        cy.get("[data-cy=previous-version]").within(() => {
          cy.get("[data-cy=transcript]").should("have.text", "i am aaron");
        });

        cy.get("[data-cy=versions-dialog-pagination]").within(() => {
          cy.get("[data-cy=single-right]").click();
        });

        cy.get("[data-cy=previous-version]").within(() => {
          cy.get("[data-cy=transcript]").should(
            "have.text",
            "I'm 37 years old"
          );
        });
      });
    });

    it("second transcript", () => {
      cyMockDefault(cy, {
        mentor: [videoMentor],
        questions: videoQuestions,
      });
      cy.visit("/record");

      cy.get(".editor-class").type(". Edited Transcript");
      cy.get("[data-cy=next-btn]").click();
      cy.get("[data-cy=transcript]").should("contain.text", "I'm 37 years old");
      cy.get("[data-cy=back-btn]").click();
      cy.get("[data-cy=versions-icon]").should("not.be.enabled");

      cy.get(".editor-class").type(". Edited Transcript. Second Time");
      cy.get("[data-cy=next-btn]").click();
      cy.get("[data-cy=transcript]").should("contain.text", "I'm 37 years old");
      cy.get("[data-cy=back-btn]").click();
      cy.get("[data-cy=versions-icon]").should("be.enabled");

      // check that previous version was stored
      cy.get("[data-cy=versions-icon]").click();
      cy.get("[data-cy=versions-dialog]").should("be.visible");

      cy.get("[data-cy=previous-version]").within(() => {
        cy.get("[data-cy=transcript]").should(
          "have.text",
          ". Edited Transcript"
        );
      });
    });
  });

  describe("answers are not versioned when:", () => {
    it("first upload", () => {
      cyMockDefault(cy, {
        mentor: [videoMentor],
        questions: videoQuestions,
        gqlQueries: [
          mockGQL("FetchUploadTasks", [
            {
              me: {
                uploadTasks: [
                  {
                    question: {
                      _id: videoMentor.answers[0].question._id,
                      question: videoMentor.answers[0].question.question,
                    },
                    ...taskListBuild("DONE"),
                    ...uploadTaskMediaBuild(),
                    transcript: "i am aaron",
                  },
                ],
              },
            },
          ]),
        ],
      });
      cy.visit("/record?videoId=A1_1_1");
      cyAttachUpload(cy).then(() => {
        // upload video
        cy.get("[data-cy=upload-video]").trigger("mouseover").click();
        cy.wait(3000);
        cy.get(".editor-class").within(($input) => {
          cy.get("[data-text]").should("have.text", "i am aaron");
        });

        cy.get("[data-cy=versions-icon]").should("not.be.enabled");
      });
    });

    it("first transcript", () => {
      cyMockDefault(cy, {
        mentor: [videoMentor],
        questions: videoQuestions,
      });
      cy.visit("/record");

      cy.get(".editor-class").type(". Edited Transcript");
      cy.get("[data-cy=next-btn]").click();
      cy.get("[data-cy=transcript]").should("contain.text", "I'm 37 years old");
      cy.get("[data-cy=back-btn]").click();
      cy.get("[data-cy=versions-icon]").should("not.be.enabled");
    });
  });

  describe("changing versions", () => {
    it("can change vtt only", () => {
      cyMockDefault(cy, {
        mentor: [{ ...singlePreviousVersionsMentor, isAdvanced: true }],
        questions: videoQuestions,
      });
      cyMockVttUpload(cy, "new vtt text", "new vtt path");
      cy.visit("/record?videoId=A2_1_1");

      cy.get("[data-cy=transcript]").should("contain.text", "I'm 37 years old");

      cy.get("[data-cy=versions-icon]").click();
      cy.get("[data-cy=versions-dialog]").should("be.visible");

      cy.get("[data-cy=previous-version]").within(() => {
        cy.get("[data-cy=vtt-radio-button]").click();
      });
      cy.get("[data-cy=replace-dialog-button]").click();
      // verify
      cy.get("[data-cy=transcript]").should("contain.text", "I'm 37 years old");
      cy.get("[data-cy=preview-vtt-file]").click();
      cy.get("[data-cy=long-text-display-dialog]")
        .should("be.visible")
        .should("contain.text", "new vtt text");
    });

    it("can change transcript only", () => {
      cyMockDefault(cy, {
        mentor: [{ ...singlePreviousVersionsMentor, isAdvanced: true }],
        questions: videoQuestions,
      });
      cyMockVttUpload(cy, "new vtt text", "new vtt path");
      cy.visit("/record?videoId=A2_1_1");

      cy.get("[data-cy=transcript]").should("contain.text", "I'm 37 years old");

      cy.get("[data-cy=versions-icon]").click();
      cy.get("[data-cy=versions-dialog]").should("be.visible");

      cy.get("[data-cy=previous-version]").within(() => {
        cy.get("[data-cy=transcript-radio-button]").click();
      });
      cy.get("[data-cy=replace-dialog-button]").click();
      // verify
      cy.get("[data-cy=transcript]").should(
        "contain.text",
        "previous transcript 1"
      );
      cy.get("[data-cy=preview-vtt-file]").click();
      cy.get("[data-cy=long-text-display-dialog]")
        .should("be.visible")
        .should("contain.text", "vtt test text");
    });

    it("can change both", () => {
      cyMockDefault(cy, {
        mentor: [{ ...singlePreviousVersionsMentor, isAdvanced: true }],
        questions: videoQuestions,
      });
      cyMockVttUpload(cy, "new vtt text", "new vtt path");
      cy.visit("/record?videoId=A2_1_1");

      cy.get("[data-cy=transcript]").should("contain.text", "I'm 37 years old");

      cy.get("[data-cy=versions-icon]").click();
      cy.get("[data-cy=versions-dialog]").should("be.visible");

      cy.get("[data-cy=previous-version]").within(() => {
        cy.get("[data-cy=both-radio-button]").click();
      });
      cy.get("[data-cy=replace-dialog-button]").click();
      // verify
      cy.get("[data-cy=transcript]").should(
        "contain.text",
        "previous transcript 1"
      );
      cy.get("[data-cy=preview-vtt-file]").click();
      cy.get("[data-cy=long-text-display-dialog]")
        .should("be.visible")
        .should("contain.text", "new vtt text");
    });

    it("selecting a version removes it from the list and adds replaced to list", () => {
      cyMockDefault(cy, {
        mentor: [{ ...singlePreviousVersionsMentor, isAdvanced: true }],
        questions: videoQuestions,
      });
      cyMockVttUpload(cy, "new vtt text", "new vtt path");
      cy.visit("/record?videoId=A2_1_1");

      cy.get("[data-cy=versions-icon]").click();
      cy.get("[data-cy=versions-dialog]").should("be.visible");
      cy.get("[data-cy=previous-version]").should(
        "contain.text",
        "previous transcript 1"
      );

      cy.get("[data-cy=versions-dialog-pagination]").within(() => {
        cy.get("[data-cy=single-right]").click();
      });

      cy.get("[data-cy=previous-version]").should(
        "contain.text",
        "previous transcript 2"
      );
      cy.get("[data-cy=versions-close-dialog-button]").click();

      cy.get("[data-cy=transcript]").should("contain.text", "I'm 37 years old");

      cy.get("[data-cy=versions-icon]").click();
      cy.get("[data-cy=versions-dialog]").should("be.visible");

      cy.get("[data-cy=previous-version]").within(() => {
        cy.get("[data-cy=both-radio-button]").click();
      });
      cy.get("[data-cy=replace-dialog-button]").click();
      cy.get("[data-cy=transcript]").should(
        "contain.text",
        "previous transcript 1"
      );

      cy.get("[data-cy=versions-icon]").click();
      cy.get("[data-cy=versions-dialog]").should("be.visible");
      cy.get("[data-cy=previous-version]").should(
        "contain.text",
        "I'm 37 years old"
      );
      cy.get("[data-cy=versions-dialog-pagination]").within(() => {
        cy.get("[data-cy=single-right]").click();
      });
      cy.get("[data-cy=previous-version]").should(
        "contain.text",
        "previous transcript 2"
      );
    });
  });
});
