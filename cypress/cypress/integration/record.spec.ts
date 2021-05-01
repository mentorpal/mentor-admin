/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu
The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { cySetup, cyMockDefault, mockGQL } from "../support/functions";
import { Mentor, MentorType, QuestionType, Status } from "../support/types";
import {
  completeMentor,
  completeQuestion,
  completeSubject,
  completeSubjectQuestion,
  updateMentorAnswer,
} from "../support/helpers";

const mentor: Mentor = completeMentor({
  _id: "clintanderson",
  mentorType: MentorType.CHAT,
  lastTrainedAt: null,
  subjects: [
    completeSubject({
      _id: "background",
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
      recordedAt: "",
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
      recordedAt: "",
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
      recordedAt: "",
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
      recordedAt: "",
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
      recordedAt: "",
      status: Status.INCOMPLETE,
    },
  ],
});

const mentor2: Mentor = completeMentor({
  _id: "clintanderson",
  mentorType: MentorType.VIDEO,
  lastTrainedAt: null,
  subjects: [
    completeSubject({
      _id: "background",
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
      recordedAt: "",
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
      recordedAt: "",
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
      recordedAt: "",
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
      recordedAt: "",
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
      recordedAt: "",
      status: Status.INCOMPLETE,
    },
  ],
});

const mentor3: Mentor = completeMentor({
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
      transcript:
        "My name is Clint Anderson and I'm a Nuclear Electrician's Mate",
      recordedAt: "Today",
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
      recordedAt: "",
      status: Status.INCOMPLETE,
    },
  ],
});

describe("Record", () => {
  describe("search params", () => {
    it("shows all questions if no filters", () => {
      cySetup(cy);
      cyMockDefault(cy, { mentor });
      cy.visit("/record");
      cy.get("[data-cy=progress]").contains("Questions 1 / 5");
      cy.get("[data-cy=question-input]").within($input => {
        cy.get("textarea").should('have.text', "Who are you and what do you do?")
        cy.get("textarea").should("have.attr", "disabled");
      });
      cy.get("[data-cy=transcript-input]").within($input => {
        cy.get("textarea").should('have.text', "My name is Clint Anderson and I'm a Nuclear Electrician's Mate")
        cy.get("textarea").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=status]").contains("COMPLETE");
      cy.get("[data-cy=back-btn]").should("be.disabled");
      cy.get("[data-cy=next-btn]").trigger("mouseover").click();

      cy.get("[data-cy=progress]").contains("Questions 2 / 5");
      cy.get("[data-cy=question-input]").within($input => {
        cy.get("textarea").should('have.text', "How old are you now?")
        cy.get("textarea").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=transcript-input]").within($input => {
        cy.get("textarea").should('have.text', "")
        cy.get("textarea").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=status]").contains("INCOMPLETE");
      cy.get("[data-cy=back-btn]").should("not.be.disabled");
      cy.get("[data-cy=next-btn]").trigger("mouseover").click();

      cy.get("[data-cy=progress]").contains("Questions 3 / 5");
      cy.get("[data-cy=question-input]").within($input => {
        cy.get("textarea").should('have.text', "Please look at the camera for 30 seconds without speaking. Try to remain in the same position.")
        cy.get("textarea").should("have.attr", "disabled");
      });
      cy.get("[data-cy=transcript-input]").within($input => {
        cy.get("textarea").should('have.text', "")
        cy.get("textarea").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=status]").contains("INCOMPLETE");
      cy.get("[data-cy=back-btn]").should("not.be.disabled");
      cy.get("[data-cy=next-btn]").trigger("mouseover").click();

      cy.get("[data-cy=progress]").contains("Questions 4 / 5");
      cy.get("[data-cy=question-input]").within($input => {
        cy.get("textarea").should('have.text', "Please give a short introduction of yourself, which includes your name, current job, and title.")
        cy.get("textarea").should("have.attr", "disabled");
      });
      cy.get("[data-cy=transcript-input]").within($input => {
        cy.get("textarea").should('have.text', "My name is Clint Anderson and I'm a Nuclear Electrician's Mate")
        cy.get("textarea").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=status]").contains("COMPLETE");
      cy.get("[data-cy=back-btn]").should("not.be.disabled");
      cy.get("[data-cy=next-btn]").trigger("mouseover").click();

      cy.get("[data-cy=progress]").contains("Questions 5 / 5");
      cy.get("[data-cy=question-input]").within($input => {
        cy.get("textarea").should('have.text', "Please repeat the following: 'I couldn't understand the question. Try asking me something else.'")
        cy.get("textarea").should("have.attr", "disabled");
      });
      cy.get("[data-cy=transcript-input]").within($input => {
        cy.get("textarea").should('have.text', "")
        cy.get("textarea").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=status]").contains("INCOMPLETE");
      cy.get("[data-cy=back-btn]").should("not.be.disabled");
      cy.get("[data-cy=next-btn]").should("not.exist");
      cy.get("[data-cy=done-btn]").should("exist");
    });

    it("shows all incomplete questions if ?status=INCOMPLETE", () => {
      cySetup(cy);
      cyMockDefault(cy, { mentor });
      cy.visit("/record?status=INCOMPLETE");
      cy.get("[data-cy=progress]").contains("Questions 1 / 3");
      cy.get("[data-cy=question-input]").within($input => {
        cy.get("textarea").should('have.text', "How old are you now?")
        cy.get("textarea").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=transcript-input]").within($input => {
        cy.get("textarea").should('have.text', "")
        cy.get("textarea").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=status]").contains("INCOMPLETE");
      cy.get("[data-cy=back-btn]").should("be.disabled");
      cy.get("[data-cy=next-btn]").trigger("mouseover").click();

      cy.get("[data-cy=progress]").contains("Questions 2 / 3");
      cy.get("[data-cy=question-input]").within($input => {
        cy.get("textarea").should('have.text', "Please look at the camera for 30 seconds without speaking. Try to remain in the same position.")
        cy.get("textarea").should("have.attr", "disabled");
      });
      cy.get("[data-cy=transcript-input]").within($input => {
        cy.get("textarea").should('have.text', "")
        cy.get("textarea").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=status]").contains("INCOMPLETE");
      cy.get("[data-cy=back-btn]").should("not.be.disabled");
      cy.get("[data-cy=next-btn]").trigger("mouseover").click();

      cy.get("[data-cy=progress]").contains("Questions 3 / 3");
      cy.get("[data-cy=question-input]").within($input => {
        cy.get("textarea").should('have.text', "Please repeat the following: 'I couldn't understand the question. Try asking me something else.'")
        cy.get("textarea").should("have.attr", "disabled");
      });
      cy.get("[data-cy=transcript-input]").within($input => {
        cy.get("textarea").should('have.text', "")
        cy.get("textarea").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=status]").contains("INCOMPLETE");
      cy.get("[data-cy=back-btn]").should("not.be.disabled");
      cy.get("[data-cy=next-btn]").should("not.exist");
      cy.get("[data-cy=done-btn]").should("exist");
    });

    it("shows all complete questions if ?status=COMPLETE", () => {
      cySetup(cy);
      cyMockDefault(cy, { mentor });
      cy.visit("/record?status=COMPLETE");
      cy.get("[data-cy=progress]").contains("Questions 1 / 2");
      cy.get("[data-cy=question-input]").within($input => {
        cy.get("textarea").should('have.text', "Who are you and what do you do?")
        cy.get("textarea").should("have.attr", "disabled");
      });
      cy.get("[data-cy=transcript-input]").within($input => {
        cy.get("textarea").should('have.text', "My name is Clint Anderson and I'm a Nuclear Electrician's Mate")
        cy.get("textarea").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=status]").contains("COMPLETE");
      cy.get("[data-cy=back-btn]").should("be.disabled");
      cy.get("[data-cy=next-btn]").trigger("mouseover").click();

      cy.get("[data-cy=progress]").contains("Questions 2 / 2");
      cy.get("[data-cy=question-input]").within($input => {
        cy.get("textarea").should('have.text', "Please give a short introduction of yourself, which includes your name, current job, and title.")
        cy.get("textarea").should("have.attr", "disabled");
      });
      cy.get("[data-cy=transcript-input]").within($input => {
        cy.get("textarea").should('have.text', "My name is Clint Anderson and I'm a Nuclear Electrician's Mate")
        cy.get("textarea").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=status]").contains("COMPLETE");
      cy.get("[data-cy=back-btn]").should("not.be.disabled");
      cy.get("[data-cy=next-btn]").should("not.exist");
      cy.get("[data-cy=done-btn]").should("exist");
    });

    it("shows a single question if ?videoId={questionId}", () => {
      cySetup(cy);
      cyMockDefault(cy, { mentor });
      cy.visit("/record?videoId=A1_1_1");
      cy.get("[data-cy=progress]").contains("Questions 1 / 1");
      cy.get("[data-cy=question-input]").within($input => {
        cy.get("textarea").should('have.text', "Who are you and what do you do?")
        cy.get("textarea").should("have.attr", "disabled");
      });
      cy.get("[data-cy=transcript-input]").within($input => {
        cy.get("textarea").should('have.text', "My name is Clint Anderson and I'm a Nuclear Electrician's Mate")
        cy.get("textarea").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=status]").contains("COMPLETE");
      cy.get("[data-cy=back-btn]").should("be.disabled");
      cy.get("[data-cy=next-btn]").should("not.exist");
      cy.get("[data-cy=done-btn]").should("exist");
    });

    it("shows multiple questions if ?videoId={questionId}&videoId={questionId}", () => {
      cySetup(cy);
      cyMockDefault(cy, { mentor });
      cy.visit("/record?videoId=A1_1_1&videoId=A3_1_1");
      cy.get("[data-cy=progress]").contains("Questions 1 / 2");
      cy.get("[data-cy=question-input]").within($input => {
        cy.get("textarea").should('have.text', "Who are you and what do you do?")
        cy.get("textarea").should("have.attr", "disabled");
      });
      cy.get("[data-cy=transcript-input]").within($input => {
        cy.get("textarea").should('have.text', "My name is Clint Anderson and I'm a Nuclear Electrician's Mate")
        cy.get("textarea").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=status]").contains("COMPLETE");
      cy.get("[data-cy=back-btn]").should("be.disabled");
      cy.get("[data-cy=next-btn]").trigger("mouseover").click();

      cy.get("[data-cy=progress]").contains("Questions 2 / 2");
      cy.get("[data-cy=question-input]").within($input => {
        cy.get("textarea").should('have.text', "Please look at the camera for 30 seconds without speaking. Try to remain in the same position.")
        cy.get("textarea").should("have.attr", "disabled");
      });
      cy.get("[data-cy=transcript-input]").within($input => {
        cy.get("textarea").should('have.text', "")
        cy.get("textarea").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=status]").contains("INCOMPLETE");
      cy.get("[data-cy=back-btn]").should("not.be.disabled");
      cy.get("[data-cy=next-btn]").should("not.exist");
      cy.get("[data-cy=done-btn]").should("exist");
    });

    it("shows all questions for a subject if ?subject={subjectId}", () => {
      cySetup(cy);
      cyMockDefault(cy, { mentor });
      cy.visit("/record?subject=background");
      cy.get("[data-cy=progress]").contains("Questions 1 / 2");
      cy.get("[data-cy=question-input]").within($input => {
        cy.get("textarea").should('have.text', "Who are you and what do you do?")
        cy.get("textarea").should("have.attr", "disabled");
      });
      cy.get("[data-cy=transcript-input]").within($input => {
        cy.get("textarea").should('have.text', "My name is Clint Anderson and I'm a Nuclear Electrician's Mate")
        cy.get("textarea").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=status]").contains("COMPLETE");
      cy.get("[data-cy=back-btn]").should("be.disabled");
      cy.get("[data-cy=next-btn]").trigger("mouseover").click();

      cy.get("[data-cy=progress]").contains("Questions 2 / 2");
      cy.get("[data-cy=question-input]").within($input => {
        cy.get("textarea").should('have.text', "How old are you now?")
        cy.get("textarea").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=transcript-input]").within($input => {
        cy.get("textarea").should('have.text', "")
        cy.get("textarea").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=status]").contains("INCOMPLETE");
      cy.get("[data-cy=back-btn]").should("not.be.disabled");
      cy.get("[data-cy=next-btn]").should("not.exist");
      cy.get("[data-cy=done-btn]").should("exist");
    });

    it("shows all incomplete questions for a subject if ?subject={subjectId}&status=INCOMPLETE", () => {
      cySetup(cy);
      cyMockDefault(cy, { mentor });
      cy.visit("/record?subject=background&status=INCOMPLETE");
      cy.get("[data-cy=progress]").contains("Questions 1 / 1");
      cy.get("[data-cy=question-input]").within($input => {
        cy.get("textarea").should('have.text', "How old are you now?")
        cy.get("textarea").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=transcript-input]").within($input => {
        cy.get("textarea").should('have.text', "")
        cy.get("textarea").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=status]").contains("INCOMPLETE");
      cy.get("[data-cy=back-btn]").should("be.disabled");
      cy.get("[data-cy=next-btn]").should("not.exist");
      cy.get("[data-cy=done-btn]").should("exist");
    });

    it("shows all complete questions for a subject if ?subject={subjectId}&status=COMPLETE", () => {
      cySetup(cy);
      cyMockDefault(cy, { mentor });
      cy.visit("/record?subject=background&status=COMPLETE");
      cy.get("[data-cy=progress]").contains("Questions 1 / 1");
      cy.get("[data-cy=question-input]").within($input => {
        cy.get("textarea").should('have.text', "Who are you and what do you do?")
        cy.get("textarea").should("have.attr", "disabled");
      });
      cy.get("[data-cy=transcript-input]").within($input => {
        cy.get("textarea").should('have.text', "My name is Clint Anderson and I'm a Nuclear Electrician's Mate")
        cy.get("textarea").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=status]").contains("COMPLETE");
      cy.get("[data-cy=back-btn]").should("be.disabled");
      cy.get("[data-cy=next-btn]").should("not.exist");
      cy.get("[data-cy=done-btn]").should("exist");
    });

    it("shows all questions for a category in a subject if ?category={categoryId}", () => {
      cySetup(cy);
      cyMockDefault(cy, { mentor });
      cy.visit("/record?subject=background&category=cat");
      cy.get("[data-cy=progress]").contains("Questions 1 / 1");
      cy.get("[data-cy=question-input]").within($input => {
        cy.get("textarea").should('have.text', "Who are you and what do you do?")
        cy.get("textarea").should("have.attr", "disabled");
      });
      cy.get("[data-cy=transcript-input]").within($input => {
        cy.get("textarea").should('have.text', "My name is Clint Anderson and I'm a Nuclear Electrician's Mate")
        cy.get("textarea").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=status]").contains("COMPLETE");
      cy.get("[data-cy=back-btn]").should("be.disabled");
      cy.get("[data-cy=next-btn]").should("not.exist");
      cy.get("[data-cy=done-btn]").should("exist");
    });
  });

  it("hides video if mentor type is CHAT", () => {
    cySetup(cy);
    cyMockDefault(cy, { mentor });
    cy.visit("/record");
    cy.get("[data-cy=video-recorder]").should("not.exist");
  });

  it("shows video recorder if mentor type is VIDEO and no video", () => {
    cySetup(cy);
    cyMockDefault(cy, { mentor: mentor2 });
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
    cy.get("[data-cy=trim-video]").should("not.exist");
  });

  it("shows video player if mentor type is VIDEO and has video", () => {
    cySetup(cy);
    cyMockDefault(cy, { mentor: mentor3 });
    cy.intercept("**/videos/mentors/clintanderson/A1_1_1.mp4", { fixture: "video.mp4" });
    cy.visit("/record?videoId=A1_1_1");
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
    cy.get("[data-cy=slider]").should("be.hidden");
    cy.get("[data-cy=trim-video]").should("not.exist");
    // can re-record video
    cy.get("[data-cy=rerecord-video]").trigger("mouseover").click();
    cy.get("[data-cy=video-recorder]").should("be.visible");
    cy.get("[data-cy=upload-file]").should("be.visible");
    cy.get("[data-cy=video-player]").should("be.hidden");
    cy.get("[data-cy=slider]").should("be.hidden");
    cy.get("[data-cy=rerecord-video]").should("be.hidden");
    cy.get("[data-cy=upload-video]").should("be.hidden");
    cy.get("[data-cy=trim-video]").should("not.exist");
  });

  it("can upload a video file", () => {
    cySetup(cy);
    cyMockDefault(cy, { mentor: mentor2 });
    cy.intercept("**/videos/mentors/clintanderson/A1_1_1.mp4", { fixture: "video.mp4" });
    cy.visit("/record");
    cy.get("[data-cy=video-recorder]").should("be.visible");
    cy.get("[data-cy=upload-file]").should("be.visible");
    // upload file
    cy.fixture('video.mp4').then(fileContent => {
      cy.get('input[type="file"]').attachFile({
        fileContent: fileContent.toString(),
        fileName: 'video.mp4',
        mimeType: 'video/mp4'
      });
    });
    // show file
    cy.get("[data-cy=video-player]").should("be.visible");
    cy.get("[data-cy=rerecord-video]").should("be.visible");
    cy.get("[data-cy=upload-video]").should("be.visible");
    cy.get("[data-cy=trim-video]").should("be.visible");
    cy.get("[data-cy=slider]").should("be.visible");
    cy.get("[data-cy=upload-video]").should("not.be.disabled");
    cy.get("[data-cy=trim-video]").should("be.disabled");
    // 
    cy.get("[data-cy=next-btn]").trigger("mouseover").click();
    cy.get("[data-cy=video-recorder]").should("be.visible");
    cy.get("[data-cy=upload-file]").should("be.visible");
  })

  it.skip("can seek and trim a recorded video", () => {
    // TODO: currently video does not load in cypress but loads outside of it...
    cySetup(cy);
    cyMockDefault(cy, { mentor: mentor3 });
    cy.intercept("**/videos/mentors/clintanderson/A1_1_1.mp4", { fixture: "video.mp4" });
    cy.visit("/record?videoId=A1_1_1");
  });

  it("can update status", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: [
        mentor,
        updateMentorAnswer((mentor as unknown) as Mentor, "A2_1_1", {
          status: Status.COMPLETE,
        }),
      ],
      gqlQueries: [mockGQL("updateAnswer", true, true)],
    });
    cy.visit("/record?subject=background&status=INCOMPLETE");
    cy.get("[data-cy=progress]").contains("Questions 1 / 1");
    cy.get("[data-cy=question-input]").within($input => {
      cy.get("textarea").should('have.text', "How old are you now?")
      cy.get("textarea").should("not.have.attr", "disabled");
    });
    cy.get("[data-cy=transcript-input]").within($input => {
      cy.get("textarea").should('have.text', "")
      cy.get("textarea").should("not.have.attr", "disabled");
    });
    cy.get("[data-cy=status]").contains("INCOMPLETE");
    cy.get("[data-cy=save-btn]").should("be.disabled");

    cy.get("[data-cy=select-status]").trigger("mouseover").click();
    cy.get("[data-cy=complete]").trigger("mouseover").click();
    cy.get("[data-cy=status]").contains("COMPLETE");
    cy.get("[data-cy=save-btn]").should("not.be.disabled");
    cy.get("[data-cy=save-btn]").trigger("mouseover").click();
    cy.get("[data-cy=status]").contains("COMPLETE");
    cy.get("[data-cy=save-btn]").should("be.disabled");
  });

  it("can update transcript", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: [
        mentor,
        updateMentorAnswer((mentor as unknown) as Mentor, "A2_1_1", {
          transcript: "37",
        }),
      ],
      gqlQueries: [mockGQL("updateAnswer", true, true)],
    });
    cy.visit("/record?subject=background&status=INCOMPLETE");
    cy.get("[data-cy=progress]").contains("Questions 1 / 1");
    cy.get("[data-cy=question-input]").within($input => {
      cy.get("textarea").should('have.text', "How old are you now?")
      cy.get("textarea").should("not.have.attr", "disabled");
    });
    cy.get("[data-cy=transcript-input]").within($input => {
      cy.get("textarea").should('have.text', "")
      cy.get("textarea").should("not.have.attr", "disabled");
    });
    cy.get("[data-cy=save-btn]").should("be.disabled");
    cy.get("[data-cy=undo-transcript-btn]").should("be.disabled");

    cy.get("[data-cy=transcript-input]").type("37");
    cy.get("[data-cy=transcript-input]").within($input => {
      cy.get("textarea").should('have.text', "37")
    });
    cy.get("[data-cy=save-btn]").should("not.be.disabled");
    cy.get("[data-cy=undo-transcript-btn]").should("not.be.disabled");
    cy.get("[data-cy=undo-transcript-btn]").trigger("mouseover").click();
    cy.get("[data-cy=transcript-input]").within($input => {
      cy.get("textarea").should('have.text', "")
    });
    cy.get("[data-cy=save-btn]").should("be.disabled");
    cy.get("[data-cy=undo-transcript-btn]").should("be.disabled");
    cy.get("[data-cy=transcript-input]").type("37");
    cy.get("[data-cy=save-btn]").trigger("mouseover").click();

    cy.get("[data-cy=transcript-input]").within($input => {
      cy.get("textarea").should('have.text', "37")
    });
    cy.get("[data-cy=save-btn]").should("be.disabled");
    cy.get("[data-cy=undo-transcript-btn]").should("be.disabled");
  });

  it("cannot update question for a question not belonging to mentor", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor,
    });
    cy.visit("/record?videoId=A1_1_1");
    cy.get("[data-cy=question-input]").within($input => {
      cy.get("textarea").should("have.attr", "disabled");
    });
    cy.get("[data-cy=undo-question-btn]").should("be.disabled");
  });

  it("can update question for a question belonging to mentor", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: [
        mentor,
        updateMentorAnswer(mentor as Mentor, "A2_1_1", {
          question: {
            _id: "A2_1_1",
            question: "test",
            mentor: "clintanderson",
          },
        }),
      ],
      gqlQueries: [
        mockGQL("updateAnswer", true, true),
        mockGQL("updateQuestion", true, true),
      ],
    });
    cy.visit("/record?videoId=A2_1_1");
    cy.get("[data-cy=progress]").contains("Questions 1 / 1");
    cy.get("[data-cy=question-input]").within($input => {
      cy.get("textarea").should('have.text', "How old are you now?")
      cy.get("textarea").should("not.have.attr", "disabled");
    });
    cy.get("[data-cy=undo-question-btn]").should("be.disabled");
    cy.get("[data-cy=save-btn]").should("be.disabled");

    cy.get("[data-cy=question-input]").type("test");
    cy.get("[data-cy=question-input]").within($input => {
      cy.get("textarea").should('have.text', "How old are you now?test")
      cy.get("textarea").should("not.have.attr", "disabled");
    });
    cy.get("[data-cy=save-btn]").should("not.be.disabled");
    cy.get("[data-cy=undo-question-btn]").should("not.be.disabled");
    cy.get("[data-cy=undo-question-btn]").trigger("mouseover").click();
    cy.get("[data-cy=question-input]").within($input => {
      cy.get("textarea").should('have.text', "How old are you now?")
      cy.get("textarea").should("not.have.attr", "disabled");
    });
    cy.get("[data-cy=save-btn]").should("be.disabled");
    cy.get("[data-cy=undo-question-btn]").should("be.disabled");

    cy.get("[data-cy=question-input]").type("test");
    cy.get("[data-cy=save-btn]").trigger("mouseover").click();
    cy.get("[data-cy=save-btn]").should("be.disabled");
    cy.get("[data-cy=undo-question-btn]").should("be.disabled");
    cy.get("[data-cy=question-input]").within($input => {
      cy.get("textarea").should('have.text', "How old are you now?test")
      cy.get("textarea").should("not.have.attr", "disabled");
    });
  });
});