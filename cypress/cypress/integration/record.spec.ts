/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  cyMockDefault,
  mockGQL,
  cyMockFollowUpQuestions,
  cyAttachUpload,
  cyMockUpload,
} from "../support/functions";
import {
  Mentor,
  MentorType,
  QuestionType,
  Status,
  MediaType,
} from "../support/types";
import {
  completeMentor,
  completeQuestion,
  completeSubject,
  completeSubjectQuestion,
  updateMentorAnswer,
} from "../support/helpers";
import mentor from "../fixtures/mentor/clint_home";

const chatMentor: Mentor = completeMentor({
  _id: "clintanderson",
  mentorType: MentorType.CHAT,
  lastTrainedAt: null,
  subjects: [
    completeSubject({
      _id: "background",
      name: "background",
      categories: [{ id: "cat", name: "cat", description: "cat" }],
      questions: [
        completeSubjectQuestion({
          question: completeQuestion({
            _id: "A1_1_1",
            question: "Who are you and what do you do?",
            name: "A1_1_1",
            type: QuestionType.QUESTION,
            paraphrases: [],
          }),
          category: { id: "cat" },
          topics: [],
        }),
        completeSubjectQuestion({
          question: completeQuestion({
            _id: "A2_1_1",
            question: "How old are you now?",
          }),
          // mentor: "clintanderson",
        }),
      ],
    }),
    completeSubject({
      _id: "repeat_after_me",
      questions: [
        completeSubjectQuestion({
          question: completeQuestion({
            _id: "A3_1_1",
            question:
              "Please look at the camera for 30 seconds without speaking. Try to remain in the same position.",
          }),
        }),
        completeSubjectQuestion({
          question: completeQuestion({
            _id: "A4_1_1",
            question:
              "Please give a short introduction of yourself, which includes your name, current job, and title.",
          }),
        }),
        completeSubjectQuestion({
          question: completeQuestion({
            _id: "A5_1_1",
            question:
              "Please repeat the following: 'I couldn't understand the question. Try asking me something else.'",
          }),
        }),
        completeSubjectQuestion({
          question: completeQuestion({
            _id: "A6_1_1",
            question: "",
          }),
          // mentor: "notclint",
        }),
      ],
    }),
  ],
  answers: [
    {
      _id: "A1_1_1",
      question: completeQuestion({
        _id: "A1_1_1",
        question: "Who are you and what do you do?",
      }),
      transcript:
        "My name is Clint Anderson and I'm a Nuclear Electrician's Mate",
      status: Status.COMPLETE,
    },
    {
      _id: "A2_1_1",
      question: completeQuestion({
        _id: "A2_1_1",
        question: "How old are you now?",
        mentor: "clintanderson",
      }),
      transcript: "",
      status: Status.INCOMPLETE,
    },
    {
      _id: "A3_1_1",
      question: completeQuestion({
        _id: "A3_1_1",
        question:
          "Please look at the camera for 30 seconds without speaking. Try to remain in the same position.",
      }),
      transcript: "",
      status: Status.INCOMPLETE,
    },
    {
      _id: "A4_1_1",
      question: completeQuestion({
        _id: "A4_1_1",
        question:
          "Please give a short introduction of yourself, which includes your name, current job, and title.",
      }),
      transcript:
        "My name is Clint Anderson and I'm a Nuclear Electrician's Mate",
      status: Status.COMPLETE,
    },
    {
      _id: "A5_1_1",
      question: completeQuestion({
        _id: "A5_1_1",
        question:
          "Please repeat the following: 'I couldn't understand the question. Try asking me something else.'",
      }),
      transcript: "",
      status: Status.INCOMPLETE,
    },
  ],
});

const videoMentor: Mentor = completeMentor({
  _id: "clintanderson",
  mentorType: MentorType.VIDEO,
  lastTrainedAt: null,
  answers: [
    {
      _id: "A1_1_1",
      question: completeQuestion({
        _id: "A1_1_1",
        question: "Who are you and what do you do?",
      }),
      transcript: "",
      status: Status.INCOMPLETE,
    },
    {
      _id: "A2_1_1",
      question: completeQuestion({
        _id: "A2_1_1",
        question: "How old are you now?",
        mentor: "clintanderson",
      }),
      transcript: "I'm 37 years old",
      media: [
        {
          type: MediaType.VIDEO,
          tag: "web",
          url: "A2_1_1.mp4",
        },
      ],
      status: Status.COMPLETE,
    },
    {
      _id: "A3_1_1",
      question: completeQuestion({
        _id: "A3_1_1",
        question: "Where do you live?",
        mentor: "clintanderson",
      }),
      transcript: "In Howard City, Michigan",
      media: [
        {
          type: MediaType.VIDEO,
          tag: "web",
          url: "A3_1_1.mp4",
        },
      ],
      status: Status.COMPLETE,
    },
    {
      _id: "A4_1_1",
      question: completeQuestion({
        _id: "A4_1_1",
        question: "Record an idle video",
        mentor: "clintanderson",
        name: "_IDLE_",
      }),
      transcript: "",
      media: [
        {
          type: MediaType.VIDEO,
          tag: "web",
          url: "A3_1_1.mp4",
        },
      ],
      status: Status.COMPLETE,
    },
  ],
});

describe("Record", () => {
  describe("search params", () => {
    it("shows all questions if no filters", () => {
      cyMockDefault(cy, { mentor: chatMentor });
      cy.visit("/record");
      cy.get("[data-cy=progress]").contains("Questions 1 / 5");
      cy.get("[data-cy=question-input]").within(($input) => {
        cy.get("textarea").should(
          "have.text",
          "Who are you and what do you do?"
        );
        cy.get("textarea").should("have.attr", "disabled");
      });
      cy.get("[data-cy=transcript-input]").within(($input) => {
        cy.get("textarea").should(
          "have.text",
          "My name is Clint Anderson and I'm a Nuclear Electrician's Mate"
        );
        cy.get("textarea").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=status]").contains("Active");
      cy.get("[data-cy=back-btn]").should("be.disabled");
      cy.get("[data-cy=next-btn]").trigger("mouseover").click();

      cy.get("[data-cy=progress]").contains("Questions 2 / 5");
      cy.get("[data-cy=question-input]").within(($input) => {
        cy.get("textarea").should("have.text", "How old are you now?");
        cy.get("textarea").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=transcript-input]").within(($input) => {
        cy.get("textarea").should("have.text", "");
        cy.get("textarea").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=status]").contains("Skip");
      cy.get("[data-cy=back-btn]").should("not.be.disabled");
      cy.get("[data-cy=next-btn]").trigger("mouseover").click();

      cy.get("[data-cy=progress]").contains("Questions 3 / 5");
      cy.get("[data-cy=question-input]").within(($input) => {
        cy.get("textarea").should(
          "have.text",
          "Please look at the camera for 30 seconds without speaking. Try to remain in the same position."
        );
        cy.get("textarea").should("have.attr", "disabled");
      });
      cy.get("[data-cy=transcript-input]").within(($input) => {
        cy.get("textarea").should("have.text", "");
        cy.get("textarea").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=status]").contains("Skip");
      cy.get("[data-cy=back-btn]").should("not.be.disabled");
      cy.get("[data-cy=next-btn]").trigger("mouseover").click();

      cy.get("[data-cy=progress]").contains("Questions 4 / 5");
      cy.get("[data-cy=question-input]").within(($input) => {
        cy.get("textarea").should(
          "have.text",
          "Please give a short introduction of yourself, which includes your name, current job, and title."
        );
        cy.get("textarea").should("have.attr", "disabled");
      });
      cy.get("[data-cy=transcript-input]").within(($input) => {
        cy.get("textarea").should(
          "have.text",
          "My name is Clint Anderson and I'm a Nuclear Electrician's Mate"
        );
        cy.get("textarea").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=status]").contains("Active");
      cy.get("[data-cy=back-btn]").should("not.be.disabled");
      cy.get("[data-cy=next-btn]").trigger("mouseover").click();

      cy.get("[data-cy=progress]").contains("Questions 5 / 5");
      cy.get("[data-cy=question-input]").within(($input) => {
        cy.get("textarea").should(
          "have.text",
          "Please repeat the following: 'I couldn't understand the question. Try asking me something else.'"
        );
        cy.get("textarea").should("have.attr", "disabled");
      });
      cy.get("[data-cy=transcript-input]").within(($input) => {
        cy.get("textarea").should("have.text", "");
        cy.get("textarea").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=status]").contains("Skip");
      cy.get("[data-cy=back-btn]").should("not.be.disabled");
      cy.get("[data-cy=next-btn]").should("not.exist");
      cy.get("[data-cy=done-btn]").should("exist");
    });

    it("shows all incomplete questions if ?status=INCOMPLETE", () => {
      cyMockDefault(cy, { mentor: chatMentor });
      cy.visit("/record?status=INCOMPLETE");
      cy.get("[data-cy=progress]").contains("Questions 1 / 3");
      cy.get("[data-cy=question-input]").within(($input) => {
        cy.get("textarea").should("have.text", "How old are you now?");
        cy.get("textarea").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=transcript-input]").within(($input) => {
        cy.get("textarea").should("have.text", "");
        cy.get("textarea").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=status]").contains("Skip");
      cy.get("[data-cy=back-btn]").should("be.disabled");
      cy.get("[data-cy=next-btn]").trigger("mouseover").click();

      cy.get("[data-cy=progress]").contains("Questions 2 / 3");
      cy.get("[data-cy=question-input]").within(($input) => {
        cy.get("textarea").should(
          "have.text",
          "Please look at the camera for 30 seconds without speaking. Try to remain in the same position."
        );
        cy.get("textarea").should("have.attr", "disabled");
      });
      cy.get("[data-cy=transcript-input]").within(($input) => {
        cy.get("textarea").should("have.text", "");
        cy.get("textarea").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=status]").contains("Skip");
      cy.get("[data-cy=back-btn]").should("not.be.disabled");
      cy.get("[data-cy=next-btn]").trigger("mouseover").click();

      cy.get("[data-cy=progress]").contains("Questions 3 / 3");
      cy.get("[data-cy=question-input]").within(($input) => {
        cy.get("textarea").should(
          "have.text",
          "Please repeat the following: 'I couldn't understand the question. Try asking me something else.'"
        );
        cy.get("textarea").should("have.attr", "disabled");
      });
      cy.get("[data-cy=transcript-input]").within(($input) => {
        cy.get("textarea").should("have.text", "");
        cy.get("textarea").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=status]").contains("Skip");
      cy.get("[data-cy=back-btn]").should("not.be.disabled");
      cy.get("[data-cy=next-btn]").should("not.exist");
      cy.get("[data-cy=done-btn]").should("exist");
    });

    it("shows all complete questions if ?status=COMPLETE", () => {
      cyMockDefault(cy, { mentor: chatMentor });
      cy.visit("/record?status=COMPLETE");
      cy.get("[data-cy=progress]").contains("Questions 1 / 2");
      cy.get("[data-cy=question-input]").within(($input) => {
        cy.get("textarea").should(
          "have.text",
          "Who are you and what do you do?"
        );
        cy.get("textarea").should("have.attr", "disabled");
      });
      cy.get("[data-cy=transcript-input]").within(($input) => {
        cy.get("textarea").should(
          "have.text",
          "My name is Clint Anderson and I'm a Nuclear Electrician's Mate"
        );
        cy.get("textarea").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=status]").contains("Active");
      cy.get("[data-cy=back-btn]").should("be.disabled");
      cy.get("[data-cy=next-btn]").trigger("mouseover").click();

      cy.get("[data-cy=progress]").contains("Questions 2 / 2");
      cy.get("[data-cy=question-input]").within(($input) => {
        cy.get("textarea").should(
          "have.text",
          "Please give a short introduction of yourself, which includes your name, current job, and title."
        );
        cy.get("textarea").should("have.attr", "disabled");
      });
      cy.get("[data-cy=transcript-input]").within(($input) => {
        cy.get("textarea").should(
          "have.text",
          "My name is Clint Anderson and I'm a Nuclear Electrician's Mate"
        );
        cy.get("textarea").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=status]").contains("Active");
      cy.get("[data-cy=back-btn]").should("not.be.disabled");
      cy.get("[data-cy=next-btn]").should("not.exist");
      cy.get("[data-cy=done-btn]").should("exist");
    });

    it("shows a single question if ?videoId={questionId}", () => {
      cyMockDefault(cy, { mentor: chatMentor });
      cy.visit("/record?videoId=A1_1_1");
      cy.get("[data-cy=progress]").contains("Questions 1 / 1");
      cy.get("[data-cy=question-input]").within(($input) => {
        cy.get("textarea").should(
          "have.text",
          "Who are you and what do you do?"
        );
        cy.get("textarea").should("have.attr", "disabled");
      });
      cy.get("[data-cy=transcript-input]").within(($input) => {
        cy.get("textarea").should(
          "have.text",
          "My name is Clint Anderson and I'm a Nuclear Electrician's Mate"
        );
        cy.get("textarea").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=status]").contains("Active");
      cy.get("[data-cy=back-btn]").should("be.disabled");
      cy.get("[data-cy=next-btn]").should("not.exist");
      cy.get("[data-cy=done-btn]").should("exist");
    });

    it("shows multiple questions if ?videoId={questionId},{questionId}", () => {
      cyMockDefault(cy, { mentor: chatMentor });
      cy.visit("/record?videoId=A1_1_1,A3_1_1");
      cy.get("[data-cy=progress]").contains("Questions 1 / 2");
      cy.get("[data-cy=question-input]").within(($input) => {
        cy.get("textarea").should(
          "have.text",
          "Who are you and what do you do?"
        );
        cy.get("textarea").should("have.attr", "disabled");
      });
      cy.get("[data-cy=transcript-input]").within(($input) => {
        cy.get("textarea").should(
          "have.text",
          "My name is Clint Anderson and I'm a Nuclear Electrician's Mate"
        );
        cy.get("textarea").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=status]").contains("Active");
      cy.get("[data-cy=back-btn]").should("be.disabled");
      cy.get("[data-cy=next-btn]").trigger("mouseover").click();

      cy.get("[data-cy=progress]").contains("Questions 2 / 2");
      cy.get("[data-cy=question-input]").within(($input) => {
        cy.get("textarea").should(
          "have.text",
          "Please look at the camera for 30 seconds without speaking. Try to remain in the same position."
        );
        cy.get("textarea").should("have.attr", "disabled");
      });
      cy.get("[data-cy=transcript-input]").within(($input) => {
        cy.get("textarea").should("have.text", "");
        cy.get("textarea").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=status]").contains("Skip");
      cy.get("[data-cy=back-btn]").should("not.be.disabled");
      cy.get("[data-cy=next-btn]").should("not.exist");
      cy.get("[data-cy=done-btn]").should("exist");
    });

    it("shows all questions for a subject if ?subject={subjectId}", () => {
      cyMockDefault(cy, { mentor: chatMentor });
      cy.visit("/record?subject=background");
      cy.get("[data-cy=progress]").contains("Questions 1 / 2");
      cy.get("[data-cy=question-input]").within(($input) => {
        cy.get("textarea").should(
          "have.text",
          "Who are you and what do you do?"
        );
        cy.get("textarea").should("have.attr", "disabled");
      });
      cy.get("[data-cy=transcript-input]").within(($input) => {
        cy.get("textarea").should(
          "have.text",
          "My name is Clint Anderson and I'm a Nuclear Electrician's Mate"
        );
        cy.get("textarea").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=status]").contains("Active");
      cy.get("[data-cy=back-btn]").should("be.disabled");
      cy.get("[data-cy=next-btn]").trigger("mouseover").click();

      cy.get("[data-cy=progress]").contains("Questions 2 / 2");
      cy.get("[data-cy=question-input]").within(($input) => {
        cy.get("textarea").should("have.text", "How old are you now?");
        cy.get("textarea").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=transcript-input]").within(($input) => {
        cy.get("textarea").should("have.text", "");
        cy.get("textarea").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=status]").contains("Skip");
      cy.get("[data-cy=back-btn]").should("not.be.disabled");
      cy.get("[data-cy=next-btn]").should("not.exist");
      cy.get("[data-cy=done-btn]").should("exist");
    });

    it("shows all incomplete questions for a subject if ?subject={subjectId}&status=INCOMPLETE", () => {
      cyMockDefault(cy, { mentor: chatMentor });
      cy.visit("/record?subject=background&status=INCOMPLETE");
      cy.get("[data-cy=progress]").contains("Questions 1 / 1");
      cy.get("[data-cy=question-input]").within(($input) => {
        cy.get("textarea").should("have.text", "How old are you now?");
        cy.get("textarea").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=transcript-input]").within(($input) => {
        cy.get("textarea").should("have.text", "");
        cy.get("textarea").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=status]").contains("Skip");
      cy.get("[data-cy=back-btn]").should("be.disabled");
      cy.get("[data-cy=next-btn]").should("not.exist");
      cy.get("[data-cy=done-btn]").should("exist");
    });

    it("shows all complete questions for a subject if ?subject={subjectId}&status=COMPLETE", () => {
      cyMockDefault(cy, { mentor: chatMentor });
      cy.visit("/record?subject=background&status=COMPLETE");
      cy.get("[data-cy=progress]").contains("Questions 1 / 1");
      cy.get("[data-cy=question-input]").within(($input) => {
        cy.get("textarea").should(
          "have.text",
          "Who are you and what do you do?"
        );
        cy.get("textarea").should("have.attr", "disabled");
      });
      cy.get("[data-cy=transcript-input]").within(($input) => {
        cy.get("textarea").should(
          "have.text",
          "My name is Clint Anderson and I'm a Nuclear Electrician's Mate"
        );
        cy.get("textarea").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=status]").contains("Active");
      cy.get("[data-cy=back-btn]").should("be.disabled");
      cy.get("[data-cy=next-btn]").should("not.exist");
      cy.get("[data-cy=done-btn]").should("exist");
    });

    it("shows all questions for a category in a subject if ?category={categoryId}", () => {
      cyMockDefault(cy, { mentor: chatMentor });
      cy.visit("/record?subject=background&category=cat");
      cy.get("[data-cy=progress]").contains("Questions 1 / 1");
      cy.get("[data-cy=question-input]").within(($input) => {
        cy.get("textarea").should(
          "have.text",
          "Who are you and what do you do?"
        );
        cy.get("textarea").should("have.attr", "disabled");
      });
      cy.get("[data-cy=transcript-input]").within(($input) => {
        cy.get("textarea").should(
          "have.text",
          "My name is Clint Anderson and I'm a Nuclear Electrician's Mate"
        );
        cy.get("textarea").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=status]").contains("Active");
      cy.get("[data-cy=back-btn]").should("be.disabled");
      cy.get("[data-cy=next-btn]").should("not.exist");
      cy.get("[data-cy=done-btn]").should("exist");
    });
  });

  it("When an upload finishes on record view, should swap user to video view", () => {
    cyMockDefault(cy, {
      mentor: [videoMentor],
      gqlQueries: [
        mockGQL("UploadTaskDelete", { me: { uploadTaskDelete: true } }),
        mockGQL("UpdateAnswer", { me: { updateAnswer: true } }),
        mockGQL("UpdateQuestion", { me: { updateQuestion: true } }),
        mockGQL("FetchUploadTasks", [
          {
            me: {
              uploadTasks: [
                {
                  question: {
                    _id: videoMentor.answers[0].question._id,
                    question: videoMentor.answers[0].question.question,
                  },
                  uploadStatus: "UPLOAD_IN_PROGRESS",
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
              ],
            },
          },
          {
            me: {
              uploadTasks: [
                {
                  question: {
                    _id: videoMentor.answers[0].question._id,
                    question: videoMentor.answers[0].question.question,
                  },
                  uploadStatus: "DONE",
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
              ],
            },
          },
        ]),
      ],
    });
    cy.visit("/record");
    //upload in progress
    cy.get("[data-cy=upload-in-progress-notifier]").should("be.visible");
    cy.get("[data-cy=upload-video]").should("contain.text", "Cancel");
    cy.get("[data-cy=upload-video]").should("not.be.disabled");
    cy.get("[data-cy=video-player]").should("not.be.visible");
    //upload complete, should swap to video view
    cy.get("[data-cy=upload-in-progress-notifier]").should("not.be.visible");
    cy.get("[data-cy=upload-video]").should("contain.text", "Upload Video");
    cy.get("[data-cy=upload-video]").should("be.disabled");
    cy.get("[data-cy=video-player]").should("be.visible");
  });

  it('cancelling an upload changes the local uploading status to "cancelling"', () => {
    cyMockDefault(cy, {
      mentor: [videoMentor],
      gqlQueries: [
        mockGQL("UploadTaskDelete", { me: { uploadTaskDelete: true } }),
        mockGQL("UpdateAnswer", { me: { updateAnswer: true } }),
        mockGQL("UpdateQuestion", { me: { updateQuestion: true } }),
        mockGQL("FetchUploadTasks", [
          {
            me: {
              uploadTasks: [
                {
                  question: {
                    _id: videoMentor.answers[0].question._id,
                    question: videoMentor.answers[0].question.question,
                  },
                  taskId: "fake_task_id_1",
                  uploadStatus: "UPLOAD_IN_PROGRESS",
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
                {
                  question: {
                    _id: videoMentor.answers[1].question._id,
                    question: videoMentor.answers[1].question.question,
                  },
                  taskId: "fake_task_id_2",
                  uploadStatus: "DONE",
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
              ],
            },
          },
          {
            me: {
              uploadTasks: [
                {
                  question: {
                    _id: videoMentor.answers[0].question._id,
                    question: videoMentor.answers[0].question.question,
                  },
                  taskId: "fake_task_id_1",
                  uploadStatus: "CANCEL_IN_PROGRESS",
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
                {
                  question: {
                    _id: videoMentor.answers[1].question._id,
                    question: videoMentor.answers[1].question.question,
                  },
                  taskId: "fake_task_id_2",
                  uploadStatus: "DONE",
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
              ],
            },
          },
        ]),
      ],
    });
    cy.visit("/record");
    cy.get("[data-cy=upload-card-0]").should("exist");
    cy.get("[data-cy=upload-card-0]").within(($within) => {
      //ListItems primary text is under <span> and its secondary text is under <p>
      cy.get("[data-cy=cancel-upload]").trigger("mouseover").click();
    });
    cy.get("[data-cy=upload-card-0]").within(($within) => {
      //ListItems secondary text is under <p>
      cy.get("[data-cy=card-answer-title]")
        .get("p")
        .should("have.text", "Cancelling");
    });
    cy.get("[data-cy=upload-video]").should("exist");
  });

  it("A successfully cancelled upload item should disappear from the list of uploads", () => {
    cyMockDefault(cy, {
      mentor: [videoMentor],
      gqlQueries: [
        mockGQL("UploadTaskDelete", { me: { uploadTaskDelete: true } }),
        mockGQL("UpdateAnswer", { me: { updateAnswer: true } }),
        mockGQL("UpdateQuestion", { me: { updateQuestion: true } }),
        mockGQL("FetchUploadTasks", [
          {
            me: {
              uploadTasks: [
                {
                  question: {
                    _id: videoMentor.answers[0].question._id,
                    question: videoMentor.answers[0].question.question,
                  },
                  uploadStatus: "UPLOAD_IN_PROGRESS",
                  transcript: "",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
                {
                  question: {
                    _id: videoMentor.answers[1].question._id,
                    question: videoMentor.answers[1].question.question,
                  },
                  uploadStatus: "UPLOAD_IN_PROGRESS",
                  transcript: "",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
                {
                  question: {
                    _id: videoMentor.answers[2].question._id,
                    question: videoMentor.answers[2].question.question,
                  },
                  uploadStatus: "UPLOAD_IN_PROGRESS",
                  transcript: "",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
              ],
            },
          },
          {
            me: {
              uploadTasks: [
                {
                  question: {
                    _id: videoMentor.answers[0].question._id,
                    question: videoMentor.answers[0].question.question,
                  },
                  uploadStatus: "CANCELLED",
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
                {
                  question: {
                    _id: videoMentor.answers[1].question._id,
                    question: videoMentor.answers[1].question.question,
                  },
                  uploadStatus: "CANCELLED",
                  transcript: "",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
                {
                  question: {
                    _id: videoMentor.answers[2].question._id,
                    question: videoMentor.answers[2].question.question,
                  },
                  uploadStatus: "CANCELLED",
                  transcript: "",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
              ],
            },
          },
        ]),
      ],
    });
    cy.visit("/record");
    cy.get("[data-cy=upload-card-0]").should("exist");
    cy.get("[data-cy=upload-card-1]").should("exist");
    cy.get("[data-cy=upload-card-2]").should("exist");
    //after next poll, these cards should be gone since they were cancelled
    cy.get("[data-cy=upload-card-0]").should("not.exist");
    cy.get("[data-cy=upload-card-1]").should("not.exist");
    cy.get("[data-cy=upload-card-2]").should("not.exist");
    cy.get("[data-cy=upload-video]").should("exist");
  });

  //Test that once you click the title card, it goes to that card appropriate answer
  it("tapping an item from active uploads (via upload button) takes you to that item", () => {
    cyMockDefault(cy, {
      mentor: [videoMentor],
      gqlQueries: [
        mockGQL("UploadTaskDelete", { me: { uploadTaskDelete: true } }),
        mockGQL("UpdateAnswer", { me: { updateAnswer: true } }),
        mockGQL("UpdateQuestion", { me: { updateQuestion: true } }),
        mockGQL("FetchUploadTasks", [{ me: { uploadTasks: [] } }]),
      ],
    });
    cy.visit("/record");
    cyAttachUpload(cy).then(() => {
      cy.get("[data-cy=upload-video]").trigger("mouseover").click();
      cy.get("[data-cy=uploading-widget]").should("be.visible");

      //go to next answer page and then press card 0
      cy.get("[data-cy=next-btn]").trigger("mouseover").click();
      cy.get("[data-cy=upload-card-0]").within(($i) => {
        cy.get("[data-cy=card-answer-title]").trigger("mouseover").click();
      });
      cy.get("[data-cy=question-input]").within(($input) => {
        cy.get("textarea").should(
          "have.text",
          "Who are you and what do you do?"
        );
      });
    });
  });

  it("User gets guidance to know they can move on and record another answer", () => {
    cyMockDefault(cy, {
      mentor: [videoMentor],
      gqlQueries: [
        mockGQL("UploadTaskDelete", { me: { uploadTaskDelete: true } }),
        mockGQL("UpdateAnswer", { me: { updateAnswer: true } }),
        mockGQL("UpdateQuestion", { me: { updateQuestion: true } }),
        mockGQL("FetchUploadTasks", [
          {
            me: {
              uploadTasks: [
                {
                  question: {
                    _id: videoMentor.answers[0].question._id,
                    question: videoMentor.answers[0].question.question,
                  },
                  uploadStatus: "UPLOAD_IN_PROGRESS",
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
                {
                  question: {
                    _id: videoMentor.answers[1].question._id,
                    question: videoMentor.answers[1].question.question,
                  },
                  uploadStatus: "DONE",
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
              ],
            },
          },
        ]),
      ],
    });
    cy.visit("/record");
    cy.get("[data-cy=upload-in-progress-notifier]").should("be.visible");
    cy.get("[data-cy=next-btn]").trigger("mouseover").click();
    cy.get("[data-cy=upload-in-progress-notifier]").should("not.be.visible");
    cy.get("[data-cy=back-btn]").trigger("mouseover").click();
    cy.get("[data-cy=upload-in-progress-notifier]").should("be.visible");
  });

  it("can dismiss completed items in list via x button", () => {
    cyMockDefault(cy, {
      mentor: [videoMentor],
      gqlQueries: [
        mockGQL("UploadTaskDelete", { me: { uploadTaskDelete: true } }),
        mockGQL("UpdateAnswer", { me: { updateAnswer: true } }),
        mockGQL("UpdateQuestion", { me: { updateQuestion: true } }),
        mockGQL("FetchUploadTasks", [
          {
            me: {
              uploadTasks: [
                {
                  question: {
                    _id: videoMentor.answers[0].question._id,
                    question: videoMentor.answers[0].question.question,
                  },
                  uploadStatus: "UPLOAD_FAILED",
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
                {
                  question: {
                    _id: videoMentor.answers[1].question._id,
                    question: videoMentor.answers[1].question.question,
                  },
                  uploadStatus: "DONE",
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
                {
                  question: {
                    _id: videoMentor.answers[2].question._id,
                    question: videoMentor.answers[2].question.question,
                  },
                  uploadStatus: "DONE",
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
              ],
            },
          },
        ]),
      ],
    });
    cy.visit("/record");
    cy.get("[data-cy=upload-card-2]").within(($within) => {
      cy.get("[data-cy=cancel-upload]").trigger("mouseover").click();
    });
    cy.get("[data-cy=upload-card-2]").should("not.exist");
    cy.get("[data-cy=upload-card-1]").within(($within) => {
      cy.get("[data-cy=cancel-upload]").trigger("mouseover").click();
    });
    cy.get("[data-cy=upload-card-1]").should("not.exist");
  });

  it("upload button changes to cancel while an upload is in progress", () => {
    cyMockDefault(cy, {
      mentor: [videoMentor],
      gqlQueries: [
        mockGQL("UploadTaskDelete", { me: { uploadTaskDelete: true } }),
        mockGQL("UpdateAnswer", { me: { updateAnswer: true } }),
        mockGQL("UpdateQuestion", { me: { updateQuestion: true } }),
        mockGQL("FetchUploadTasks", [
          {
            me: {
              uploadTasks: [
                {
                  question: {
                    _id: videoMentor.answers[0].question._id,
                    question: videoMentor.answers[0].question.question,
                  },
                  uploadStatus: "UPLOAD_IN_PROGRESS",
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
                {
                  question: {
                    _id: videoMentor.answers[1].question._id,
                    question: videoMentor.answers[1].question.question,
                  },
                  uploadStatus: "DONE",
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
              ],
            },
          },
        ]),
      ],
    });
    cy.visit("/record");
    cy.get("[data-cy=upload-video]").should("have.text", "Cancel");
    cy.get("[data-cy=upload-video]").should("not.be.disabled");
    cy.get("[data-cy=upload-video]").should("be.visible");
    cy.get("[data-cy=next-btn]").trigger("mouseover").click();
    cy.get("[data-cy=upload-video]").should("have.text", "Upload Video");
    cy.get("[data-cy=upload-video]").should("be.disabled");
    cy.get("[data-cy=back-btn]").trigger("mouseover").click();
  });

  it("upload button changes to trim when trim is edited", () => {
    cyMockDefault(cy, {
      mentor: [videoMentor],
      gqlQueries: [
        mockGQL("UploadTaskDelete", { me: { uploadTaskDelete: true } }),
        mockGQL("UpdateAnswer", { me: { updateAnswer: true } }),
        mockGQL("UpdateQuestion", { me: { updateQuestion: true } }),
        mockGQL("FetchUploadTasks", [{ me: { uploadTasks: [] } }]),
      ],
    });
    cy.visit("/record?videoId=A2_1_1");
    cy.get("[data-cy=upload-video]").should("be.visible");
    cy.get("[data-cy=upload-video]").should("be.disabled");
    cy.get("[data-cy=upload-video]").should("have.text", "Upload Video");
    // edit slider
    cy.get("[data-cy=slider]").within(($slider) => {
      cy.get(".MuiSlider-thumb").first().type("{rightarrow}");
    });
    cy.get("[data-cy=upload-video]").should("be.visible");
    cy.get("[data-cy=upload-video]").should("not.be.disabled");
    cy.get("[data-cy=upload-video]").should("have.text", "Trim Video");
  });

  it("Option to cancel upload is available when returning to page with an upload in progress", () => {
    cyMockDefault(cy, {
      mentor: [videoMentor],
      gqlQueries: [
        mockGQL("UploadTaskDelete", { me: { uploadTaskDelete: true } }),
        mockGQL("UpdateAnswer", { me: { updateAnswer: true } }),
        mockGQL("UpdateQuestion", { me: { updateQuestion: true } }),
        mockGQL("FetchUploadTasks", [
          {
            me: {
              uploadTasks: [
                {
                  question: {
                    _id: videoMentor.answers[0].question._id,
                    question: videoMentor.answers[0].question.question,
                  },
                  uploadStatus: "UPLOAD_IN_PROGRESS",
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
                {
                  question: {
                    _id: videoMentor.answers[1].question._id,
                    question: videoMentor.answers[1].question.question,
                  },
                  uploadStatus: "DONE",
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
              ],
            },
          },
        ]),
      ],
    });
    cy.visit("/record");
    cy.get("[data-cy=upload-video]").should("be.visible");
    cy.get("[data-cy=upload-video]").should("not.be.disabled");
    cy.get("[data-cy=upload-video]").should("have.text", "Cancel");
    cy.get("[data-cy=next-btn]").trigger("mouseover").click();
    cy.get("[data-cy=upload-video]").should("be.disabled");
    cy.get("[data-cy=upload-video]").should("have.text", "Upload Video");
    cy.get("[data-cy=back-btn]").trigger("mouseover").click();
    cy.get("[data-cy=upload-video]").should("be.visible");
    cy.get("[data-cy=upload-video]").should("not.be.disabled");
    cy.get("[data-cy=upload-video]").should("have.text", "Cancel");
  });

  it("the upload card corresponding to current question should be highlighted", () => {
    cyMockDefault(cy, {
      mentor: [videoMentor],
      gqlQueries: [
        mockGQL("UploadTaskDelete", { me: { uploadTaskDelete: true } }),
        mockGQL("UpdateAnswer", { me: { updateAnswer: true } }),
        mockGQL("UpdateQuestion", { me: { updateQuestion: true } }),
        mockGQL("FetchUploadTasks", [
          {
            me: {
              uploadTasks: [
                {
                  question: {
                    _id: videoMentor.answers[0].question._id,
                    question: videoMentor.answers[0].question.question,
                  },
                  uploadStatus: "UPLOAD_IN_PROGRESS",
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
                {
                  question: {
                    _id: videoMentor.answers[1].question._id,
                    question: videoMentor.answers[1].question.question,
                  },
                  uploadStatus: "UPLOAD_FAILED",
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
                {
                  question: {
                    _id: videoMentor.answers[2].question._id,
                    question: videoMentor.answers[2].question.question,
                  },
                  uploadStatus: "DONE",
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
              ],
            },
          },
          {
            me: {
              uploadTasks: [
                {
                  question: {
                    _id: videoMentor.answers[0].question._id,
                    question: videoMentor.answers[0].question.question,
                  },
                  uploadStatus: "DONE",
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
                {
                  question: {
                    _id: videoMentor.answers[1].question._id,
                    question: videoMentor.answers[1].question.question,
                  },
                  uploadStatus: "DONE",
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
                {
                  question: {
                    _id: videoMentor.answers[2].question._id,
                    question: videoMentor.answers[2].question.question,
                  },
                  uploadStatus: "DONE",
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
              ],
            },
          },
        ]),
      ],
    });
    cy.visit("/record");
    cy.get("[data-cy=upload-card-0]").should("exist");
    cy.get("[data-cy=upload-card-0]").should(
      "have.css",
      "background-color",
      "rgb(255, 251, 204)"
    );
    cy.get("[data-cy=upload-card-1]").should("exist");
    cy.get("[data-cy=upload-card-1]").should(
      "have.css",
      "background-color",
      "rgba(0, 0, 0, 0)"
    );
    cy.get("[data-cy=next-btn]").trigger("mouseover").click();
    cy.get("[data-cy=upload-card-0]").should("exist");
    cy.get("[data-cy=upload-card-0]").should(
      "have.css",
      "background-color",
      "rgba(0, 0, 0, 0)"
    );
    cy.get("[data-cy=upload-card-1]").should("exist");
    cy.get("[data-cy=upload-card-1]").should(
      "have.css",
      "background-color",
      "rgb(255, 251, 204)"
    );
  });

  //Test that the widget displays mutliple cards with multiple uploads
  it("displays multiple cards with multiple uploads", () => {
    cyMockDefault(cy, {
      mentor: [videoMentor],
      gqlQueries: [
        mockGQL("UploadTaskDelete", { me: { uploadTaskDelete: true } }),
        mockGQL("UpdateAnswer", { me: { updateAnswer: true } }),
        mockGQL("UpdateQuestion", { me: { updateQuestion: true } }),
        mockGQL("FetchUploadTasks", [
          {
            me: {
              uploadTasks: [
                {
                  question: {
                    _id: videoMentor.answers[0].question._id,
                    question: videoMentor.answers[0].question.question,
                  },
                  uploadStatus: "UPLOAD_IN_PROGRESS",
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
                {
                  question: {
                    _id: videoMentor.answers[1].question._id,
                    question: videoMentor.answers[1].question.question,
                  },
                  uploadStatus: "UPLOAD_FAILED",
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
                {
                  question: {
                    _id: videoMentor.answers[2].question._id,
                    question: videoMentor.answers[2].question.question,
                  },
                  uploadStatus: "DONE",
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
              ],
            },
          },
        ]),
      ],
    });
    cy.visit("/record");
    cy.get("[data-cy=upload-card-0]").should("exist");
    cy.get("[data-cy=upload-card-1]").should("exist");
  });

  it("uploading widget should not be open if there are no uploads", () => {
    cyMockDefault(cy, {
      mentor: [videoMentor],
      gqlQueries: [
        mockGQL("UploadTaskDelete", { me: { uploadTaskDelete: true } }),
        mockGQL("UpdateAnswer", { me: { updateAnswer: true } }),
        mockGQL("UpdateQuestion", { me: { updateQuestion: true } }),
        mockGQL("FetchUploadTasks", [{ me: { uploadTasks: [] } }]),
      ],
    });
    cy.visit("/record");
    cy.get("[data-cy=uploading-widget]").should("not.be.visible");
  });

  it("can update status", () => {
    cyMockDefault(cy, {
      mentor: [chatMentor],
      gqlQueries: [
        mockGQL("UploadTaskDelete", { me: { uploadTaskDelete: true } }),
        mockGQL("UpdateAnswer", { me: { updateAnswer: true } }),
        mockGQL("UpdateQuestion", { me: { updateQuestion: true } }),
        mockGQL("FetchUploadTasks", [{ me: { uploadTasks: [] } }]),
      ],
    });
    cy.visit("/record?videoId=A1_1_1");
    cy.get("[data-cy=progress]").contains("Questions 1 / 1");
    cy.get("[data-cy=question-input]").within(($input) => {
      cy.get("textarea").should("have.text", "Who are you and what do you do?");
      cy.get("textarea").should("have.attr", "disabled");
    });
    cy.get("[data-cy=transcript-input]").within(($input) => {
      cy.get("textarea").should(
        "have.text",
        "My name is Clint Anderson and I'm a Nuclear Electrician's Mate"
      );
      cy.get("textarea").should("not.have.attr", "disabled");
    });
    cy.get("[data-cy=status]").contains("Active");
    cy.get("[data-cy=select-status]").trigger("mouseover").click();
    cy.get("[data-cy=incomplete]").trigger("mouseover").click();
    cy.get("[data-cy=status]").contains("Skip");
    cy.get("[data-cy=done-btn]").trigger("mouseover").click();
    cy.get("[data-cy=loading-dialog]");
  });

  it("uploading widget should be open if there are active uploads", () => {
    cyMockDefault(cy, {
      mentor: [videoMentor],
      gqlQueries: [
        mockGQL("UploadTaskDelete", { me: { uploadTaskDelete: true } }),
        mockGQL("UpdateAnswer", { me: { updateAnswer: true } }),
        mockGQL("UpdateQuestion", { me: { updateQuestion: true } }),
        mockGQL("FetchUploadTasks", [
          { me: { uploadTasks: [] } },
          {
            me: {
              uploadTasks: [
                {
                  question: {
                    _id: videoMentor.answers[0].question._id,
                    question: videoMentor.answers[0].question.question,
                  },
                  uploadStatus: "DONE",
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
              ],
            },
          },
        ]),
      ],
    });
    cy.visit("/record");
    cyAttachUpload(cy).then(() => {
      cy.get("[data-cy=upload-video]").trigger("mouseover").click();
      cy.get("[data-cy=uploading-widget]").should("be.visible");
    });
  });

  it("tapping an item from active uploads (via graphql query) takes you to that item", () => {
    cyMockDefault(cy, {
      mentor: [videoMentor],
      gqlQueries: [
        mockGQL("UploadTaskDelete", { me: { uploadTaskDelete: true } }),
        mockGQL("UpdateAnswer", { me: { updateAnswer: true } }),
        mockGQL("UpdateQuestion", { me: { updateQuestion: true } }),
        mockGQL("FetchUploadTasks", [
          {
            me: {
              uploadTasks: [
                {
                  question: {
                    _id: videoMentor.answers[0].question._id,
                    question: videoMentor.answers[0].question.question,
                  },
                  uploadStatus: "UPLOAD_IN_PROGRESS",
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
                {
                  question: {
                    _id: videoMentor.answers[1].question._id,
                    question: videoMentor.answers[1].question.question,
                  },
                  uploadStatus: "UPLOAD_FAILED",
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
                {
                  question: {
                    _id: videoMentor.answers[2].question._id,
                    question: videoMentor.answers[2].question.question,
                  },
                  uploadStatus: "DONE",
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
              ],
            },
          },
          {
            me: {
              uploadTasks: [
                {
                  question: {
                    _id: videoMentor.answers[0].question._id,
                    question: videoMentor.answers[0].question.question,
                  },
                  uploadStatus: "DONE",
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
                {
                  question: {
                    _id: videoMentor.answers[1].question._id,
                    question: videoMentor.answers[1].question.question,
                  },
                  uploadStatus: "DONE",
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
                {
                  question: {
                    _id: videoMentor.answers[2].question._id,
                    question: videoMentor.answers[2].question.question,
                  },
                  uploadStatus: "DONE",
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
              ],
            },
          },
        ]),
      ],
    });
    cy.visit("/record");
    cy.get("[data-cy=upload-card-0]").should("exist");
    cy.get("[data-cy=upload-card-1]").should("exist");
    cy.get("[data-cy=next-btn]").trigger("mouseover").click();
    cy.get("[data-cy=upload-card-0]").within(($i) => {
      cy.get("[data-cy=card-answer-title]").trigger("mouseover").click();
    });
    cy.get("[data-cy=question-input]").within(($input) => {
      cy.get("textarea").should("have.text", "Who are you and what do you do?");
    });
  });

  it("Uploads panel can be closed via header button and list x button, and panel can be opened via header button", () => {
    cyMockDefault(cy, {
      mentor: [videoMentor],
      gqlQueries: [
        mockGQL("UploadTaskDelete", { me: { uploadTaskDelete: true } }),
        mockGQL("UpdateAnswer", { me: { updateAnswer: true } }),
        mockGQL("UpdateQuestion", { me: { updateQuestion: true } }),
        mockGQL("FetchUploadTasks", [
          {
            me: {
              uploadTasks: [
                {
                  question: {
                    _id: videoMentor.answers[0].question._id,
                    question: videoMentor.answers[0].question.question,
                  },
                  uploadStatus: "UPLOAD_IN_PROGRESS",
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
                {
                  question: {
                    _id: videoMentor.answers[1].question._id,
                    question: videoMentor.answers[1].question.question,
                  },
                  uploadStatus: "UPLOAD_IN_PROGRESS",
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
                {
                  question: {
                    _id: videoMentor.answers[2].question._id,
                    question: videoMentor.answers[2].question.question,
                  },
                  uploadStatus: "DONE",
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
              ],
            },
          },
          {
            me: {
              uploadTasks: [
                {
                  question: {
                    _id: videoMentor.answers[0].question._id,
                    question: videoMentor.answers[0].question.question,
                  },
                  uploadStatus: "DONE",
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
                {
                  question: {
                    _id: videoMentor.answers[1].question._id,
                    question: videoMentor.answers[1].question.question,
                  },
                  uploadStatus: "DONE",
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
                {
                  question: {
                    _id: videoMentor.answers[2].question._id,
                    question: videoMentor.answers[2].question.question,
                  },
                  uploadStatus: "DONE",
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
              ],
            },
          },
        ]),
      ],
    });
    cy.visit("/record");
    cy.get("[data-cy=uploading-widget]").should("be.visible");
    cy.get("[data-cy=header-uploads-button]").trigger("mouseover").click();
    cy.get("[data-cy=uploading-widget]").should("not.be.visible");
    cy.get("[data-cy=header-uploads-button]").trigger("mouseover").click();
    cy.get("[data-cy=uploading-widget]").should("be.visible");
    cy.get("[data-cy=close-uploads-widget-button]")
      .trigger("mouseover")
      .click();
    cy.get("[data-cy=uploading-widget]").should("not.be.visible");
  });

  it("upload 'processing' text animates three ellipsis", () => {
    cyMockDefault(cy, {
      mentor: [videoMentor],
      gqlQueries: [
        mockGQL("UploadTaskDelete", { me: { uploadTaskDelete: true } }),
        mockGQL("UpdateAnswer", { me: { updateAnswer: true } }),
        mockGQL("UpdateQuestion", { me: { updateQuestion: true } }),
        mockGQL("FetchUploadTasks", [
          {
            me: {
              uploadTasks: [
                {
                  question: {
                    _id: videoMentor.answers[0].question._id,
                    question: videoMentor.answers[0].question.question,
                  },
                  uploadStatus: "TRANSCRIBE_IN_PROGRESS",
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
              ],
            },
          },
          {
            me: {
              uploadTasks: [
                {
                  question: {
                    _id: videoMentor.answers[0].question._id,
                    question: videoMentor.answers[0].question.question,
                  },
                  uploadStatus: "TRANSCRIBE_IN_PROGRESS",
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
              ],
            },
          },
          {
            me: {
              uploadTasks: [
                {
                  question: {
                    _id: videoMentor.answers[0].question._id,
                    question: videoMentor.answers[0].question.question,
                  },
                  uploadStatus: "TRANSCRIBE_IN_PROGRESS",
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
              ],
            },
          },
          {
            me: {
              uploadTasks: [
                {
                  question: {
                    _id: videoMentor.answers[0].question._id,
                    question: videoMentor.answers[0].question.question,
                  },
                  uploadStatus: "TRANSCRIBE_IN_PROGRESS",
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
              ],
            },
          },
        ]),
      ],
    });
    cy.visit("/record");
    cy.get("[data-cy=upload-card-0]").should("exist");
    cy.get("[data-cy=upload-card-0]").within(($within) => {
      //ListItems primary text is under <span> and its secondary text is under <p>
      cy.get("[data-cy=card-answer-title]")
        .get("p")
        .should("have.text", "Processing");
      cy.get("[data-cy=card-answer-title]")
        .get("p")
        .should("have.text", "Processing.");
      cy.get("[data-cy=card-answer-title]")
        .get("p")
        .should("have.text", "Processing..");
      cy.get("[data-cy=card-answer-title]")
        .get("p")
        .should("have.text", "Processing...");
      cy.get("[data-cy=card-answer-title]")
        .get("p")
        .should("have.text", "Processing");
    });
  });

  it("When an upload gets cancelled, should return user back to recording page", () => {
    cyMockDefault(cy, {
      mentor: [videoMentor],
      gqlQueries: [
        mockGQL("UploadTaskDelete", { me: { uploadTaskDelete: true } }),
        mockGQL("UpdateAnswer", { me: { updateAnswer: true } }),
        mockGQL("UpdateQuestion", { me: { updateQuestion: true } }),
        mockGQL("FetchUploadTasks", [
          {
            me: {
              uploadTasks: [
                {
                  question: {
                    _id: videoMentor.answers[0].question._id,
                    question: videoMentor.answers[0].question.question,
                  },
                  uploadStatus: "UPLOAD_IN_PROGRESS",
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
              ],
            },
          },
          {
            me: {
              uploadTasks: [
                {
                  question: {
                    _id: videoMentor.answers[0].question._id,
                    question: videoMentor.answers[0].question.question,
                  },
                  uploadStatus: "CANCELLED",
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
              ],
            },
          },
        ]),
      ],
    });
    cy.visit("/record");
    cy.get("[data-cy=upload-in-progress-notifier]").should("be.visible");
    //after poll, should be back to upload video/file stage because upload was cancelled
    cy.get("[data-cy=upload-file]").should("be.visible");
  });

  it("Header shows a count of N of M uploads", () => {
    cyMockDefault(cy, {
      mentor: [videoMentor],
      gqlQueries: [
        mockGQL("UploadTaskDelete", { me: { uploadTaskDelete: true } }),
        mockGQL("UpdateAnswer", { me: { updateAnswer: true } }),
        mockGQL("UpdateQuestion", { me: { updateQuestion: true } }),
        mockGQL("FetchUploadTasks", [
          {
            me: {
              uploadTasks: [
                {
                  question: {
                    _id: videoMentor.answers[0].question._id,
                    question: videoMentor.answers[0].question.question,
                  },
                  uploadStatus: "UPLOAD_IN_PROGRESS",
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
                {
                  question: {
                    _id: videoMentor.answers[1].question._id,
                    question: videoMentor.answers[1].question.question,
                  },
                  uploadStatus: "DONE",
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
                {
                  question: {
                    _id: videoMentor.answers[2].question._id,
                    question: videoMentor.answers[2].question.question,
                  },
                  uploadStatus: "DONE",
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
              ],
            },
          },
        ]),
      ],
    });
    cy.visit("/record");
    cy.get("[data-cy=header-uploads-button]").should(
      "have.text",
      "2 of 3 Uploads Complete"
    );
  });

  it("If no uploads occuring, uploads header only shows a dimmed out icon", () => {
    cyMockDefault(cy, {
      mentor: [videoMentor],
      gqlQueries: [
        mockGQL("UploadTaskDelete", { me: { uploadTaskDelete: true } }),
        mockGQL("UpdateAnswer", { me: { updateAnswer: true } }),
        mockGQL("UpdateQuestion", { me: { updateQuestion: true } }),
        mockGQL("FetchUploadTasks", [{ me: { uploadTasks: [] } }]),
      ],
    });
    cy.visit("/record");
    cy.get("[data-cy=header-uploads-button]").should("have.text", "");
    cy.get("[data-cy=header-uploads-button]").should(
      "have.css",
      "opacity",
      "0.5"
    );
  });

  it("displays status info for each job: Uploading, Completed, Failed", () => {
    cyMockDefault(cy, {
      mentor: [videoMentor],
      gqlQueries: [
        mockGQL("UploadTaskDelete", { me: { uploadTaskDelete: true } }),
        mockGQL("UpdateAnswer", { me: { updateAnswer: true } }),
        mockGQL("UpdateQuestion", { me: { updateQuestion: true } }),
        mockGQL("FetchUploadTasks", [
          {
            me: {
              uploadTasks: [
                {
                  question: {
                    _id: videoMentor.answers[0].question._id,
                    question: videoMentor.answers[0].question.question,
                  },
                  uploadStatus: "UPLOAD_IN_PROGRESS",
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
                {
                  question: {
                    _id: videoMentor.answers[1].question._id,
                    question: videoMentor.answers[1].question.question,
                  },
                  uploadStatus: "UPLOAD_IN_PROGRESS",
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
                {
                  question: {
                    _id: videoMentor.answers[2].question._id,
                    question: videoMentor.answers[2].question.question,
                  },
                  uploadStatus: "UPLOAD_IN_PROGRESS",
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
              ],
            },
          },
          {
            me: {
              uploadTasks: [
                {
                  question: {
                    _id: videoMentor.answers[0].question._id,
                    question: videoMentor.answers[0].question.question,
                  },
                  uploadStatus: "TRIM_IN_PROGRESS",
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
                {
                  question: {
                    _id: videoMentor.answers[1].question._id,
                    question: videoMentor.answers[1].question.question,
                  },
                  uploadStatus: "UPLOAD_FAILED",
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
                {
                  question: {
                    _id: videoMentor.answers[2].question._id,
                    question: videoMentor.answers[2].question.question,
                  },
                  uploadStatus: "DONE",
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
              ],
            },
          },
        ]),
      ],
    });
    cy.visit("/record");
    cy.get("[data-cy=upload-card-2]").within(($within) => {
      //ListItems secondary text is under <p>
      cy.get("[data-cy=card-answer-title]")
        .get("span")
        .should("have.text", videoMentor.answers[2].question.question);
      cy.get("[data-cy=card-answer-title]").contains("Tap to preview");
    });
    cy.get("[data-cy=upload-card-1]").within(($within) => {
      //ListItems secondary text is under <p>
      cy.get("[data-cy=card-answer-title]")
        .get("span")
        .should("have.text", videoMentor.answers[1].question.question);
      cy.get("[data-cy=card-answer-title]").contains(
        "Failed to process file: UPLOAD_FAILED"
      );
    });
    cy.get("[data-cy=upload-card-0]").within(($within) => {
      //ListItems primary text is under <span> and its secondary text is under <p>
      cy.get("[data-cy=card-answer-title]")
        .get("span")
        .should(
          "contain",
          videoMentor.answers[0].question.question.substr(0, 25)
        );
      cy.get("[data-cy=card-answer-title]")
        .get("p")
        .should("have.text", "Trimming video");
    });
  });

  it("pressing cancel button changes UI to indicate cancel in progress", () => {
    cyMockDefault(cy, {
      mentor: [videoMentor],
      gqlQueries: [
        mockGQL("UploadTaskDelete", { me: { uploadTaskDelete: true } }),
        mockGQL("UpdateAnswer", { me: { updateAnswer: true } }),
        mockGQL("UpdateQuestion", { me: { updateQuestion: true } }),
        mockGQL("FetchUploadTasks", [
          {
            me: {
              uploadTasks: [
                {
                  question: {
                    _id: videoMentor.answers[0].question._id,
                    question: videoMentor.answers[0].question.question,
                  },
                  taskId: "fake_task_id",
                  uploadStatus: "UPLOAD_IN_PROGRESS",
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
              ],
            },
          },
          {
            me: {
              uploadTasks: [
                {
                  question: {
                    _id: videoMentor.answers[0].question._id,
                    question: videoMentor.answers[0].question.question,
                  },
                  taskId: "fake_task_id",
                  uploadStatus: "CANCEL_IN_PROGRESS",
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
              ],
            },
          },
        ]),
      ],
    });
    cy.visit("/record");
    cy.get("[data-cy=upload-card-0]").should("exist");
    cy.get("[data-cy=upload-video]").should("have.text", "Cancel");
    cy.get("[data-cy=upload-video]").trigger("mouseover").click();
    cy.get("[data-cy=upload-card-0]").within(($within) => {
      cy.get("[data-cy=card-answer-title]")
        .get("p")
        .should("have.text", "Cancelling");
    });
  });

  it("hides video if mentor type is CHAT", () => {
    cyMockDefault(cy, {
      mentor: [chatMentor],
      gqlQueries: [
        mockGQL("UploadTaskDelete", { me: { uploadTaskDelete: true } }),
        mockGQL("UpdateAnswer", { me: { updateAnswer: true } }),
        mockGQL("UpdateQuestion", { me: { updateQuestion: true } }),
        mockGQL("FetchUploadTasks", [{ me: { uploadTasks: [] } }]),
      ],
    });
    cy.visit("/record");
    cy.get("[data-cy=video-recorder]").should("not.exist");
    cy.get("[data-cy=video-player]").should("not.exist");
  });

  it("shows video recorder if mentor type is VIDEO and no video", () => {
    cyMockDefault(cy, {
      mentor: [videoMentor],
      gqlQueries: [
        mockGQL("UploadTaskDelete", { me: { uploadTaskDelete: true } }),
        mockGQL("UpdateAnswer", { me: { updateAnswer: true } }),
        mockGQL("UpdateQuestion", { me: { updateQuestion: true } }),
        mockGQL("FetchUploadTasks", [{ me: { uploadTasks: [] } }]),
      ],
    });
    cy.visit("/record");
    cy.get("[data-cy=video-recorder]").should("exist");
    // video recorder showing
    cy.get("[data-cy=video-recorder]").should("be.visible");
    cy.get("[data-cy=upload-file]").should("be.visible");
    // video player hidden
    cy.get("[data-cy=video-player]").should("be.hidden");
    cy.get("[data-cy=slider]").should("be.hidden");
    cy.get("[data-cy=rerecord-video]").should("be.hidden");
    cy.get("[data-cy=upload-video]").should("be.hidden");
  });

  it("shows video player if mentor type is VIDEO and has video", () => {
    cyMockDefault(cy, {
      mentor: [videoMentor],
      gqlQueries: [
        mockGQL("UploadTaskDelete", { me: { uploadTaskDelete: true } }),
        mockGQL("UpdateAnswer", { me: { updateAnswer: true } }),
        mockGQL("UpdateQuestion", { me: { updateQuestion: true } }),
        mockGQL("FetchUploadTasks", [{ me: { uploadTasks: [] } }]),
      ],
    });
    cy.visit("/record?videoId=A2_1_1");
    cy.get("[data-cy=video-recorder]").should("exist");
    // video recorder hidden
    cy.get("[data-cy=video-recorder]").should("be.hidden");
    cy.get("[data-cy=upload-file]").should("be.hidden");
    // video player showing
    cy.get("[data-cy=video-player]").should("be.visible");
    cy.get("[data-cy=rerecord-video]").should("be.visible");
    cy.get("[data-cy=upload-video]").should("be.visible");
    // editing hidden
    cy.get("[data-cy=upload-video]").should("be.disabled");
    cy.get("[data-cy=slider]").should("not.be.hidden");
    // can re-record video
    cy.get("[data-cy=rerecord-video]").trigger("mouseover").click();
    cy.get("[data-cy=video-recorder]").should("be.visible");
    cy.get("[data-cy=upload-file]").should("be.visible");
    cy.get("[data-cy=video-player]").should("be.hidden");
    cy.get("[data-cy=slider]").should("be.hidden");
    cy.get("[data-cy=rerecord-video]").should("be.hidden");
    cy.get("[data-cy=upload-video]").should("be.hidden");
  });

  it("guide silhouette should be visible while trimming a video", () => {
    cyMockDefault(cy, {
      mentor: [
        videoMentor,
        updateMentorAnswer(videoMentor, "A1_1_1", {
          transcript: "My name is Clint Anderson",
        }),
      ],
      gqlQueries: [
        mockGQL("UploadTaskDelete", { me: { uploadTaskDelete: true } }),
        mockGQL("UpdateAnswer", { me: { updateAnswer: true } }),
        mockGQL("UpdateQuestion", { me: { updateQuestion: true } }),
        mockGQL("FetchUploadTasks", [
          {
            me: {
              uploadTasks: [
                {
                  question: {
                    _id: videoMentor.answers[0].question._id,
                    question: videoMentor.answers[0].question.question,
                  },
                  uploadStatus: "DONE",
                  transcript: "My name is Clint Anderson",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "video.mp4",
                    },
                  ],
                },
              ],
            },
          },
        ]),
      ],
    });
    cy.visit("/record");
    cyAttachUpload(cy).then(() => {
      cy.get("[data-cy=outline]").should("not.be.visible");
      cy.get("[data-cy=slider]")
        .invoke("mouseover")
        .trigger("mousedown", { button: 0 });
      cy.get("[data-cy=outline]").should("be.visible");
    });
  });

  it("progress bars shown for each upload task", () => {
    cyMockDefault(cy, {
      mentor: [videoMentor],
      gqlQueries: [
        mockGQL("UploadTaskDelete", { me: { uploadTaskDelete: true } }),
        mockGQL("UpdateAnswer", { me: { updateAnswer: true } }),
        mockGQL("UpdateQuestion", { me: { updateQuestion: true } }),
        mockGQL("FetchUploadTasks", [
          {
            me: {
              uploadTasks: [
                {
                  question: {
                    _id: videoMentor.answers[0].question._id,
                    question: videoMentor.answers[0].question.question,
                  },
                  uploadStatus: "UPLOAD_IN_PROGRESS",
                  uploadProgress: 0,
                  transcript: "",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
              ],
            },
          },
          {
            me: {
              uploadTasks: [
                {
                  question: {
                    _id: videoMentor.answers[0].question._id,
                    question: videoMentor.answers[0].question.question,
                  },
                  uploadStatus: "UPLOAD_IN_PROGRESS",
                  uploadProgress: 50,
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
              ],
            },
          },
          {
            me: {
              uploadTasks: [
                {
                  question: {
                    _id: videoMentor.answers[0].question._id,
                    question: videoMentor.answers[0].question.question,
                  },
                  uploadStatus: "UPLOAD_IN_PROGRESS",
                  uploadProgress: 100,
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
              ],
            },
          },
          {
            me: {
              uploadTasks: [
                {
                  question: {
                    _id: videoMentor.answers[0].question._id,
                    question: videoMentor.answers[0].question.question,
                  },
                  uploadStatus: "TRANSCRIBE_IN_PROGRESS",
                  uploadProgress: 100,
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
              ],
            },
          },
          {
            me: {
              uploadTasks: [
                {
                  question: {
                    _id: videoMentor.answers[0].question._id,
                    question: videoMentor.answers[0].question.question,
                  },
                  uploadStatus: "DONE",
                  uploadProgress: 100,
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
              ],
            },
          },
        ]),
      ],
    });
    cy.visit("/record");
    cy.get("[data-cy=upload-card-0]").should("exist");
    cy.get("[data-cy=upload-card-0]").within(($within) => {
      //ListItems primary text is under <span> and its secondary text is under <p>
      cy.get("[data-cy=card-answer-title]")
        .get("span")
        .should(
          "contain",
          videoMentor.answers[0].question.question.substr(0, 25)
        );
      cy.get("[data-cy=progress-bar]")
        .invoke("attr", "aria-valuenow")
        .should("eq", "0");
    });
    cy.get("[data-cy=upload-card-0]").within(($within) => {
      //ListItems primary text is under <span> and its secondary text is under <p>
      cy.get("[data-cy=card-answer-title]")
        .get("span")
        .should(
          "contain",
          videoMentor.answers[0].question.question.substr(0, 25)
        );
      cy.get("[data-cy=progress-bar]")
        .invoke("attr", "aria-valuenow")
        .should("eq", "50");
    });
    cy.get("[data-cy=upload-card-0]").within(($within) => {
      //ListItems primary text is under <span> and its secondary text is under <p>
      cy.get("[data-cy=card-answer-title]")
        .get("span")
        .should(
          "contain",
          videoMentor.answers[0].question.question.substr(0, 25)
        );
      cy.get("[data-cy=progress-bar]")
        .invoke("attr", "aria-valuenow")
        .should("eq", "100");
    });
  });

  it("can update transcript", () => {
    cyMockDefault(cy, {
      mentor: [
        chatMentor,
        updateMentorAnswer(chatMentor as unknown as Mentor, "A2_1_1", {
          transcript: "37",
        }),
      ],
      gqlQueries: [
        mockGQL("UploadTaskDelete", { me: { uploadTaskDelete: true } }),
        mockGQL("UpdateAnswer", { me: { updateAnswer: true } }),
        mockGQL("UpdateQuestion", { me: { updateQuestion: true } }),
        mockGQL("FetchUploadTasks", [{ me: { uploadTasks: [] } }]),
      ],
    });
    cy.visit("/record?videoId=A2_1_1,A3_1_1");
    cy.get("[data-cy=progress]").contains("Questions 1 / 2");
    cy.get("[data-cy=question-input]").within(($input) => {
      cy.get("textarea").should("have.text", "How old are you now?");
      cy.get("textarea").should("not.have.attr", "disabled");
    });
    cy.get("[data-cy=transcript-input]").within(($input) => {
      cy.get("textarea").should("have.text", "");
      cy.get("textarea").should("not.have.attr", "disabled");
    });
    cy.get("[data-cy=undo-transcript-btn]").should("be.disabled");

    cy.get("[data-cy=transcript-input]").type("37");
    cy.get("[data-cy=transcript-input]").within(($input) => {
      cy.get("textarea").should("have.text", "37");
    });
    cy.get("[data-cy=undo-transcript-btn]").should("not.be.disabled");
    cy.get("[data-cy=undo-transcript-btn]").trigger("mouseover").click();
    cy.get("[data-cy=transcript-input]").within(($input) => {
      cy.get("textarea").should("have.text", "");
    });
    cy.get("[data-cy=undo-transcript-btn]").should("be.disabled");
    cy.get("[data-cy=transcript-input]").type("37");
    cy.get("[data-cy=next-btn]").trigger("mouseover").click();
    cy.get("[data-cy=loading-dialog]");
    cy.get("[data-cy=back-btn]").trigger("mouseover").click();
    cy.get("[data-cy=transcript-input]").within(($input) => {
      cy.get("textarea").should("have.text", "37");
    });
    cy.get("[data-cy=undo-transcript-btn]").should("be.disabled");
  });

  it("cannot update question for a question not belonging to mentor", () => {
    cyMockDefault(cy, {
      mentor: chatMentor,
      gqlQueries: [
        mockGQL("UploadTaskDelete", { me: { uploadTaskDelete: true } }),
        mockGQL("UpdateAnswer", { me: { updateAnswer: true } }),
        mockGQL("UpdateQuestion", { me: { updateQuestion: true } }),
        mockGQL("FetchUploadTasks", [{ me: { uploadTasks: [] } }]),
      ],
    });
    cy.visit("/record?videoId=A1_1_1");
    cy.get("[data-cy=question-input]").within(($input) => {
      cy.get("textarea").should("have.attr", "disabled");
    });
    cy.get("[data-cy=undo-question-btn]").should("be.disabled");
  });

  it("can update question for a question belonging to mentor", () => {
    cyMockDefault(cy, {
      mentor: [
        chatMentor,
        updateMentorAnswer(chatMentor as Mentor, "A2_1_1", {
          question: {
            _id: "A2_1_1",
            question: "test",
            mentor: "clintanderson",
          },
        }),
      ],
      gqlQueries: [
        mockGQL("UploadTaskDelete", { me: { uploadTaskDelete: true } }),
        mockGQL("UpdateAnswer", { me: { updateAnswer: true } }),
        mockGQL("UpdateQuestion", { me: { updateQuestion: true } }),
        mockGQL("FetchUploadTasks", [{ me: { uploadTasks: [] } }]),
      ],
    });
    cy.visit("/record?videoId=A2_1_1,A3_1_1");
    cy.get("[data-cy=progress]").contains("Questions 1 / 2");
    cy.get("[data-cy=question-input]").within(($input) => {
      cy.get("textarea").should("have.text", "How old are you now?");
      cy.get("textarea").should("not.have.attr", "disabled");
    });
    cy.get("[data-cy=undo-question-btn]").should("be.disabled");

    cy.get("[data-cy=question-input]").type("test");
    cy.get("[data-cy=question-input]").within(($input) => {
      cy.get("textarea").should("have.text", "How old are you now?test");
      cy.get("textarea").should("not.have.attr", "disabled");
    });
    cy.get("[data-cy=undo-question-btn]").should("not.be.disabled");
    cy.get("[data-cy=undo-question-btn]").trigger("mouseover").click();
    cy.get("[data-cy=question-input]").within(($input) => {
      cy.get("textarea").should("have.text", "How old are you now?");
      cy.get("textarea").should("not.have.attr", "disabled");
    });
    cy.get("[data-cy=undo-question-btn]").should("be.disabled");

    cy.get("[data-cy=question-input]").type("test");
    cy.get("[data-cy=next-btn]").trigger("mouseover").click();
    cy.get("[data-cy=loading-dialog]");
    cy.get("[data-cy=back-btn]").trigger("mouseover").click();
    cy.get("[data-cy=undo-question-btn]").should("be.disabled");
    cy.get("[data-cy=question-input]").within(($input) => {
      cy.get("textarea").should("have.text", "How old are you now?test");
      cy.get("textarea").should("not.have.attr", "disabled");
    });
  });

  it("can upload a video file and receive a transcript", () => {
    cyMockDefault(cy, {
      mentor: [
        videoMentor,
        updateMentorAnswer(videoMentor, "A1_1_1", {
          transcript: "My name is Clint Anderson",
        }),
      ],
      gqlQueries: [
        mockGQL("UploadTaskDelete", { me: { uploadTaskDelete: true } }),
        mockGQL("UpdateAnswer", { me: { updateAnswer: true } }),
        mockGQL("UpdateQuestion", { me: { updateQuestion: true } }),
        mockGQL("FetchUploadTasks", [
          { me: { uploadTasks: [] } },
          {
            me: {
              uploadTasks: [
                {
                  question: {
                    _id: videoMentor.answers[0].question._id,
                    question: videoMentor.answers[0].question.question,
                  },
                  uploadStatus: "DONE",
                  transcript: "My name is Clint Anderson",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "video.mp4",
                    },
                  ],
                },
              ],
            },
          },
        ]),
      ],
    });
    cy.visit("/record");
    cy.get("[data-cy=video-recorder]").should("be.visible");
    cy.get("[data-cy=upload-file]").should("be.visible");
    // upload file
    cyAttachUpload(cy).then(() => {
      // show video
      cy.get("[data-cy=video-player]").should("be.visible");
      cy.get("[data-cy=rerecord-video]").should("be.visible");
      cy.get("[data-cy=upload-video]").should("be.visible");
      cy.get("[data-cy=trim-video]").should("not.exist");
      cy.get("[data-cy=slider]").should("be.visible");
      cy.get("[data-cy=upload-video]").should("not.be.disabled");
      cy.get("[data-cy=trim-video]").should("not.exist");
      // upload video
      cy.get("[data-cy=upload-video]").trigger("mouseover").click();
      cy.get("[data-cy=transcript-input]").within(($input) => {
        cy.get("textarea").should("have.text", "My name is Clint Anderson");
      });
    });
  });

  it("failed http upload displays error message in upload widget", () => {
    cyMockDefault(cy, { mentor: [videoMentor] });
    cyMockUpload(cy, { statusCode: 400 });
    cy.visit("/record");
    cyAttachUpload(cy).then(() => {
      cy.get("[data-cy=upload-video]").trigger("mouseover").click();
      cy.get("[data-cy=uploading-widget]").should("be.visible");

      cy.get("[data-cy=upload-card-0]").should("exist");
      cy.get("[data-cy=upload-card-0]").within(($within) => {
        cy.get("[data-cy=card-answer-title]")
          .get("p")
          .should("have.text", "Failed to upload file: Error 400: Bad Request");
      });
    });
  });

  it("failed gql process displays error message in upload widget", () => {
    cyMockDefault(cy, {
      mentor: [videoMentor],
      gqlQueries: [
        mockGQL("UploadTaskDelete", { me: { uploadTaskDelete: true } }),
        mockGQL("UpdateAnswer", { me: { updateAnswer: true } }),
        mockGQL("UpdateQuestion", { me: { updateQuestion: true } }),
        mockGQL("FetchUploadTasks", [
          {
            me: {
              uploadTasks: [
                {
                  question: {
                    _id: videoMentor.answers[0].question._id,
                    question: videoMentor.answers[0].question.question,
                  },
                  uploadStatus: "UPLOAD_IN_PROGRESS",
                  transcript: "",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
                {
                  question: {
                    _id: videoMentor.answers[1].question._id,
                    question: videoMentor.answers[1].question.question,
                  },
                  uploadStatus: "UPLOAD_IN_PROGRESS",
                  transcript: "",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
              ],
            },
          },
          {
            me: {
              uploadTasks: [
                {
                  question: {
                    _id: videoMentor.answers[0].question._id,
                    question: videoMentor.answers[0].question.question,
                  },
                  uploadStatus: "TRANSCRIBE_FAILED",
                  transcript: "i am kayla",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
                {
                  question: {
                    _id: videoMentor.answers[1].question._id,
                    question: videoMentor.answers[1].question.question,
                  },
                  uploadStatus: "UPLOAD_FAILED",
                  transcript: "",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
              ],
            },
          },
        ]),
      ],
    });
    cy.visit("/record");
    cy.get("[data-cy=upload-card-0]").should("exist");
    cy.get("[data-cy=upload-card-0]").within(($within) => {
      cy.get("[data-cy=card-answer-title]")
        .get("p")
        .should("have.text", "Failed to process file: TRANSCRIBE_FAILED");
    });
    cy.get("[data-cy=upload-card-1]").should("exist");
    cy.get("[data-cy=upload-card-1]").within(($within) => {
      cy.get("[data-cy=card-answer-title]")
        .get("p")
        .should("have.text", "Failed to process file: UPLOAD_FAILED");
    });
  });
  it("warns user of empty transcript", () => {
    cyMockDefault(cy, {
      mentor: [videoMentor],
      gqlQueries: [
        mockGQL("UploadTaskDelete", { me: { uploadTaskDelete: true } }),
        mockGQL("UpdateAnswer", { me: { updateAnswer: true } }),
        mockGQL("UpdateQuestion", { me: { updateQuestion: true } }),
        mockGQL("FetchUploadTasks", [
          {
            me: {
              uploadTasks: [
                {
                  question: {
                    _id: videoMentor.answers[0].question._id,
                    question: videoMentor.answers[0].question.question,
                  },
                  uploadStatus: "UPLOAD_IN_PROGRESS",
                  transcript: "",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
              ],
            },
          },
          {
            me: {
              uploadTasks: [
                {
                  question: {
                    _id: videoMentor.answers[0].question._id,
                    question: videoMentor.answers[0].question.question,
                  },
                  uploadStatus: "DONE",
                  transcript: "",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
              ],
            },
          },
        ]),
      ],
    });
    cy.visit("/record");
    cy.get("[data-cy=warn-empty-transcript]").should("exist");
    cy.get("[data-cy=upload-card-0]").within(($within) => {
      cy.get("p").should("have.text", "Needs Attention");
    });
  });

  it("does not warn user of empty transcript if idle video", () => {
    cyMockDefault(cy, {
      mentor: [videoMentor],
      gqlQueries: [
        mockGQL("UploadTaskDelete", { me: { uploadTaskDelete: true } }),
        mockGQL("UpdateAnswer", { me: { updateAnswer: true } }),
        mockGQL("UpdateQuestion", { me: { updateQuestion: true } }),
        mockGQL("FetchUploadTasks", [
          {
            me: {
              uploadTasks: [
                {
                  question: {
                    _id: videoMentor.answers[3].question._id,
                    question: videoMentor.answers[3].question.question,
                  },
                  uploadStatus: "UPLOAD_IN_PROGRESS",
                  transcript: "",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
              ],
            },
          },
          {
            me: {
              uploadTasks: [
                {
                  question: {
                    _id: videoMentor.answers[3].question._id,
                    question: videoMentor.answers[3].question.question,
                  },
                  uploadStatus: "DONE",
                  transcript: "",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "http://google.mp4",
                    },
                  ],
                },
              ],
            },
          },
        ]),
      ],
    });
    cy.visit("/record");
    cy.get("[data-cy=next-btn]").invoke("mouseover").click();
    cy.get("[data-cy=next-btn]").invoke("mouseover").click();
    cy.get("[data-cy=next-btn]").invoke("mouseover").click();
    cy.get("[data-cy=warn-empty-transcript]").should("not.exist");
  });

  it("Can visit record via url param array", () => {
    cyMockDefault(cy, {
      mentor: [videoMentor],
      gqlQueries: [
        mockGQL("UploadTaskDelete", { me: { uploadTaskDelete: true } }),
        mockGQL("UpdateAnswer", { me: { updateAnswer: true } }),
        mockGQL("UpdateQuestion", { me: { updateQuestion: true } }),
        mockGQL("FetchUploadTasks", []),
      ],
    });
    cy.visit("/record?videoId=A2_1_1,A3_1_1");
    cy.get("[data-cy=question-input]").within(($input) => {
      cy.get("textarea").should("have.text", "How old are you now?");
    });
    cy.get("[data-cy=next-btn]").invoke("mouseover").click();
    cy.get("[data-cy=question-input]").within(($input) => {
      cy.get("textarea").should("have.text", "Where do you live?");
    });
  });
});
