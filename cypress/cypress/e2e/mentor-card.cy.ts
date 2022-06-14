/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  cySetup,
  cyMockDefault,
  mockGQL,
  cyMockUploadThumbnail,
  cyAttachInputFile,
} from "../support/functions";
import clint from "../fixtures/mentor/clint_home";
import {
  Status,
  QuestionType,
  UtteranceName,
  SubjectTypes,
} from "../support/types";

describe("My Mentor Page", () => {
  describe("Mentor Card", () => {
    describe("Shows correct mentor info and allows editing.", () => {
      it("views, saves, and updates profile data", () => {
        cySetup(cy);
        cyMockDefault(cy, {
          mentor: [
            { ...clint, name: "d", firstName: "d", title: "d" },
            { ...clint, name: "Clinton Anderson", firstName: "d", title: "d" },
            {
              ...clint,
              name: "Clinton Anderson",
              firstName: "Clint",
              title: "d",
            },
            {
              ...clint,
              name: "Clinton Anderson",
              firstName: "Clint",
              title: "Nuclear Electrician's Mate",
            },
          ],
          gqlQueries: [
            mockGQL("UpdateMentorDetails", {
              me: { updateMentorDetails: true },
            }),
            mockGQL("UpdateSubject", {
              me: { updateSubject: {} },
            }),
          ],
        });
        cy.visit("/");
        cy.get("[data-cy=setup-no]").trigger("mouseover").click();
        cy.get("[data-cy=edit-mentor-data]").trigger("mouseover").click();

        cy.get("[data-cy=mentor-name]").within(($input) => {
          cy.get("input").should("have.value", "d");
        });
        cy.get("[data-cy=mentor-first-name]").within(($input) => {
          cy.get("input").should("have.value", "d");
        });
        cy.get("[data-cy=mentor-job-title]").within(($input) => {
          cy.get("input").should("have.value", "d");
        });

        // fill out full name and save
        cy.get("[data-cy=mentor-name]").type("Clinton Anderson");
        cy.get("[data-cy=close-modal]").trigger("mouseover").click();

        cy.get("[data-cy=save-button]").should("not.be.disabled");
        cy.get("[data-cy=save-button]").trigger("mouseover").click();

        //  open modal
        cy.get("[data-cy=edit-mentor-data]").trigger("mouseover").click();
        cy.get("[data-cy=mentor-name]").within(($input) => {
          cy.get("input").should("have.value", "Clinton Anderson");
        });
        cy.get("[data-cy=mentor-first-name]").within(($input) => {
          cy.get("input").should("have.value", "d");
        });
        cy.get("[data-cy=mentor-job-title]").within(($input) => {
          cy.get("input").should("have.value", "d");
        });

        // fill out first name and save
        cy.get("[data-cy=mentor-first-name]").type("Clint");
        cy.get("[data-cy=close-modal]").trigger("mouseover").click();

        cy.get("[data-cy=save-button]").should("not.be.disabled");
        cy.get("[data-cy=save-button]").trigger("mouseover").click();

        //  open modal
        cy.get("[data-cy=edit-mentor-data]").trigger("mouseover").click();
        cy.get("[data-cy=mentor-name]").within(($input) => {
          cy.get("input").should("have.value", "Clinton Anderson");
        });
        cy.get("[data-cy=mentor-first-name]").within(($input) => {
          cy.get("input").should("have.value", "Clint");
        });
        cy.get("[data-cy=mentor-job-title]").within(($input) => {
          cy.get("input").should("have.value", "d");
        });

        // fill out title and save
        cy.get("[data-cy=mentor-job-title]").type("Nuclear Electrician's Mate");
        cy.get("[data-cy=close-modal]").trigger("mouseover").click();

        cy.get("[data-cy=save-button]").should("not.be.disabled");
        cy.get("[data-cy=save-button]").trigger("mouseover").click();

        //  open modal
        cy.get("[data-cy=edit-mentor-data]").trigger("mouseover").click();
        cy.get("[data-cy=mentor-name]").within(($input) => {
          cy.get("input").should("have.value", "Clinton Anderson");
        });
        cy.get("[data-cy=mentor-first-name]").within(($input) => {
          cy.get("input").should("have.value", "Clint");
        });
        cy.get("[data-cy=mentor-job-title]").within(($input) => {
          cy.get("input").should("have.value", "Nuclear Electrician's Mate");
        });
        cy.get("[data-cy=close-modal]").trigger("mouseover").click();

        cy.get("[data-cy=mentor-card-trained]").contains("Last Trained: Today");

        cy.get("[data-cy=my-mentor-card]").contains(
          "Current Status: Incomplete"
        );
        cy.get("[data-cy=my-mentor-card]").contains(
          "This Mentor can't be built yet."
        );
        cy.get("[data-cy=stage-progress]").should("exist");
        cy.get("[data-cy=my-mentor-card]")
          .find("[data-cy=next-stage-info]")
          .trigger("mouseover");
        cy.contains("This Mentor can select questions from a list");
        cy.get("[data-cy=uploaded-thumbnail]").trigger("mouseover");
        cy.get("[data-cy=upload-file]").should("exist");
        cy.get("[data-cy=recommended-action-button]").should("exist");
      });
    });

    it("shows placeholder when no thumbnail", () => {
      cySetup(cy);
      cyMockDefault(cy, {
        mentor: {
          ...clint,
          thumbnail: "",
        },
      });
      cy.visit("/");
    });

    it("displays mentor's thumbnail when configured", () => {
      cySetup(cy);

      cyMockDefault(cy, {
        mentor: {
          ...clint,
          thumbnail: "https://new.url/test.png",
        },
      });
      cy.visit("/");
      cy.get("[data-cy=uploaded-thumbnail]").should("exist");
    });

    it("displays new thumbnail after upload", () => {
      cySetup(cy);
      cyMockDefault(cy, {
        mentor: {
          ...clint,
          thumbnail: "/thumbnails/beforeupdate.png",
        },
      });
      cyMockUploadThumbnail(cy, {
        thumbnail: "/thumbnails/afterupdate.png",
      });
      cy.visit("/");
      cy.get("[data-cy=thumbnail-wrapper]").should(
        "have.attr",
        "thumbnail-src",
        "/thumbnails/beforeupdate.png"
      );
      cy.get("[data-cy=my-mentor-card]").within(($uploadForm) => {
        cyAttachInputFile(cy, { fileName: "image-thumbnail-uploaded.png" });
        cy.wait("@uploadThumbnail");
        cy.get("[data-cy=thumbnail-wrapper]").should(
          "have.attr",
          "thumbnail-src",
          "/thumbnails/afterupdate.png"
        );
      });
    });

    it("does not show toast on incomplete level", () => {
      cySetup(cy);
      cyMockDefault(cy, { mentor: clint });
      cy.visit("/");
      cy.get("[data-cy=stage-toast]").should("not.exist");
    });

    it("shows mentor scope toast on stage floor", () => {
      cySetup(cy);
      cyMockDefault(cy, {
        mentor: {
          ...clint,
          answers: clint.answers.map((a, i) => {
            return i !== 4
              ? a
              : {
                  ...a,
                  status: Status.COMPLETE,
                };
          }),
        },
      });
      cy.visit("/");
      cy.get("[data-cy=stage-toast]").contains(
        "Your mentor has reached the Scripted stage!"
      );
      cy.get("[data-cy=stage-toast]").contains("You have 5 total questions.");
    });

    it("does not show progress bar at maxed level", () => {
      cySetup(cy);

      cyMockDefault(cy, {
        mentor: {
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
        },
      });
      cy.visit("/");
      cy.get("[data-cy=my-mentor-card]").contains("Current Status: Life-Story");
      cy.get("[data-cy=stage-progress]").should("not.exist");
    });
  });
  describe("Bash Button Guides User To Improve Mentor", () => {
    it("Asks user without thumbnail to upload one", () => {
      cySetup(cy);
      cyMockDefault(cy, { mentor: { ...clint, thumbnail: "" } });
      cy.visit("/");
      cy.get("[data-cy=recommended-action]").contains("Add a Thumbnail");
      cy.get("[data-cy=recommended-action-thumbnail]").should("exist");
      cy.get("[data-cy=recommended-action-upload]").should("be.hidden");
    });

    it("Asks user with thumbnail and without idle video to upload one", () => {
      cySetup(cy);
      cyMockDefault(cy, {
        mentor: {
          ...clint,
          thumbnail: "https://new.url/test.png",
          answers: clint.answers.map((a) => {
            if (a.question._id === "A3_1_1") {
              a.status = Status.INCOMPLETE;
            }
            return a;
          }),
        },
      });
      cy.visit("/");
      cy.get("[data-cy=setup-no]").trigger("mouseover").click();
      cy.get("[data-cy=recommended-action]").contains("Record an Idle Video");
      cy.get("[data-cy=recommended-action-button]")
        .trigger("mouseover")
        .click();
      cy.url().should("include", "videoId=A3_1_1");
    });

    it("Asks user with incomplete required subjects to finish them.", () => {
      cySetup(cy);
      cyMockDefault(cy, {
        mentor: {
          ...clint,
          thumbnail: "https://new.url/test.png",
          answers: clint.answers.map((a) => {
            if (a.question.type === QuestionType.UTTERANCE) {
              a.status = Status.INCOMPLETE;
            }
            if (a.question.name === UtteranceName.IDLE) {
              a.status = Status.COMPLETE;
            }
            return a;
          }),
        },
      });
      cy.visit("/");
      cy.get("[data-cy=setup-no]").trigger("mouseover").click();
      cy.get("[data-cy=recommended-action]").contains("Add Your Intro");
      cy.get("[data-cy=recommended-action-button]")
        .trigger("mouseover")
        .click();
      cy.url().should("include", "/record");
    });

    it("Asks user with unbuildable mentor to answer enough questions", () => {
      cySetup(cy);
      cyMockDefault(cy, {
        mentor: {
          ...clint,
          answers: clint.answers.map((a) => {
            if (a.question.type === QuestionType.UTTERANCE)
              a.status = Status.COMPLETE;
            else a.status = Status.INCOMPLETE;
            return a;
          }),
        },
      });
      cy.visit("/");
      cy.get("[data-cy=recommended-action]").contains("Answer More Questions");
      cy.get("[data-cy=recommended-action-button]")
        .trigger("mouseover")
        .click();
      cy.url().should("include", "/record");
    });

    it("Asks user with buildable mentor to answer incomplete questions", () => {
      cySetup(cy);
      cyMockDefault(cy, {
        mentor: {
          ...clint,
          subjects: [
            ...clint.subjects,
            {
              _id: "extra",
              name: "extra",
              type: SubjectTypes.SUBJECT,
              description: "extra",
              categories: [],
              questions: [
                {
                  question: {
                    _id: "A1_1_6",
                    question: "additional question?",
                    type: QuestionType.QUESTION,
                    name: null,
                    paraphrases: [],
                  },
                  topics: [],
                  category: undefined,
                },
              ],
              isRequired: false,
              topics: [],
            },
          ],
          answers: [
            ...clint.answers.map((a) => {
              a.status = Status.COMPLETE;
              return a;
            }),
            {
              _id: "A1_1_6",
              question: {
                _id: "A1_1_6",
                question: "additional question?",
                type: QuestionType.QUESTION,
                name: null,
                paraphrases: [],
              },
              transcript: "additional answer",
              status: Status.INCOMPLETE,
            },
          ],
        },
      });
      cy.visit("/");
      cy.get("[data-cy=recommended-action]").contains("Answer extra Questions");
      cy.get("[data-cy=recommended-action-button]")
        .trigger("mouseover")
        .click();
      cy.url().should("include", "/record");
    });

    it("If user has added questions since last build, recommend building mentor.", () => {
      cySetup(cy);
      cyMockDefault(cy, {
        mentor: {
          ...clint,
          isDirty: true,
          answers: clint.answers.map((a) => {
            a.status = Status.COMPLETE;
            return a;
          }),
        },
      });
      cy.visit("/");
      cy.get("[data-cy=recommended-action]").contains("Build Your Mentor");
    });

    it("If user has completed previous suggestions, ask to add a subject", () => {
      cySetup(cy);
      cyMockDefault(cy, {
        mentor: {
          ...clint,
          isDirty: false,
          answers: clint.answers.map((a) => {
            a.status = Status.COMPLETE;
            return a;
          }),
        },
      });
      cy.visit("/");
      cy.get("[data-cy=recommended-action]").contains("Add a Subject");
      cy.get("[data-cy=recommended-action-button]")
        .trigger("mouseover")
        .click();
      cy.url().should("include", "/subjects");
    });

    describe("Skip Button allows user to see next recommendation.", () => {
      it("Skip button shows user next recommendation.", () => {
        cySetup(cy);
        cyMockDefault(cy, {
          mentor: {
            ...clint,
            thumbnail: "https://new.url/test.png",
            answers: clint.answers.map((a) => {
              if (a.question.name === UtteranceName.IDLE) {
                a.status = Status.INCOMPLETE;
              }
              return a;
            }),
          },
        });
        cy.visit("/");
        cy.get("[data-cy=setup-no]").trigger("mouseover").click();
        cy.get("[data-cy=recommended-action]").contains("Record an Idle Video");
        cy.get("[data-cy=skip-action-button]").should("exist");
        cy.get("[data-cy=skip-action-button]").trigger("mouseover").click();
        cy.get("[data-cy=recommended-action]").contains(
          "Finish Required Questions"
        );
      });
    });
  });
});
