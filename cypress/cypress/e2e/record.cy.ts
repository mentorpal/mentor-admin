/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  cyMockDefault,
  mockGQL,
  cyAttachUpload,
  cyMockUpload,
} from "../support/functions";
import {
  Mentor,
  MentorType,
  QuestionType,
  Status,
  MediaType,
  UtteranceName,
} from "../support/types";
import {
  completeMentor,
  completeQuestion,
  completeSubject,
  completeSubjectQuestion,
  taskListBuild,
  updateMentorAnswer,
  uploadTaskMediaBuild,
} from "../support/helpers";
import clintMarkdown from "../fixtures/mentor/clint_markdown";
import {
  videoMentor,
  videoQuestions,
} from "../fixtures/recording/video_mentors";

const chatMentor: Mentor = completeMentor({
  _id: "clintanderson",
  mentorType: MentorType.CHAT,
  lastTrainedAt: null,
  keywords: [],
  subjects: [
    completeSubject({
      _id: "background",
      name: "background",
      categories: [
        { id: "cat", name: "cat", description: "cat", defaultTopics: [] },
      ],
      questions: [
        completeSubjectQuestion({
          question: {
            _id: "A1_1_1",
            clientId: "C1_1_1",
            question: "Question 1",
            name: null,
            type: QuestionType.QUESTION,
            paraphrases: [],
          },
          category: {
            id: "cat",
            name: "cat",
            description: "cat",
            defaultTopics: [],
          },
          topics: [],
        }),
        completeSubjectQuestion({
          question: {
            _id: "A2_1_1",
            clientId: "C2_1_1",
            question: "Question 2",
            name: null,
            type: QuestionType.QUESTION,
            paraphrases: [],
          },
        }),
      ],
    }),
    completeSubject({
      _id: "idle_and_initial_recordings",
      questions: [
        completeSubjectQuestion({
          question: {
            _id: "A3_1_1",
            clientId: "C3_1_1",
            question: "Question 3",
            name: null,
            type: QuestionType.UTTERANCE,
            paraphrases: [],
          },
        }),
        completeSubjectQuestion({
          question: {
            _id: "A4_1_1",
            clientId: "C4_1_1",
            question: "Question 4",
            name: null,
            type: QuestionType.UTTERANCE,
            paraphrases: [],
          },
        }),
        completeSubjectQuestion({
          question: {
            _id: "A5_1_1",
            clientId: "C5_1_1",
            question: "Question 5",
            name: null,
            type: QuestionType.UTTERANCE,
            paraphrases: [],
          },
        }),
        completeSubjectQuestion({
          question: {
            _id: "A6_1_1",
            clientId: "C6_1_1",
            question: "Question 6",
            name: null,
            type: QuestionType.QUESTION,
            paraphrases: [],
          },
        }),
      ],
    }),
  ],
  answers: [
    {
      _id: "A1_1_1",
      question: {
        _id: "A1_1_1",
        clientId: "C1_1_1",
        question: "Question 1",
        name: null,
        type: QuestionType.QUESTION,
        paraphrases: [],
      },
      transcript:
        "My name is Clint Anderson and I'm a Nuclear Electrician's Mate",
      status: Status.COMPLETE,
      previousVersions: [],
    },
    {
      previousVersions: [],
      _id: "A2_1_1",
      question: {
        _id: "A2_1_1",
        clientId: "C2_1_1",
        question: "Question 2",
        name: null,
        type: QuestionType.QUESTION,
        paraphrases: [],
      },
      transcript: "",
      status: Status.INCOMPLETE,
    },
    {
      previousVersions: [],
      _id: "A3_1_1",
      question: {
        _id: "A3_1_1",
        clientId: "C3_1_1",
        question: "Question 3",
        name: null,
        type: QuestionType.UTTERANCE,
        paraphrases: [],
      },
      transcript: "",
      status: Status.INCOMPLETE,
    },
    {
      previousVersions: [],
      _id: "A4_1_1",
      question: {
        _id: "A4_1_1",
        clientId: "C4_1_1",
        question: "Question 4",
        name: null,
        type: QuestionType.UTTERANCE,
        paraphrases: [],
      },
      transcript:
        "My name is Clint Anderson and I'm a Nuclear Electrician's Mate",
      status: Status.COMPLETE,
    },
    {
      previousVersions: [],
      _id: "A5_1_1",
      question: {
        _id: "A5_1_1",
        clientId: "C5_1_1",
        question: "Question 5",
        name: null,
        type: QuestionType.UTTERANCE,
        paraphrases: [],
      },
      transcript: "",
      status: Status.INCOMPLETE,
    },
  ],
});
const chatQuestions = [
  {
    _id: "A1_1_1",
    question: "Who are you and what do you do?",
    name: "A1_1_1",
    type: QuestionType.QUESTION,
    paraphrases: [],
  },
  completeQuestion({
    _id: "A2_1_1",
    question: "How old are you now?",
    mentor: "clintanderson",
  }),
  completeQuestion({
    _id: "A3_1_1",
    question:
      "Please look at the camera for 30 seconds without speaking. Try to remain in the same position.",
  }),
  completeQuestion({
    _id: "A4_1_1",
    question:
      "Please give a short introduction of yourself, which includes your name, current job, and title.",
  }),
  completeQuestion({
    _id: "A5_1_1",
    question:
      "Please repeat the following: 'I couldn't understand the question. Try asking me something else.'",
  }),
  completeQuestion({
    _id: "A6_1_1",
    question: "",
  }),
];

describe("Record", () => {
  describe("search params", () => {
    it("shows all questions if no filters", () => {
      cyMockDefault(cy, {
        mentor: chatMentor,
        questions: chatQuestions,
      });
      cy.visit("/record");
      cy.get("[data-cy=progress]").contains("Questions 1 / 5");
      cy.get("[data-cy=question-text]").contains(
        "Who are you and what do you do?"
      );
      cy.get("[data-cy=question-edit]").should("not.exist");
      cy.get(".editor-class").within(($input) => {
        cy.get("[data-text]").should(
          "have.text",
          "My name is Clint Anderson and I'm a Nuclear Electrician's Mate"
        );
        cy.get("[data-text]").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=status]").contains("Active");
      cy.get("[data-cy=back-btn]").should("be.disabled");
      cy.get("[data-cy=next-btn]").trigger("mouseover").click();

      cy.get("[data-cy=progress]").contains("Questions 2 / 5");
      cy.get("[data-cy=question-text]").contains("How old are you now?");
      cy.get("[data-cy=question-edit]").should("exist");
      cy.get(".editor-class").within(($input) => {
        cy.get("[data-text]").should("have.text", "");
        cy.get("[data-text]").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=back-btn]").should("not.be.disabled");
      cy.get("[data-cy=next-btn]").trigger("mouseover").click();

      cy.get("[data-cy=progress]").contains("Questions 3 / 5");
      cy.get("[data-cy=question-text]").contains(
        "Please look at the camera for 30 seconds without speaking. Try to remain in the same position."
      );
      cy.get("[data-cy=question-edit]").should("not.exist");
      cy.get(".editor-class").within(($input) => {
        cy.get("[data-text]").should("have.text", "");
        cy.get("[data-text]").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=back-btn]").should("not.be.disabled");
      cy.get("[data-cy=next-btn]").trigger("mouseover").click();

      cy.get("[data-cy=progress]").contains("Questions 4 / 5");
      cy.get("[data-cy=question-text]").contains(
        "Please give a short introduction of yourself, which includes your name, current job, and title."
      );
      cy.get("[data-cy=question-edit]").should("not.exist");
      cy.get(".editor-class").within(($input) => {
        cy.get("[data-text]").should(
          "have.text",
          "My name is Clint Anderson and I'm a Nuclear Electrician's Mate"
        );
        cy.get("[data-text]").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=status]").contains("Active");
      cy.get("[data-cy=back-btn]").should("not.be.disabled");
      cy.get("[data-cy=next-btn]").trigger("mouseover").click();

      cy.get("[data-cy=progress]").contains("Questions 5 / 5");
      cy.get("[data-cy=question-text]").contains(
        "Please repeat the following: 'I couldn't understand the question. Try asking me something else.'"
      );
      cy.get("[data-cy=question-edit]").should("not.exist");
      cy.get(".editor-class").within(($input) => {
        cy.get("[data-text]").should("have.text", "");
        cy.get("[data-text]").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=back-btn]").should("not.be.disabled");
      cy.get("[data-cy=next-btn]").should("not.exist");
      cy.get("[data-cy=done-btn]").should("exist");
    });

    it("shows all incomplete questions if ?status=INCOMPLETE", () => {
      cyMockDefault(cy, { mentor: chatMentor, questions: chatQuestions });
      cy.visit("/record?status=INCOMPLETE");
      cy.get("[data-cy=progress]").contains("Questions 1 / 3");
      cy.get("[data-cy=question-text]").contains("How old are you now?");
      cy.get("[data-cy=question-edit]").should("exist");
      cy.get(".editor-class").within(($input) => {
        cy.get("[data-text]").should("have.text", "");
        cy.get("[data-text]").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=back-btn]").should("be.disabled");
      cy.get("[data-cy=next-btn]").trigger("mouseover").click();

      cy.get("[data-cy=progress]").contains("Questions 2 / 3");
      cy.get("[data-cy=question-text]").contains(
        "Please look at the camera for 30 seconds without speaking. Try to remain in the same position."
      );
      cy.get("[data-cy=question-edit]").should("not.exist");
      cy.get(".editor-class").within(($input) => {
        cy.get("[data-text]").should("have.text", "");
        cy.get("[data-text]").should("not.have.attr", "disabled");
      });

      cy.get("[data-cy=back-btn]").should("not.be.disabled");
      cy.get("[data-cy=next-btn]").trigger("mouseover").click();

      cy.get("[data-cy=progress]").contains("Questions 3 / 3");
      cy.get("[data-cy=question-text]").contains(
        "Please repeat the following: 'I couldn't understand the question. Try asking me something else.'"
      );
      cy.get("[data-cy=question-edit]").should("not.exist");
      cy.get(".editor-class").within(($input) => {
        cy.get("[data-text]").should("have.text", "");
        cy.get("[data-text]").should("not.have.attr", "disabled");
      });

      cy.get("[data-cy=back-btn]").should("not.be.disabled");
      cy.get("[data-cy=next-btn]").should("not.exist");
      cy.get("[data-cy=done-btn]").should("exist");
    });

    it("shows all complete questions if ?status=COMPLETE", () => {
      cyMockDefault(cy, { mentor: chatMentor, questions: chatQuestions });
      cy.visit("/record?status=COMPLETE");
      cy.get("[data-cy=progress]").contains("Questions 1 / 2");
      cy.get("[data-cy=question-text]").contains(
        "Who are you and what do you do?"
      );
      cy.get("[data-cy=question-edit]").should("not.exist");
      cy.get(".editor-class").within(($input) => {
        cy.get("[data-text]").should(
          "have.text",
          "My name is Clint Anderson and I'm a Nuclear Electrician's Mate"
        );
        cy.get("[data-text]").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=status]").contains("Active");
      cy.get("[data-cy=back-btn]").should("be.disabled");
      cy.get("[data-cy=next-btn]").trigger("mouseover").click();

      cy.get("[data-cy=progress]").contains("Questions 2 / 2");
      cy.get("[data-cy=question-text]").contains(
        "Please give a short introduction of yourself, which includes your name, current job, and title."
      );
      cy.get("[data-cy=question-edit]").should("not.exist");
      cy.get(".editor-class").within(($input) => {
        cy.get("[data-text]").should(
          "have.text",
          "My name is Clint Anderson and I'm a Nuclear Electrician's Mate"
        );
        cy.get("[data-text]").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=status]").contains("Active");
      cy.get("[data-cy=back-btn]").should("not.be.disabled");
      cy.get("[data-cy=next-btn]").should("not.exist");
      cy.get("[data-cy=done-btn]").should("exist");
    });

    it("shows a single question if ?videoId={questionId}", () => {
      cyMockDefault(cy, { mentor: chatMentor, questions: chatQuestions });
      cy.visit("/record?videoId=A1_1_1");
      cy.get("[data-cy=progress]").contains("Questions 1 / 1");
      cy.get("[data-cy=question-text]").contains(
        "Who are you and what do you do?"
      );
      cy.get("[data-cy=question-edit]").should("not.exist");
      cy.get(".editor-class").within(($input) => {
        cy.get("[data-text]").should(
          "have.text",
          "My name is Clint Anderson and I'm a Nuclear Electrician's Mate"
        );
        cy.get("[data-text]").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=status]").contains("Active");
      cy.get("[data-cy=back-btn]").should("be.disabled");
      cy.get("[data-cy=next-btn]").should("not.exist");
      cy.get("[data-cy=done-btn]").should("exist");
    });

    it("shows multiple questions if ?videoId={questionId}&videoId={questionId}", () => {
      cyMockDefault(cy, { mentor: chatMentor, questions: chatQuestions });
      cy.visit("/record?videoId=A1_1_1&videoId=A3_1_1");
      cy.get("[data-cy=progress]").contains("Questions 1 / 2");
      cy.get("[data-cy=question-text]").contains(
        "Who are you and what do you do?"
      );
      cy.get("[data-cy=question-edit]").should("not.exist");
      cy.get(".editor-class").within(($input) => {
        cy.get("[data-text]").should(
          "have.text",
          "My name is Clint Anderson and I'm a Nuclear Electrician's Mate"
        );
        cy.get("[data-text]").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=status]").contains("Active");
      cy.get("[data-cy=back-btn]").should("be.disabled");
      cy.get("[data-cy=next-btn]").trigger("mouseover").click();

      cy.get("[data-cy=progress]").contains("Questions 2 / 2");
      cy.get("[data-cy=question-text]").contains(
        "Please look at the camera for 30 seconds without speaking. Try to remain in the same position."
      );
      cy.get("[data-cy=question-edit]").should("not.exist");
      cy.get(".editor-class").within(($input) => {
        cy.get("[data-text]").should("have.text", "");
        cy.get("[data-text]").should("not.have.attr", "disabled");
      });

      cy.get("[data-cy=back-btn]").should("not.be.disabled");
      cy.get("[data-cy=next-btn]").should("not.exist");
      cy.get("[data-cy=done-btn]").should("exist");
    });

    it("shows all questions for a subject if ?subject={subjectId}", () => {
      cyMockDefault(cy, { mentor: chatMentor, questions: chatQuestions });
      cy.visit("/record?subject=background");
      cy.get("[data-cy=progress]").contains("Questions 1 / 2");
      cy.get("[data-cy=question-text]").contains(
        "Who are you and what do you do?"
      );
      cy.get("[data-cy=question-edit]").should("not.exist");
      cy.get(".editor-class").within(($input) => {
        cy.get("[data-text]").should(
          "have.text",
          "My name is Clint Anderson and I'm a Nuclear Electrician's Mate"
        );
        cy.get("[data-text]").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=status]").contains("Active");
      cy.get("[data-cy=back-btn]").should("be.disabled");
      cy.get("[data-cy=next-btn]").trigger("mouseover").click();

      cy.get("[data-cy=progress]").contains("Questions 2 / 2");
      cy.get("[data-cy=question-text]").contains("How old are you now?");
      cy.get("[data-cy=question-edit]").should("exist");
      cy.get(".editor-class").within(($input) => {
        cy.get("[data-text]").should("have.text", "");
        cy.get("[data-text]").should("not.have.attr", "disabled");
      });

      cy.get("[data-cy=back-btn]").should("not.be.disabled");
      cy.get("[data-cy=next-btn]").should("not.exist");
      cy.get("[data-cy=done-btn]").should("exist");
    });

    it("shows all incomplete questions for a subject if ?subject={subjectId}&status=INCOMPLETE", () => {
      cyMockDefault(cy, { mentor: chatMentor, questions: chatQuestions });
      cy.visit("/record?subject=background&status=INCOMPLETE");
      cy.get("[data-cy=progress]").contains("Questions 1 / 1");
      cy.get("[data-cy=question-text]").contains("How old are you now?");
      cy.get("[data-cy=question-edit]").should("exist");
      cy.get(".editor-class").within(($input) => {
        cy.get("[data-text]").should("have.text", "");
        cy.get("[data-text]").should("not.have.attr", "disabled");
      });

      cy.get("[data-cy=back-btn]").should("be.disabled");
      cy.get("[data-cy=next-btn]").should("not.exist");
      cy.get("[data-cy=done-btn]").should("exist");
    });

    it("shows all complete questions for a subject if ?subject={subjectId}&status=COMPLETE", () => {
      cyMockDefault(cy, { mentor: chatMentor, questions: chatQuestions });
      cy.visit("/record?subject=background&status=COMPLETE");
      cy.get("[data-cy=progress]").contains("Questions 1 / 1");
      cy.get("[data-cy=question-text]").contains(
        "Who are you and what do you do?"
      );
      cy.get("[data-cy=question-edit]").should("not.exist");
      cy.get(".editor-class").within(($input) => {
        cy.get("[data-text]").should(
          "have.text",
          "My name is Clint Anderson and I'm a Nuclear Electrician's Mate"
        );
        cy.get("[data-text]").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=status]").contains("Active");
      cy.get("[data-cy=back-btn]").should("be.disabled");
      cy.get("[data-cy=next-btn]").should("not.exist");
      cy.get("[data-cy=done-btn]").should("exist");
    });

    it("shows all questions for a category in a subject if ?category={categoryId}", () => {
      cyMockDefault(cy, { mentor: chatMentor, questions: chatQuestions });
      cy.visit("/record?subject=background&category=cat");
      cy.get("[data-cy=progress]").contains("Questions 1 / 1");
      cy.get("[data-cy=question-text]").contains(
        "Who are you and what do you do?"
      );
      cy.get("[data-cy=question-edit]").should("not.exist");
      cy.get(".editor-class").within(($input) => {
        cy.get("[data-text]").should(
          "have.text",
          "My name is Clint Anderson and I'm a Nuclear Electrician's Mate"
        );
        cy.get("[data-text]").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=status]").contains("Active");
      cy.get("[data-cy=back-btn]").should("be.disabled");
      cy.get("[data-cy=next-btn]").should("not.exist");
      cy.get("[data-cy=done-btn]").should("exist");
    });

    it("shows NONE status answers under COMPLETE for CHAT mentor", () => {
      cyMockDefault(cy, {
        mentor: completeMentor({
          _id: "clintanderson",
          mentorType: MentorType.CHAT,
          lastTrainedAt: null,
          subjects: [
            completeSubject({
              _id: "background",
              name: "background",
              categories: [
                {
                  id: "cat",
                  name: "cat",
                  description: "cat",
                  defaultTopics: [],
                },
              ],
              questions: [
                completeSubjectQuestion({
                  question: {
                    _id: "A1_1_1",
                    clientId: "C1_1_1",
                    question: "Question 1",
                    name: null,
                    type: QuestionType.QUESTION,
                    paraphrases: [],
                  },
                  category: {
                    id: "cat",
                    name: "cat",
                    description: "cat",
                    defaultTopics: [],
                  },
                  topics: [],
                }),
                completeSubjectQuestion({
                  question: {
                    _id: "A2_1_1",
                    clientId: "C2_1_1",
                    question: "Question 2",
                    name: null,
                    type: QuestionType.QUESTION,
                    paraphrases: [],
                  },
                }),
              ],
            }),
            completeSubject({
              _id: "idle_and_initial_recordings",
              questions: [
                completeSubjectQuestion({
                  question: {
                    _id: "A3_1_1",
                    clientId: "C3_1_1",
                    question: "Question 3",
                    name: null,
                    type: QuestionType.UTTERANCE,
                    paraphrases: [],
                  },
                }),
                completeSubjectQuestion({
                  question: {
                    _id: "A4_1_1",
                    clientId: "C4_1_1",
                    question: "Question 4",
                    name: null,
                    type: QuestionType.UTTERANCE,
                    paraphrases: [],
                  },
                }),
                completeSubjectQuestion({
                  question: {
                    _id: "A5_1_1",
                    clientId: "C5_1_1",
                    question: "Question 5",
                    name: null,
                    type: QuestionType.UTTERANCE,
                    paraphrases: [],
                  },
                }),
                completeSubjectQuestion({
                  question: {
                    _id: "A6_1_1",
                    clientId: "C6_1_1",
                    question: "Question 6",
                    name: null,
                    type: QuestionType.QUESTION,
                    paraphrases: [],
                  },
                }),
              ],
            }),
          ],
          answers: [
            {
              previousVersions: [],
              _id: "A1_1_1",
              question: {
                _id: "A1_1_1",
                clientId: "C1_1_1",
                question: "Question 1",
                name: null,
                type: QuestionType.QUESTION,
                paraphrases: [],
              },
              transcript:
                "My name is Clint Anderson and I'm a Nuclear Electrician's Mate",
              status: Status.NONE,
            },
            {
              _id: "A2_1_1",
              previousVersions: [],
              question: {
                _id: "A2_1_1",
                clientId: "C2_1_1",
                question: "Question 2",
                name: null,
                type: QuestionType.QUESTION,
                paraphrases: [],
              },
              transcript: "",
              status: Status.NONE,
            },
            {
              previousVersions: [],
              _id: "A3_1_1",
              question: {
                _id: "A3_1_1",
                clientId: "C3_1_1",
                question: "Question 3",
                name: null,
                type: QuestionType.UTTERANCE,
                paraphrases: [],
              },
              transcript: "",
              status: Status.NONE,
            },
            {
              previousVersions: [],
              _id: "A4_1_1",
              question: {
                _id: "A4_1_1",
                clientId: "C4_1_1",
                question: "Question 4",
                name: null,
                type: QuestionType.UTTERANCE,
                paraphrases: [],
              },
              transcript:
                "My name is Clint Anderson and I'm a Nuclear Electrician's Mate",
              status: Status.NONE,
            },
            {
              previousVersions: [],
              _id: "A5_1_1",
              question: {
                _id: "A5_1_1",
                clientId: "C5_1_1",
                question: "Question 5",
                name: null,
                type: QuestionType.UTTERANCE,
                paraphrases: [],
              },
              transcript: "",
              status: Status.NONE,
            },
          ],
        }),
        questions: chatQuestions,
      });
      cy.visit("/record?status=INCOMPLETE");
      cy.get("[data-cy=progress]").contains("Questions 1 / 3");
      cy.get("[data-cy=question-text]").contains("How old are you now?");
      cy.get("[data-cy=question-edit]").should("exist");
      cy.get(".editor-class").within(($input) => {
        cy.get("[data-text]").should("have.text", "");
        cy.get("[data-text]").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=status]").contains("None");
      cy.get("[data-cy=back-btn]").should("be.disabled");
      cy.get("[data-cy=next-btn]").trigger("mouseover").click();

      cy.get("[data-cy=progress]").contains("Questions 2 / 3");
      cy.get("[data-cy=question-text]").contains(
        "Please look at the camera for 30 seconds without speaking. Try to remain in the same position."
      );
      cy.get("[data-cy=question-edit]").should("not.exist");
      cy.get(".editor-class").within(($input) => {
        cy.get("[data-text]").should("have.text", "");
        cy.get("[data-text]").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=status]").contains("None");
      cy.get("[data-cy=back-btn]").should("not.be.disabled");
      cy.get("[data-cy=next-btn]").trigger("mouseover").click();

      cy.get("[data-cy=progress]").contains("Questions 3 / 3");
      cy.get("[data-cy=question-text]").contains(
        "Please repeat the following: 'I couldn't understand the question. Try asking me something else.'"
      );
      cy.get("[data-cy=question-edit]").should("not.exist");
      cy.get(".editor-class").within(($input) => {
        cy.get("[data-text]").should("have.text", "");
        cy.get("[data-text]").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=status]").contains("None");
      cy.get("[data-cy=back-btn]").should("not.be.disabled");
      cy.get("[data-cy=next-btn]").should("not.exist");
      cy.get("[data-cy=done-btn]").should("exist");
    });

    it("shows NONE status answer under INCOMPLETE for CHAT mentor", () => {
      cyMockDefault(cy, {
        mentor: completeMentor({
          _id: "clintanderson",
          mentorType: MentorType.CHAT,
          lastTrainedAt: null,
          subjects: [
            completeSubject({
              _id: "background",
              name: "background",
              categories: [
                {
                  id: "cat",
                  name: "cat",
                  description: "cat",
                  defaultTopics: [],
                },
              ],
              questions: [
                completeSubjectQuestion({
                  question: {
                    _id: "A1_1_1",
                    clientId: "C1_1_1",
                    question: "Question 1",
                    name: null,
                    type: QuestionType.QUESTION,
                    paraphrases: [],
                  },
                  category: {
                    id: "cat",
                    name: "cat",
                    description: "cat",
                    defaultTopics: [],
                  },
                  topics: [],
                }),
                completeSubjectQuestion({
                  question: {
                    _id: "A2_1_1",
                    clientId: "C2_1_1",
                    question: "Question 2",
                    name: null,
                    type: QuestionType.QUESTION,
                    paraphrases: [],
                  },
                }),
              ],
            }),
            completeSubject({
              _id: "idle_and_initial_recordings",
              questions: [
                completeSubjectQuestion({
                  question: {
                    _id: "A3_1_1",
                    clientId: "C3_1_1",
                    question: "Question 3",
                    name: null,
                    type: QuestionType.UTTERANCE,
                    paraphrases: [],
                  },
                }),
                completeSubjectQuestion({
                  question: {
                    _id: "A4_1_1",
                    clientId: "C4_1_1",
                    question: "Question 4",
                    name: null,
                    type: QuestionType.UTTERANCE,
                    paraphrases: [],
                  },
                }),
                completeSubjectQuestion({
                  question: {
                    _id: "A5_1_1",
                    clientId: "C5_1_1",
                    question: "Question 5",
                    name: null,
                    type: QuestionType.UTTERANCE,
                    paraphrases: [],
                  },
                }),
                completeSubjectQuestion({
                  question: {
                    _id: "A6_1_1",
                    clientId: "C6_1_1",
                    question: "Question 6",
                    name: null,
                    type: QuestionType.QUESTION,
                    paraphrases: [],
                  },
                }),
              ],
            }),
          ],
          answers: [
            {
              previousVersions: [],
              _id: "A1_1_1",
              question: {
                _id: "A1_1_1",
                clientId: "C1_1_1",
                question: "Question 1",
                name: null,
                type: QuestionType.QUESTION,
                paraphrases: [],
              },
              transcript:
                "My name is Clint Anderson and I'm a Nuclear Electrician's Mate",
              status: Status.NONE,
            },
            {
              previousVersions: [],
              _id: "A2_1_1",
              question: {
                _id: "A2_1_1",
                clientId: "C2_1_1",
                question: "Question 2",
                name: null,
                type: QuestionType.QUESTION,
                paraphrases: [],
              },
              transcript: "",
              status: Status.NONE,
            },
            {
              previousVersions: [],
              _id: "A3_1_1",
              question: {
                _id: "A3_1_1",
                clientId: "C3_1_1",
                question: "Question 3",
                name: null,
                type: QuestionType.UTTERANCE,
                paraphrases: [],
              },
              transcript: "",
              status: Status.NONE,
            },
            {
              previousVersions: [],
              _id: "A4_1_1",
              question: {
                _id: "A4_1_1",
                clientId: "C4_1_1",
                question: "Question 4",
                name: null,
                type: QuestionType.UTTERANCE,
                paraphrases: [],
              },
              transcript:
                "My name is Clint Anderson and I'm a Nuclear Electrician's Mate",
              status: Status.NONE,
            },
            {
              previousVersions: [],
              _id: "A5_1_1",
              question: {
                _id: "A5_1_1",
                clientId: "C5_1_1",
                question: "Question 5",
                name: null,
                type: QuestionType.UTTERANCE,
                paraphrases: [],
              },
              transcript: "",
              status: Status.NONE,
            },
          ],
        }),
        questions: chatQuestions,
      });
      cy.visit("/record?status=COMPLETE");
      cy.get("[data-cy=progress]").contains("Questions 1 / 2");
      cy.get("[data-cy=question-text]").contains(
        "Who are you and what do you do?"
      );
      cy.get("[data-cy=question-edit]").should("not.exist");
      cy.get(".editor-class").within(($input) => {
        cy.get("[data-text]").should(
          "have.text",
          "My name is Clint Anderson and I'm a Nuclear Electrician's Mate"
        );
        cy.get("[data-text]").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=status]").contains("None");
      cy.get("[data-cy=back-btn]").should("be.disabled");
      cy.get("[data-cy=next-btn]").trigger("mouseover").click();

      cy.get("[data-cy=progress]").contains("Questions 2 / 2");
      cy.get("[data-cy=question-text]").contains(
        "Please give a short introduction of yourself, which includes your name, current job, and title."
      );
      cy.get("[data-cy=question-edit]").should("not.exist");
      cy.get(".editor-class").within(($input) => {
        cy.get("[data-text]").should(
          "have.text",
          "My name is Clint Anderson and I'm a Nuclear Electrician's Mate"
        );
        cy.get("[data-text]").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=status]").contains("None");
      cy.get("[data-cy=back-btn]").should("not.be.disabled");
      cy.get("[data-cy=next-btn]").should("not.exist");
      cy.get("[data-cy=done-btn]").should("exist");
    });

    it("shows NONE status answers under INCOMPLETE for VIDEO mentor", () => {
      cyMockDefault(cy, {
        mentor: completeMentor({
          _id: "clintanderson",
          mentorType: MentorType.VIDEO,
          lastTrainedAt: null,
          answers: [
            {
              previousVersions: [],
              _id: "A1_1_1",
              question: {
                _id: "A1_1_1",
                clientId: "C1_1_1",
                name: "A1_1_1",
                type: QuestionType.QUESTION,
                paraphrases: [],
                question: "Who are you and what do you do?",
              },
              transcript: "",
              webMedia: {
                type: MediaType.VIDEO,
                tag: "web",
                url: "A1_1_1.mp4",
                vttText: "",
              },
              status: Status.NONE,
            },
            {
              previousVersions: [],
              _id: "A2_1_1",
              question: {
                _id: "A2_1_1",
                clientId: "C2_1_1",
                name: "A2_1_1",
                type: QuestionType.QUESTION,
                paraphrases: [],
                question: "How old are you now?",
              },
              transcript: "I'm 37 years old",
              status: Status.NONE,
            },
            {
              previousVersions: [],
              _id: "A3_1_1",
              question: {
                _id: "A3_1_1",
                clientId: "C3_1_1",
                name: "A3_1_1",
                type: QuestionType.UTTERANCE,
                paraphrases: [],
                question: "Where do you live?",
              },
              transcript: "In Howard City, Michigan",
              webMedia: {
                type: MediaType.VIDEO,
                tag: "web",
                url: "A3_1_1.mp4",
                vttText: "",
              },
              status: Status.NONE,
            },
            {
              previousVersions: [],
              _id: "A4_1_1",
              question: {
                _id: "A4_1_1",
                clientId: "C4_1_1",
                name: UtteranceName.IDLE,
                type: QuestionType.UTTERANCE,
                paraphrases: [],
                question: "How old are you now?",
              },
              transcript: "",
              webMedia: {
                type: MediaType.VIDEO,
                tag: "web",
                url: "A4_1_1.mp4",
                vttText: "",
              },
              status: Status.NONE,
            },
          ],
          subjects: [
            completeSubject({
              _id: "subject_1",
              name: "Subject 1",
              questions: [
                completeSubjectQuestion({
                  question: {
                    _id: "A1_1_1",
                    clientId: "C1_1_1",
                    question: "Question 1",
                    name: null,
                    type: QuestionType.QUESTION,
                    paraphrases: [],
                  },
                  category: {
                    id: "cat",
                    name: "cat",
                    description: "cat",
                    defaultTopics: [],
                  },
                }),
                completeSubjectQuestion({
                  question: {
                    _id: "A2_1_1",
                    clientId: "C2_1_1",
                    question: "Question 2",
                    name: null,
                    type: QuestionType.QUESTION,
                    paraphrases: [],
                  },
                  category: {
                    id: "cat",
                    name: "cat",
                    description: "cat",
                    defaultTopics: [],
                  },
                }),
              ],
              categories: [
                {
                  id: "cat",
                  name: "cat",
                  description: "cat",
                  defaultTopics: [],
                },
              ],
            }),
            completeSubject({
              _id: "subject_2",
              name: "Subject 2",
              questions: [
                completeSubjectQuestion({
                  question: {
                    _id: "A3_1_1",
                    clientId: "C3_1_1",
                    question: "Question 3",
                    name: null,
                    type: QuestionType.UTTERANCE,
                    paraphrases: [],
                  },
                }),
                completeSubjectQuestion({
                  question: {
                    _id: "A4_1_1",
                    clientId: "C4_1_1",
                    question: "Question 4",
                    name: null,
                    type: QuestionType.UTTERANCE,
                    paraphrases: [],
                  },
                }),
              ],
            }),
          ],
        }),
        questions: videoQuestions,
      });
      cy.visit("/record?status=INCOMPLETE");
      cy.get("[data-cy=progress]").contains("Questions 1 / 2");
      cy.get("[data-cy=question-text]").contains(
        "Who are you and what do you do?"
      );
      cy.get("[data-cy=question-edit]").should("not.exist");
      cy.get("[data-cy=status]").contains("None");
      cy.get("[data-cy=next-btn]").trigger("mouseover").click();

      cy.get("[data-cy=progress]").contains("Questions 2 / 2");
      cy.get("[data-cy=question-text]").contains("How old are you now?");
      cy.get("[data-cy=question-edit]").should("exist");
      cy.get("[data-cy=status]").contains("None");
    });

    it("shows NONE status answers under COMPLETE for VIDEO mentor", () => {
      cyMockDefault(cy, {
        mentor: completeMentor({
          _id: "clintanderson",
          mentorType: MentorType.VIDEO,
          lastTrainedAt: null,
          answers: [
            {
              previousVersions: [],
              _id: "A1_1_1",
              question: {
                _id: "A1_1_1",
                clientId: "C1_1_1",
                name: "A1_1_1",
                type: QuestionType.QUESTION,
                paraphrases: [],
                question: "Who are you and what do you do?",
              },
              transcript: "",
              webMedia: {
                type: MediaType.VIDEO,
                tag: "web",
                url: "A1_1_1.mp4",
                vttText: "",
              },
              status: Status.NONE,
            },
            {
              previousVersions: [],
              _id: "A2_1_1",
              question: {
                _id: "A2_1_1",
                clientId: "C2_1_1",
                name: "A2_1_1",
                type: QuestionType.QUESTION,
                paraphrases: [],
                question: "How old are you now?",
              },
              transcript: "I'm 37 years old",
              status: Status.NONE,
            },
            {
              previousVersions: [],
              _id: "A3_1_1",
              question: {
                _id: "A3_1_1",
                clientId: "C3_1_1",
                name: "A3_1_1",
                type: QuestionType.UTTERANCE,
                paraphrases: [],
                question: "Where do you live?",
              },
              transcript: "In Howard City, Michigan",
              webMedia: {
                type: MediaType.VIDEO,
                tag: "web",
                url: "A3_1_1.mp4",
                vttText: "",
              },
              status: Status.NONE,
            },
            {
              previousVersions: [],
              _id: "A4_1_1",
              question: {
                _id: "A4_1_1",
                clientId: "C4_1_1",
                name: UtteranceName.IDLE,
                type: QuestionType.UTTERANCE,
                paraphrases: [],
                question: "How old are you now?",
              },
              transcript: "",
              webMedia: {
                type: MediaType.VIDEO,
                tag: "web",
                url: "A4_1_1.mp4",
                vttText: "",
              },
              status: Status.NONE,
            },
          ],
          subjects: [
            completeSubject({
              _id: "subject_1",
              name: "Subject 1",
              questions: [
                completeSubjectQuestion({
                  question: {
                    _id: "A1_1_1",
                    clientId: "C1_1_1",
                    question: "Question 1",
                    name: null,
                    type: QuestionType.QUESTION,
                    paraphrases: [],
                  },
                  category: {
                    id: "cat",
                    name: "cat",
                    description: "cat",
                    defaultTopics: [],
                  },
                }),
                completeSubjectQuestion({
                  question: {
                    _id: "A2_1_1",
                    clientId: "C2_1_1",
                    question: "Question 2",
                    name: null,
                    type: QuestionType.QUESTION,
                    paraphrases: [],
                  },
                  category: {
                    id: "cat",
                    name: "cat",
                    description: "cat",
                    defaultTopics: [],
                  },
                }),
              ],
              categories: [
                {
                  id: "cat",
                  name: "cat",
                  description: "cat",
                  defaultTopics: [],
                },
              ],
            }),
            completeSubject({
              _id: "subject_2",
              name: "Subject 2",
              questions: [
                completeSubjectQuestion({
                  question: {
                    _id: "A3_1_1",
                    clientId: "C3_1_1",
                    question: "Question 3",
                    name: null,
                    type: QuestionType.UTTERANCE,
                    paraphrases: [],
                  },
                }),
                completeSubjectQuestion({
                  question: {
                    _id: "A4_1_1",
                    clientId: "C4_1_1",
                    question: "Question 4",
                    name: null,
                    type: QuestionType.UTTERANCE,
                    paraphrases: [],
                  },
                }),
              ],
            }),
          ],
        }),
        questions: videoQuestions,
      });
      cy.visit("/record?status=COMPLETE");
      cy.get("[data-cy=progress]").contains("Questions 1 / 2");
      cy.get("[data-cy=question-text]").contains("Where do you live?");
      cy.get("[data-cy=question-edit]").should("exist");
      cy.get("[data-cy=status]").contains("None");
      cy.get("[data-cy=next-btn]").trigger("mouseover").click();

      cy.get("[data-cy=progress]").contains("Questions 2 / 2");
      cy.get("[data-cy=question-text]").contains("Record an idle video");
      cy.get("[data-cy=question-edit]").should("exist");
      cy.get("[data-cy=status]").contains("None");
    });
  });

  describe("Recording Session Ending Page", () => {
    it("Done Button after recording sessions leads to session ending page", () => {
      cyMockDefault(cy, { mentor: chatMentor, questions: chatQuestions });
      cy.visit("/record?subject=background");
      cy.get("[data-cy=progress]").contains("Questions 1 / 2");
      cy.get("[data-cy=question-text]").contains(
        "Who are you and what do you do?"
      );
      cy.get("[data-cy=question-edit]").should("not.exist");
      cy.get(".editor-class").within(($input) => {
        cy.get("[data-text]").should(
          "have.text",
          "My name is Clint Anderson and I'm a Nuclear Electrician's Mate"
        );
        cy.get("[data-text]").should("not.have.attr", "disabled");
      });
      cy.get("[data-cy=status]").contains("Active");
      cy.get("[data-cy=back-btn]").should("be.disabled");
      cy.get("[data-cy=next-btn]").trigger("mouseover").click();
      cy.get("[data-cy=progress]").contains("Questions 2 / 2");
      cy.get("[data-cy=question-text]").contains("How old are you now?");
      cy.get("[data-cy=question-edit]").should("exist");
      cy.get(".editor-class").within(($input) => {
        cy.get("[data-text]").should("have.text", "");
        cy.get("[data-text]").should("not.have.attr", "disabled");
      });

      cy.get("[data-cy=back-btn]").should("not.be.disabled");
      cy.get("[data-cy=next-btn]").should("not.exist");
      cy.get("[data-cy=done-btn]").should("exist");
      cy.get("[data-cy=done-btn]").trigger("mouseover").click();
    });
  });

  it("When an upload finishes on record view, should swap user to video view", () => {
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
                  ...taskListBuild("IN_PROGRESS"),
                  transcript: "i am kayla",
                  ...uploadTaskMediaBuild(),
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
                  ...taskListBuild("IN_PROGRESS"),
                  transcript: "i am kayla",
                  ...uploadTaskMediaBuild(),
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
                  ...taskListBuild("DONE"),
                  transcript: "i am kayla",
                  ...uploadTaskMediaBuild(),
                },
              ],
            },
          },
        ]),
      ],
    });
    cy.visit("/record");
    //upload in progress
    cy.get("[data-cy=upload-video]").should("contain.text", "Processing");
    cy.get("[data-cy=upload-video]").should("be.disabled");
    cy.get("[data-cy=video-player]").should("not.be.visible");
    cy.wait(3000);
    //upload complete, should swap to video view
    cy.get("[data-cy=upload-video]").should("contain.text", "Upload Video");
    cy.get("[data-cy=upload-video]").should("be.disabled");
    cy.get("[data-cy=video-player]").should("be.visible");
  });

  //Test that once you click the title card, it goes to that card appropriate answer
  it("tapping an item from active uploads (via upload button) takes you to that item", () => {
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
                  ...taskListBuild("IN_PROGRESS"),
                  ...uploadTaskMediaBuild(),
                },
              ],
            },
          },
        ]),
      ],
    });
    cy.visit("/record");
    cy.get("[data-cy=next-btn]").invoke("mouseover").click();
    cy.get("[data-cy=active-upload-card-0]").within(($i) => {
      cy.get("[data-cy=card-answer-title]").trigger("mouseover").click();
    });
    cy.get("[data-cy=question-text]").contains(
      "Who are you and what do you do?"
    );
    cy.get("[data-cy=question-edit]").should("not.exist");
  });

  it("User gets guidance to know they can move on and record another answer", () => {
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
                  ...taskListBuild("IN_PROGRESS"),
                  ...uploadTaskMediaBuild(),
                },
                {
                  question: {
                    _id: videoMentor.answers[1].question._id,
                    question: videoMentor.answers[1].question.question,
                  },
                  ...taskListBuild("DONE"),
                  ...uploadTaskMediaBuild(),
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

                  ...taskListBuild("FAILED"),
                  ...uploadTaskMediaBuild(),
                  transcript: "i am kayla",
                },
                {
                  question: {
                    _id: videoMentor.answers[1].question._id,
                    question: videoMentor.answers[1].question.question,
                  },
                  ...taskListBuild("DONE"),
                  ...uploadTaskMediaBuild(),
                  transcript: "i am kayla",
                },
                {
                  question: {
                    _id: videoMentor.answers[2].question._id,
                    question: videoMentor.answers[2].question.question,
                  },

                  ...taskListBuild("DONE"),
                  ...uploadTaskMediaBuild(),
                  transcript: "i am kayla",
                },
              ],
            },
          },
        ]),
      ],
    });
    cy.visit("/record");
    cy.get("[data-cy=notification-dialog-button]").click();
    cy.get("[data-cy=active-upload-card-2]").within(($within) => {
      cy.get("[data-cy=clear-upload]").trigger("mouseover").click();
    });
    cy.get("[data-cy=active-upload-card-2]").should("not.exist");
    cy.get("[data-cy=active-upload-card-1]").within(($within) => {
      cy.get("[data-cy=clear-upload]").trigger("mouseover").click();
    });
    cy.get("[data-cy=active-upload-card-1]").should("not.exist");
  });

  it("upload button changes to process while an upload is in progress", () => {
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

                  ...taskListBuild("IN_PROGRESS"),
                  ...uploadTaskMediaBuild(),
                  transcript: "i am kayla",
                },
                {
                  question: {
                    _id: videoMentor.answers[1].question._id,
                    question: videoMentor.answers[1].question.question,
                  },

                  ...taskListBuild("DONE"),
                  ...uploadTaskMediaBuild(),
                  transcript: "i am kayla",
                },
              ],
            },
          },
        ]),
      ],
    });
    cy.visit("/record");
    cy.get("[data-cy=upload-video]").should("have.text", "Processing");
    cy.get("[data-cy=upload-video]").should("be.disabled");
    cy.get("[data-cy=upload-video]").should("be.visible");
    cy.get("[data-cy=next-btn]").trigger("mouseover").click();
    cy.get("[data-cy=upload-video]").should("have.text", "Upload Video");
    cy.get("[data-cy=upload-video]").should("be.disabled");
    cy.get("[data-cy=back-btn]").trigger("mouseover").click();
  });

  it("video player not visible while upload in progress", () => {
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

                  ...taskListBuild("IN_PROGRESS"),
                  ...uploadTaskMediaBuild(),
                  transcript: "i am kayla",
                },
                {
                  question: {
                    _id: videoMentor.answers[1].question._id,
                    question: videoMentor.answers[1].question.question,
                  },
                  ...taskListBuild("DONE"),
                  ...uploadTaskMediaBuild(),
                  transcript: "i am kayla",
                },
                {
                  question: {
                    _id: videoMentor.answers[2].question._id,
                    question: videoMentor.answers[2].question.question,
                  },

                  ...taskListBuild("DONE"),
                  ...uploadTaskMediaBuild(),
                  transcript: "i am kayla",
                },
              ],
            },
          },
        ]),
      ],
    });
    cy.visit("/record");
    cy.get("[data-cy=video-player]").should("not.be.visible");
  });

  it("upload button does not change to trim when trim is not editable", () => {
    cyMockDefault(cy, {
      mentor: { ...videoMentor, isDirty: true },
      questions: videoQuestions,
    });
    cy.visit("/record?videoId=A2_1_1");
    cy.get("[data-cy=upload-video]").should("be.hidden");
    cy.get("[data-cy=upload-video]").should("be.disabled");
    cy.get("[data-cy=upload-video]").should("have.text", "Upload Video");
    // edit slider
    cy.get("[data-cy=slider]").should("be.hidden");
    cy.get("[data-cy=upload-video]").should("be.hidden");
    cy.get("[data-cy=upload-video]").should("be.disabled");
    cy.get("[data-cy=upload-video]").should("have.text", "Upload Video");
  });

  it("the upload card corresponding to current question should be highlighted", () => {
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
                  ...taskListBuild("IN_PROGRESS"),
                  ...uploadTaskMediaBuild(),
                },
                {
                  question: {
                    _id: videoMentor.answers[1].question._id,
                    question: videoMentor.answers[1].question.question,
                  },
                  ...taskListBuild("IN_PROGRESS"),
                  ...uploadTaskMediaBuild(),
                },
                {
                  question: {
                    _id: videoMentor.answers[2].question._id,
                    question: videoMentor.answers[2].question.question,
                  },
                  ...taskListBuild("IN_PROGRESS"),
                  ...uploadTaskMediaBuild(),
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
                  ...taskListBuild("IN_PROGRESS"),
                  ...uploadTaskMediaBuild(),
                },
                {
                  question: {
                    _id: videoMentor.answers[1].question._id,
                    question: videoMentor.answers[1].question.question,
                  },
                  ...taskListBuild("IN_PROGRESS"),
                  ...uploadTaskMediaBuild(),
                },
                {
                  question: {
                    _id: videoMentor.answers[2].question._id,
                    question: videoMentor.answers[2].question.question,
                  },
                  ...taskListBuild("IN_PROGRESS"),
                  ...uploadTaskMediaBuild(),
                },
              ],
            },
          },
        ]),
      ],
    });
    cy.visit("/record");
    cy.get("[data-cy=active-upload-card-0]").should("exist");
    cy.get("[data-cy=active-upload-card-0]").should(
      "have.css",
      "background-color",
      "rgb(255, 251, 204)"
    );
    cy.get("[data-cy=active-upload-card-1]").should("exist");
    cy.get("[data-cy=active-upload-card-1]").should(
      "have.css",
      "background-color",
      "rgba(0, 0, 0, 0)"
    );
    cy.get("[data-cy=next-btn]").trigger("mouseover").click();
    cy.get("[data-cy=active-upload-card-0]").should("exist");
    cy.get("[data-cy=active-upload-card-0]").should(
      "have.css",
      "background-color",
      "rgba(0, 0, 0, 0)"
    );
    cy.get("[data-cy=active-upload-card-1]").should("exist");
    cy.get("[data-cy=active-upload-card-1]").should(
      "have.css",
      "background-color",
      "rgb(255, 251, 204)"
    );
  });

  it("displays multiple cards with multiple uploads", () => {
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
                  ...taskListBuild("IN_PROGRESS"),
                  ...uploadTaskMediaBuild(),
                },
                {
                  question: {
                    _id: videoMentor.answers[1].question._id,
                    question: videoMentor.answers[1].question.question,
                  },
                  ...taskListBuild("IN_PROGRESS"),
                  ...uploadTaskMediaBuild(),
                },
                {
                  question: {
                    _id: videoMentor.answers[2].question._id,
                    question: videoMentor.answers[2].question.question,
                  },
                  ...taskListBuild("IN_PROGRESS"),
                  ...uploadTaskMediaBuild(),
                },
              ],
            },
          },
        ]),
      ],
    });
    cy.visit("/record");
    cy.get("[data-cy=active-upload-card-0]").should("exist");
    cy.get("[data-cy=active-upload-card-1]").should("exist");
  });

  it("uploading widget should not be open if there are no uploads", () => {
    cyMockDefault(cy, {
      mentor: [videoMentor],
      questions: videoQuestions,
    });
    cy.visit("/record");
    cy.get("[data-cy=uploading-widget]").should("not.be.visible");
  });

  it("can update status", () => {
    cyMockDefault(cy, {
      mentor: [chatMentor],
      questions: chatQuestions,
    });
    cy.visit("/record?videoId=A1_1_1");
    cy.get("[data-cy=progress]").contains("Questions 1 / 1");
    cy.get("[data-cy=question-text]").contains(
      "Who are you and what do you do?"
    );
    cy.get("[data-cy=question-edit]").should("not.exist");
    cy.get(".editor-class").within(($input) => {
      cy.get("[data-text]").should(
        "have.text",
        "My name is Clint Anderson and I'm a Nuclear Electrician's Mate"
      );
      cy.get("[data-text]").should("not.have.attr", "disabled");
    });
    cy.get("[data-cy=status]").contains("Active");
    cy.get("[data-cy=select-status]").trigger("mouseover").click();
    cy.get("[data-cy=skip]").trigger("mouseover").click();
  });

  it("uploading widget should be open if there are active uploads", () => {
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
                  ...taskListBuild("IN_PROGRESS"),
                  ...uploadTaskMediaBuild(),
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
                  ...taskListBuild("IN_PROGRESS"),
                  ...uploadTaskMediaBuild(),
                },
              ],
            },
          },
        ]),
      ],
    });
    cy.visit("/record");
    cy.get("[data-cy=uploading-widget]").should("be.visible");
  });

  it("Tapping an item from active uploads (via graphql query) takes you to that item", () => {
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
                  ...taskListBuild("IN_PROGRESS"),
                  ...uploadTaskMediaBuild(),
                },
                {
                  question: {
                    _id: videoMentor.answers[1].question._id,
                    question: videoMentor.answers[1].question.question,
                  },
                  ...taskListBuild("IN_PROGRESS"),
                  ...uploadTaskMediaBuild(),
                },
                {
                  question: {
                    _id: videoMentor.answers[2].question._id,
                    question: videoMentor.answers[2].question.question,
                  },
                  ...taskListBuild("IN_PROGRESS"),
                  ...uploadTaskMediaBuild(),
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
                  ...taskListBuild("IN_PROGRESS"),
                  ...uploadTaskMediaBuild(),
                },
                {
                  question: {
                    _id: videoMentor.answers[1].question._id,
                    question: videoMentor.answers[1].question.question,
                  },
                  ...taskListBuild("IN_PROGRESS"),
                  ...uploadTaskMediaBuild(),
                },
                {
                  question: {
                    _id: videoMentor.answers[2].question._id,
                    question: videoMentor.answers[2].question.question,
                  },
                  ...taskListBuild("IN_PROGRESS"),
                  ...uploadTaskMediaBuild(),
                },
              ],
            },
          },
        ]),
      ],
    });
    cy.visit("/record");
    cy.get("[data-cy=active-upload-card-0]").should("exist");
    cy.get("[data-cy=active-upload-card-1]").should("exist");
    cy.get("[data-cy=next-btn]").trigger("mouseover").click();
    cy.get("[data-cy=active-upload-card-0]").within(($i) => {
      cy.get("[data-cy=card-answer-title]").trigger("mouseover").click();
    });
    cy.get("[data-cy=question-text]").contains(
      "Who are you and what do you do?"
    );
    cy.get("[data-cy=question-edit]").should("not.exist");
  });

  it("Uploads panel can be closed via header button and list x button, and panel can be opened via header button", () => {
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
                  ...taskListBuild("IN_PROGRESS"),
                  ...uploadTaskMediaBuild(),
                },
                {
                  question: {
                    _id: videoMentor.answers[1].question._id,
                    question: videoMentor.answers[1].question.question,
                  },
                  ...taskListBuild("IN_PROGRESS"),
                  ...uploadTaskMediaBuild(),
                },
                {
                  question: {
                    _id: videoMentor.answers[2].question._id,
                    question: videoMentor.answers[2].question.question,
                  },
                  ...taskListBuild("IN_PROGRESS"),
                  ...uploadTaskMediaBuild(),
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
                  ...taskListBuild("IN_PROGRESS"),
                  ...uploadTaskMediaBuild(),
                },
                {
                  question: {
                    _id: videoMentor.answers[1].question._id,
                    question: videoMentor.answers[1].question.question,
                  },
                  ...taskListBuild("IN_PROGRESS"),
                  ...uploadTaskMediaBuild(),
                },
                {
                  question: {
                    _id: videoMentor.answers[2].question._id,
                    question: videoMentor.answers[2].question.question,
                  },
                  ...taskListBuild("IN_PROGRESS"),
                  ...uploadTaskMediaBuild(),
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
                  ...taskListBuild("IN_PROGRESS"),
                  ...uploadTaskMediaBuild(),
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
                  ...taskListBuild("IN_PROGRESS"),
                  ...uploadTaskMediaBuild(),
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
                  ...taskListBuild("IN_PROGRESS"),
                  ...uploadTaskMediaBuild(),
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
                  ...taskListBuild("IN_PROGRESS"),
                  ...uploadTaskMediaBuild(),
                },
              ],
            },
          },
        ]),
      ],
    });
    cy.visit("/record");
    cy.get("[data-cy=active-upload-card-0]").should("exist");
    cy.get("[data-cy=active-upload-card-0]").within(($within) => {
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

  it("Header shows a count of N of M uploads", () => {
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
                  ...taskListBuild("IN_PROGRESS"),
                  ...uploadTaskMediaBuild(),
                },
                {
                  question: {
                    _id: videoMentor.answers[1].question._id,
                    question: videoMentor.answers[1].question.question,
                  },

                  ...taskListBuild("DONE"),
                  ...uploadTaskMediaBuild(),
                },
                {
                  question: {
                    _id: videoMentor.answers[2].question._id,
                    question: videoMentor.answers[2].question.question,
                  },
                  ...taskListBuild("DONE"),
                  ...uploadTaskMediaBuild(),
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
      questions: videoQuestions,
    });
    cy.visit("/record");
    cy.get("[data-cy=header-uploads-button]").should("have.text", "");
    cy.get("[data-cy=header-uploads-button]").should(
      "have.css",
      "opacity",
      "0.5"
    );
  });

  it.skip("displays status info for each job: Uploading, Completed, Failed", () => {
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

                  ...taskListBuild("IN_PROGRESS"),
                  transcript: "i am kayla",
                  ...uploadTaskMediaBuild(),
                },
                {
                  question: {
                    _id: videoMentor.answers[1].question._id,
                    question: videoMentor.answers[1].question.question,
                  },

                  ...taskListBuild("IN_PROGRESS"),
                  transcript: "i am kayla",
                  ...uploadTaskMediaBuild(),
                },
                {
                  question: {
                    _id: videoMentor.answers[2].question._id,
                    question: videoMentor.answers[2].question.question,
                  },

                  ...taskListBuild("IN_PROGRESS"),
                  transcript: "i am kayla",
                  ...uploadTaskMediaBuild(),
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
                  ...taskListBuild("IN_PROGRESS"),
                  transcript: "i am kayla",
                  ...uploadTaskMediaBuild(),
                },
                {
                  question: {
                    _id: videoMentor.answers[1].question._id,
                    question: videoMentor.answers[1].question.question,
                  },
                  ...taskListBuild("FAILED"),
                  transcript: "i am kayla",
                  ...uploadTaskMediaBuild(),
                },
                {
                  question: {
                    _id: videoMentor.answers[2].question._id,
                    question: videoMentor.answers[2].question.question,
                  },

                  ...taskListBuild("DONE"),
                  transcript: "i am kayla",
                  ...uploadTaskMediaBuild(),
                },
              ],
            },
          },
        ]),
      ],
    });
    cy.visit("/record");
    cy.get("[data-cy=active-upload-card-2]").within(($within) => {
      //ListItems secondary text is under <p>
      cy.get("[data-cy=card-answer-title]")
        .get("span")
        .should("have.text", videoMentor.answers[2].question.question);
      cy.get("[data-cy=card-answer-title]").contains("Tap to preview");
    });
    cy.get("[data-cy=active-upload-card-1]").within(($within) => {
      //ListItems secondary text is under <p>
      cy.get("[data-cy=card-answer-title]")
        .get("span")
        .should("have.text", videoMentor.answers[1].question.question);
      cy.get("[data-cy=card-answer-title]").contains("Failed to process file:");
    });
    cy.get("[data-cy=active-upload-card-0]").within(($within) => {
      //ListItems primary text is under <span> and its secondary text is under <p>
      cy.get("[data-cy=card-answer-title]")
        .get("span")
        .should(
          "contain",
          videoMentor.answers[0].question.question.substr(0, 22)
        );
      cy.get("[data-cy=card-answer-title]")
        .get("p")
        .should("contain.text", "Processing");
    });
  });

  it("hides video if mentor type is CHAT", () => {
    cyMockDefault(cy, {
      mentor: [chatMentor],
      questions: chatQuestions,
    });
    cy.visit("/record");
    cy.get("[data-cy=video-recorder]").should("not.exist");
    cy.get("[data-cy=video-player]").should("not.exist");
  });

  it("shows video recorder if mentor type is VIDEO and has no video", () => {
    cyMockDefault(cy, {
      mentor: [videoMentor],
      questions: videoQuestions,
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

  it("Does not show video player if mentor type is VIDEO and has no video", () => {
    cyMockDefault(cy, {
      mentor: [videoMentor],
      questions: videoQuestions,
    });
    cy.visit("/record?videoId=A2_1_1");
    cy.get("[data-cy=video-recorder]").should("exist");

    cy.get("[data-cy=video-recorder]").should("be.visible");
    cy.get("[data-cy=upload-file]").should("be.visible");

    cy.get("[data-cy=video-player]").should("be.hidden");
    cy.get("[data-cy=rerecord-video]").should("be.hidden");
    cy.get("[data-cy=upload-video]").should("be.hidden");

    cy.get("[data-cy=upload-video]").should("be.disabled");
    cy.get("[data-cy=slider]").should("be.hidden");

    cy.get("[data-cy=rerecord-video]").should("be.hidden");
    cy.get("[data-cy=video-recorder]").should("be.visible");
    cy.get("[data-cy=upload-file]").should("be.visible");
    cy.get("[data-cy=video-player]").should("be.hidden");
    cy.get("[data-cy=slider]").should("be.hidden");
    cy.get("[data-cy=rerecord-video]").should("be.hidden");
    cy.get("[data-cy=upload-video]").should("be.hidden");
  });

  it("Download video button only visible when video is present", () => {
    cyMockDefault(cy, {
      mentor: [
        videoMentor,
        updateMentorAnswer(videoMentor, "A1_1_1", {
          transcript: "My name is Clint Anderson",
        }),
      ],
      questions: videoQuestions,
      gqlQueries: [mockGQL("FetchUploadTasks", [])],
    });
    cy.visit("/record");
    cyAttachUpload(cy);
    cy.get("[data-cy=download-video]").should("exist");
  });

  it("download video button not visible when no video is present", () => {
    cyMockDefault(cy, {
      mentor: [
        videoMentor,
        updateMentorAnswer(videoMentor, "A1_1_1", {
          transcript: "My name is Clint Anderson",
        }),
      ],
      questions: videoQuestions,
      gqlQueries: [mockGQL("FetchUploadTasks", [])],
    });
    cy.visit("/record");
    cy.get("[data-cy=download-video]").should("not.exist");
  });

  it("Guide silhouette should be visible while trimming a video", () => {
    cyMockDefault(cy, {
      mentor: [
        videoMentor,
        updateMentorAnswer(videoMentor, "A1_1_1", {
          transcript: "My name is Clint Anderson",
        }),
      ],
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
                  transcript: "My name is Clint Anderson",
                  ...uploadTaskMediaBuild(),
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

  it("uploads should be visibly split if they are not part of current recording set", () => {
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

                  ...taskListBuild("IN_PROGRESS"),
                  transcript: "My name is Clint Anderson",
                  ...uploadTaskMediaBuild(),
                },
                {
                  question: {
                    _id: videoMentor.answers[2].question._id,
                    question: videoMentor.answers[2].question.question,
                  },

                  ...taskListBuild("IN_PROGRESS"),
                  transcript: "My name is Clint Anderson",
                  ...uploadTaskMediaBuild(),
                },
              ],
            },
          },
        ]),
      ],
    });
    cy.visit(`/record?subject=subject_1`);
    cy.get("[data-cy=active-upload-card-0]").should("exist");
    cy.get("[data-cy=uploads-split]").should("exist");
    cy.get("[data-cy=grayed-upload-card-0]").should("exist");
  });

  it("navigation warning when selecting upload outside of current recording set", () => {
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

                  ...taskListBuild("IN_PROGRESS"),
                  transcript: "My name is Clint Anderson",
                  ...uploadTaskMediaBuild(),
                },
                {
                  question: {
                    _id: videoMentor.answers[2].question._id,
                    question: videoMentor.answers[2].question.question,
                  },

                  ...taskListBuild("IN_PROGRESS"),
                  transcript: "My name is Clint Anderson",
                  ...uploadTaskMediaBuild(),
                },
              ],
            },
          },
        ]),
      ],
    });
    cy.visit(`/record?subject=subject_1`);
    cy.get("[data-cy=active-upload-card-0]").should("exist");
    cy.get("[data-cy=uploads-split]").should("exist");
    cy.get("[data-cy=grayed-upload-card-0]").should("exist");

    cy.get("[data-cy=grayed-upload-card-0]").invoke("mouseover").click();
    cy.get("[data-cy=navigation-warning]").should("exist");
  });

  it("no navigation warning when selecting upload from same recording set", () => {
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

                  ...taskListBuild("IN_PROGRESS"),
                  transcript: "My name is Clint Anderson",
                  ...uploadTaskMediaBuild(),
                },
                {
                  question: {
                    _id: videoMentor.answers[1].question._id,
                    question: videoMentor.answers[1].question.question,
                  },

                  ...taskListBuild("IN_PROGRESS"),
                  transcript: "My name is Clint Anderson",
                  ...uploadTaskMediaBuild(),
                },
                {
                  question: {
                    _id: videoMentor.answers[2].question._id,
                    question: videoMentor.answers[2].question.question,
                  },

                  ...taskListBuild("IN_PROGRESS"),
                  transcript: "My name is Clint Anderson",
                  ...uploadTaskMediaBuild(),
                },
              ],
            },
          },
        ]),
      ],
    });
    cy.visit(`/record?subject=subject_1`);
    cy.get("[data-cy=active-upload-card-0]").should("exist");
    cy.get("[data-cy=active-upload-card-1]").invoke("mouseover").click();
    cy.get("[data-cy=navigation-warning]").should("not.exist");
  });

  it("properly navigates to correct answer index when switching subjects", () => {
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

                  ...taskListBuild("IN_PROGRESS"),
                  transcript: "My name is Clint Anderson",
                  ...uploadTaskMediaBuild(),
                },
                {
                  question: {
                    _id: videoMentor.answers[2].question._id,
                    question: videoMentor.answers[2].question.question,
                  },

                  ...taskListBuild("IN_PROGRESS"),
                  transcript: "My name is Clint Anderson",
                  ...uploadTaskMediaBuild(),
                },
                {
                  question: {
                    _id: videoMentor.answers[3].question._id,
                    question: videoMentor.answers[3].question.question,
                  },

                  ...taskListBuild("IN_PROGRESS"),
                  transcript: "My name is Clint Anderson",
                  ...uploadTaskMediaBuild(),
                },
              ],
            },
          },
        ]),
      ],
    });
    cy.visit(`/record?subject=subject_1`);
    cy.get("[data-cy=active-upload-card-0]").should("exist");
    cy.get("[data-cy=grayed-upload-card-1]").invoke("mouseover").click();
    cy.get("[data-cy=navigate-to-question-button]").invoke("mouseover").click();
    cy.get("[data-cy=progress]").contains("Questions 2 / 2");
  });

  it("can update transcript", () => {
    cyMockDefault(cy, {
      mentor: [
        chatMentor,
        updateMentorAnswer(chatMentor as unknown as Mentor, "A2_1_1", {
          transcript: "37",
        }),
      ],
      questions: chatQuestions,
    });
    cy.visit("/record?videoId=A2_1_1&videoId=A3_1_1");
    cy.get("[data-cy=progress]").contains("Questions 1 / 2");
    cy.get("[data-cy=question-text]").contains("How old are you now?");
    cy.get("[data-cy=question-edit]").should("exist");
    cy.get(".editor-class").within(($input) => {
      cy.get("[data-text]").should("have.text", "");
      cy.get("[data-text]").should("not.have.attr", "disabled");
    });
    cy.get(".rdw-option-wrapper.rdw-option-disabled").eq(0).should("exist");

    cy.get(".editor-class").type("37");
    cy.get(".editor-class").within(($input) => {
      cy.get("[data-text]").should("have.text", "37");
    });
    cy.get(".rdw-option-wrapper").eq(4).should("not.be.disabled");
    cy.get(".rdw-option-wrapper").eq(4).trigger("mouseover").click();
    cy.get(".editor-class").within(($input) => {
      cy.get("[data-text]").should("have.text", "");
    });
    cy.get(".rdw-option-wrapper.rdw-option-disabled").eq(0).should("exist");
    cy.get(".editor-class").type("37");
    cy.get("[data-cy=next-btn]").trigger("mouseover").click();
    cy.get("[data-cy=loading-dialog]");
    cy.get("[data-cy=back-btn]").trigger("mouseover").click();
    cy.get(".editor-class").within(($input) => {
      cy.get("[data-text]").should("have.text", "37");
    });
    cy.get(".rdw-option-wrapper.rdw-option-disabled").eq(0).should("exist");
  });

  it("cannot update question for a question not belonging to mentor", () => {
    cyMockDefault(cy, {
      mentor: chatMentor,
      questions: chatQuestions,
    });
    cy.visit("/record?videoId=A1_1_1");
    cy.get("[data-cy=question-edit]").should("not.exist");
  });

  it("Verify that transcript markdown loads as rich text", () => {
    cyMockDefault(cy, {
      mentor: clintMarkdown,
      questions: chatQuestions,
    });
    cy.visit("/record?videoId=A1_1_1");
    cy.get("[data-text]").should("be.visible");
    cy.get("[data-text]").should(
      "not.have.text",
      "My _name_ is **Clint Anderson** and I'm a Nuclear Electrician's Mate"
    );

    cy.visit("/record?videoId=A2_1_1");
    cy.get("[data-text]").should("be.visible");
    cy.get("[data-text]").should(
      "not.have.text",
      "- I'm [37](https://en.wikipedia.org/wiki/37_%28number%29) years old"
    );

    cy.visit("/record?videoId=A5_1_1");
    cy.get("[data-text]").should("be.visible");
    cy.get("[data-text]").should(
      "not.have.text",
      "1. I couldn't understand the [question](https://www.merriam-webster.com/dictionary/question). Try asking **me** something else."
    );
  });

  it("Make changes to transcript using React WYSIWYG Editor features", () => {
    cyMockDefault(cy, {
      mentor: clintMarkdown,
      questions: chatQuestions,
      gqlQueries: [
        mockGQL("markdownTranscript", { me: { markdownTranscript: "" } }),
      ],
    });
    cy.visit("/record?videoId=A1_1_1");
    cy.get("[data-cy=question-text]").should("be.visible");
    cy.getSettled(".editor-class").within(() => {
      cy.get("[data-text]").eq(0).type("{selectall}");
    });

    cy.get(".rdw-option-wrapper").eq(0).click();
    cy.get("[data-text]").should(
      "not.have.text",
      "**My name is Clint Anderson and I'm a Nuclear Electrician's Mate**"
    );
    cy.get(".rdw-option-wrapper").eq(0).click();

    cy.get(".rdw-option-wrapper").eq(1).click();
    cy.get("[data-text]").should(
      "not.have.text",
      "_My name is Clint Anderson and I'm a Nuclear Electrician's Mate_"
    );
    cy.get(".rdw-option-wrapper").eq(1).click();

    cy.get(".rdw-option-wrapper").eq(2).click();
    cy.get("[data-text]").should(
      "not.have.text",
      "- My name is Clint Anderson and I'm a Nuclear Electrician's Mate"
    );
    cy.get(".rdw-option-wrapper").eq(2).click();

    cy.get(".rdw-option-wrapper").eq(3).click();
    cy.get("[data-text]").should(
      "not.have.text",
      "1. My name is Clint Anderson and I'm a Nuclear Electrician's Mate"
    );
    cy.get(".rdw-option-wrapper").eq(3).click();

    cy.get(".editor-class").within(() => {
      cy.get("[data-text]").type("{selectall}");
    });
    cy.get(".rdw-link-wrapper").eq(0).should("be.visible");
    cy.get(".rdw-link-wrapper").eq(0).click();
    cy.get(".rdw-dropdownoption-default.rdw-link-dropdownoption").should(
      "be.visible"
    );
    cy.get(".rdw-dropdownoption-default.rdw-link-dropdownoption").eq(0).click();
    cy.get(".rdw-link-modal-input").eq(1).should("be.visible");
    cy.get(".rdw-link-modal-input").eq(1).type("https://google.com");
    cy.get("[id=openLinkInNewWindow]").should("be.visible");
    cy.get("[id=openLinkInNewWindow]").click();
    cy.get(".rdw-link-modal-btn").eq(0).should("be.visible");
    cy.get(".rdw-link-modal-btn").eq(0).click();

    cy.get(".rdw-option-wrapper").eq(4).should("be.visible");
    cy.get(".rdw-option-wrapper").eq(4).click();
    cy.get(".rdw-option-wrapper").eq(5).should("be.visible");
    cy.get(".rdw-option-wrapper").eq(5).click();

    cy.get(
      ".public-DraftStyleDefault-block.public-DraftStyleDefault-ltr"
    ).should("be.visible");
    cy.get(
      ".public-DraftStyleDefault-block.public-DraftStyleDefault-ltr"
    ).click();
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
      questions: chatQuestions,
      gqlQueries: [
        mockGQL("UpdateQuestion", {
          me: {
            updateQuestion: {
              ...chatQuestions[1],
              question: "How old are you now?test",
            },
          },
        }),
      ],
    });
    cy.visit("/record?videoId=A2_1_1&videoId=A3_1_1");
    cy.get("[data-cy=progress]").contains("Questions 1 / 2");
    cy.get("[data-cy=question-text]").contains("How old are you now?");
    cy.get("[data-cy=question-edit]").should("exist");
    cy.get("[data-cy=question-edit]").click();
    cy.get("[data-cy=question-input]").within(($input) => {
      cy.get("textarea").should("have.text", "How old are you now?");
    });
    cy.get("[data-cy=undo-question-btn]").should("be.disabled");

    cy.get("[data-cy=question-input]").type("test");
    cy.get("[data-cy=question-input]").within(($input) => {
      cy.get("textarea").should("have.text", "How old are you now?test");
    });
    cy.get("[data-cy=undo-question-btn]").should("not.be.disabled");
    cy.get("[data-cy=undo-question-btn]").trigger("mouseover").click();
    cy.get("[data-cy=question-input]").within(($input) => {
      cy.get("textarea").should("have.text", "How old are you now?");
    });
    cy.get("[data-cy=undo-question-btn]").should("be.disabled");
    cy.get("[data-cy=question-input]").type("test");
    cy.get("[data-cy=next-btn]").trigger("mouseover").click();
    cy.get("[data-cy=back-btn]").trigger("mouseover").click();
    cy.get("[data-cy=question-text]").contains("How old are you now?test");
    cy.get("[data-cy=question-edit]").should("exist");
    cy.get("[data-cy=question-edit]").click();
    cy.get("[data-cy=question-input]").within(($input) => {
      cy.get("textarea").should("have.text", "How old are you now?test");
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
      questions: videoQuestions,
      gqlQueries: [
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
                  ...taskListBuild("DONE"),
                  transcript: "My name is Clint Anderson",
                  ...uploadTaskMediaBuild(),
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
      cy.wait(3000);
      cy.get(".editor-class").within(($input) => {
        cy.get("[data-text]").should("have.text", "My name is Clint Anderson");
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

      cy.get("[data-cy=active-upload-card-0]").should("exist");
      cy.get("[data-cy=active-upload-card-0]").within(($within) => {
        cy.get("[data-cy=card-answer-title]")
          .get("p")
          .should("contain.text", "Failed to upload file");
      });
    });
  });

  it("failed uploads display the download button:", () => {
    cyMockDefault(cy, { mentor: [videoMentor] });
    cyMockUpload(cy, { statusCode: 400 });
    cy.visit("/record");
    cyAttachUpload(cy).then(() => {
      cy.get("[data-cy=upload-video]").trigger("mouseover").click();
      cy.get("[data-cy=uploading-widget]").should("be.visible");

      cy.get("[data-cy=active-upload-card-0]").should("exist");
      cy.get("[data-cy=active-upload-card-0]").within(($within) => {
        cy.get("[data-cy=download-video-from-list]").should("be.visible");
        cy.get("[data-cy=card-answer-title]")
          .get("p")
          .should("contain.text", "Failed to upload file");
      });
    });
  });

  it("non-advanced mentors cannot see vtt file info block", () => {
    cyMockDefault(cy, { mentor: [{ ...videoMentor, isAdvanced: false }] });
    cy.visit("/record");
    cy.get("[data-cy=transcript]").should("exist").should("be.visible");
    cy.get("[data-cy=upload-vtt-file]").should("not.exist");
  });

  it("advanced mentors can see vtt file info block", () => {
    cyMockDefault(cy, { mentor: [{ ...videoMentor, isAdvanced: true }] });
    cy.visit("/record");
    cy.get("[data-cy=transcript]").should("exist").should("be.visible");
    cy.get("[data-cy=upload-vtt-file]").should("exist").should("be.visible");
  });

  it("user is warned to download video when an upload fails", () => {
    cyMockDefault(cy, { mentor: [videoMentor] });
    cyMockUpload(cy, { statusCode: 400 });
    cy.visit("/record");
    cyAttachUpload(cy).then(() => {
      cy.get("[data-cy=upload-video]").trigger("mouseover").click();
      cy.get("[data-cy=uploading-widget]").should("be.visible");

      cy.get("[data-cy=notification-dialog]")
        .should("exist")
        .should(
          "contain.text",
          "One or more of your uploads have failed to upload"
        );
    });
  });

  it("failed gql process displays error message in upload widget", () => {
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
                  ...taskListBuild("IN_PROGRESS"),
                  ...uploadTaskMediaBuild(),
                },
                {
                  question: {
                    _id: videoMentor.answers[1].question._id,
                    question: videoMentor.answers[1].question.question,
                  },

                  ...taskListBuild("IN_PROGRESS"),
                  transcript: "",
                  ...uploadTaskMediaBuild(),
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
                  ...taskListBuild("FAILED"),
                  ...uploadTaskMediaBuild(),
                },
                {
                  question: {
                    _id: videoMentor.answers[1].question._id,
                    question: videoMentor.answers[1].question.question,
                  },

                  ...taskListBuild("FAILED"),
                  transcript: "",
                  ...uploadTaskMediaBuild(),
                },
              ],
            },
          },
        ]),
      ],
    });
    cy.visit("/record");
    cy.wait(3000);
    cy.get("[data-cy=active-upload-card-0]").should("exist");
    cy.get("[data-cy=active-upload-card-0]").within(($within) => {
      cy.get("[data-cy=card-answer-title]")
        .get("p")
        .should("contain.text", "Failed to process file");
    });
    cy.get("[data-cy=active-upload-card-1]").should("exist");
    cy.get("[data-cy=active-upload-card-1]").within(($within) => {
      cy.get("[data-cy=card-answer-title]")
        .get("p")
        .should("contain.text", "Failed to process file");
    });
  });

  // TODO: flaky, for unknown reason, media is getting dropped from answer after completion
  it.skip("warns user of empty transcript", () => {
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

                  ...taskListBuild("IN_PROGRESS"),
                  transcript: "",
                  ...uploadTaskMediaBuild(),
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

                  ...taskListBuild("IN_PROGRESS"),
                  transcript: "",
                  ...uploadTaskMediaBuild(),
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

                  ...taskListBuild("DONE"),
                  transcript: "",
                  ...uploadTaskMediaBuild(),
                },
              ],
            },
          },
        ]),
      ],
    });
    cy.visit("/record");
    cy.wait(3000);
    cy.get("[data-cy=warn-empty-transcript]").should("exist");
    cy.get("[data-cy=active-upload-card-0]").within(($within) => {
      cy.get("p").should("have.text", "Needs Attention");
    });
  });

  it("download button not visible for done items", () => {
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
                  transcript: "",
                  ...uploadTaskMediaBuild(),
                },
              ],
            },
          },
        ]),
      ],
    });
    cy.visit("/record");
    cy.get("[data-cy=active-upload-card-0]").within(($within) => {
      cy.get("[data-cy=download-video-from-list]").should("not.exist");
    });
  });

  it("does not warn user of empty transcript if idle video", () => {
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
                    _id: videoMentor.answers[3].question._id,
                    question: videoMentor.answers[3].question.question,
                  },
                  ...taskListBuild("IN_PROGRESS"),
                  transcript: "",
                  ...uploadTaskMediaBuild(),
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
                  ...taskListBuild("IN_PROGRESS"),
                  transcript: "",
                  ...uploadTaskMediaBuild(),
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
      gqlQueries: [mockGQL("FetchUploadTasks", [])],
    });
    cy.visit("/record?videoId=A1_1_1&videoId=A2_1_1");
    cy.get("[data-cy=question-text]").contains(
      "Who are you and what do you do?"
    );
    cy.get("[data-cy=question-edit]").should("not.exist");
    cy.get("[data-cy=next-btn]").invoke("mouseover").click();
    cy.get("[data-cy=question-text]").contains("How old are you now?");
    cy.get("[data-cy=question-edit]").should("not.exist");
  });

  // headless cypress has no webcam, test won't pass till fix
  it.skip("while recording, stop recording indicator is visible", () => {
    cyMockDefault(cy, {
      mentor: [videoMentor],
      gqlQueries: [mockGQL("FetchUploadTasks", [])],
    });
    cy.visit("/record?videoId=A1_1_1&videoId=A2_1_1");
    cy.get("[title=Device]").first().invoke("mouseover").click("center");
    cy.get("[data-cy=controls]").invoke("mouseover").click();
    cy.get("[data-cy=transcript-overlay]", { timeout: 6000 }).should("exist");
  });

  // headless cypress has no webcam, test won't pass till fix
  it.skip("press spacebar to stop recording", () => {
    cyMockDefault(cy, {
      mentor: [videoMentor],
      gqlQueries: [mockGQL("FetchUploadTasks", [])],
    });
    cy.visit("/record?videoId=A1_1_1&videoId=A2_1_1");
    cy.get("[title=Device]").first().invoke("mouseover").click("center");
    cy.get("[data-cy=controls]").invoke("mouseover").click();
    cy.get("[data-cy=transcript-overlay]", { timeout: 6000 }).should("exist");
    cy.get("body").trigger("keydown", { keyCode: 32 });
    cy.get("[data-cy=countdown-message]").should(
      "contain.text",
      "Recording ends in"
    );
  });

  // headless cypress has no webcam, test won't pass till fix
  it.skip("press transcript overlay to stop recording", () => {
    cyMockDefault(cy, {
      mentor: [videoMentor],
      gqlQueries: [mockGQL("FetchUploadTasks", [])],
    });
    cy.visit("/record?videoId=A1_1_1&videoId=A2_1_1");
    cy.get("[title=Device]").first().invoke("mouseover").click("center");
    cy.get("[data-cy=controls]").invoke("mouseover").click();
    cy.get("[data-cy=transcript-overlay]", { timeout: 6000 }).should("exist");
    cy.get("[data-cy=transcript-overlay]").invoke("mouseover").click();
    cy.get("[data-cy=countdown-message]").should(
      "contain.text",
      "Recording ends in"
    );
  });

  it("can edit video mentor transcripts", () => {
    cyMockDefault(cy, {
      mentor: [videoMentor],
      gqlQueries: [mockGQL("FetchUploadTasks", [])],
    });
    cy.visit("/record?videoId=A1_1_1&videoId=A2_1_1");
    cy.get(".editor-class").type("37");
    cy.get(".editor-class").within(($input) => {
      cy.get("[data-text]").should("have.text", "37");
    });
  });

  it("Warns user to trim their own edited transcripts when trimming video", () => {
    cyMockDefault(cy, {
      mentor: [videoMentor],
      gqlQueries: [mockGQL("FetchUploadTasks", [])],
    });
    cy.visit("/record?videoId=A1_1_1&videoId=A2_1_1");
    cy.get(".editor-class").type("37");
    cy.get(".editor-class").within(($input) => {
      cy.get("[data-text]").should("have.text", "37");
    });
    cyAttachUpload(cy).then(() => {
      cy.get("[data-cy=outline]").should("not.be.visible");
      cy.get("[data-cy=slider]")
        .invoke("mouseover")
        .trigger("mousedown", { button: 0 });
      cy.get("[data-cy=upload-video]").click();
      cy.get("[data-cy=notification-dialog-title]").contains(
        "Don't forget to trim your transcript"
      );
    });
  });

  it("If edited transcript from db but not locally and new upload, then replace transcript", () => {
    cyMockDefault(cy, {
      mentor: {
        ...videoMentor,
        answers: [
          ...videoMentor.answers.map((a) => {
            if (a._id === "A2_1_1") {
              return {
                ...a,
                hasEditedTranscript: true,
                transcript: "Transcript from GQL",
              };
            }
            return a;
          }),
        ],
      },
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
                  ...taskListBuild("IN_PROGRESS"),
                  transcript: "",
                  ...uploadTaskMediaBuild(),
                },
              ],
            },
          },
          {
            me: {
              uploadTasks: [
                {
                  question: {
                    _id: videoMentor.answers[1].question._id,
                    question: videoMentor.answers[1].question.question,
                  },
                  ...taskListBuild("DONE"),
                  transcript: "NEW TRANSCRIPT",
                  ...uploadTaskMediaBuild(),
                },
              ],
            },
          },
        ]),
      ],
    });
    cy.visit("/record?videoId=A2_1_1");
    cy.get("[data-cy=card-answer-title]").contains("Processing"); //upload in progress
    cy.get(".editor-class").within(($input) => {
      cy.get("[data-text]").should("have.text", "Transcript from GQL");
    });
    cy.get("[data-cy=card-answer-title]").contains("Tap to preview"); // upload completes
    cy.get(".editor-class").within(($input) => {
      cy.get("[data-text]").should("have.text", "NEW TRANSCRIPT");
    });
  });

  it("transcript edited while upload in progress does not get replaced when upload completes", () => {
    cyMockDefault(cy, {
      mentor: [videoMentor],
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
                  ...taskListBuild("IN_PROGRESS"),
                  transcript: "",
                  ...uploadTaskMediaBuild(),
                },
              ],
            },
          },
          {
            me: {
              uploadTasks: [
                {
                  question: {
                    _id: videoMentor.answers[1].question._id,
                    question: videoMentor.answers[1].question.question,
                  },
                  ...taskListBuild("DONE"),
                  transcript: "NEW TRANSCRIPT",
                  ...uploadTaskMediaBuild(),
                },
              ],
            },
          },
        ]),
      ],
    });
    cy.visit("/record?videoId=A2_1_1");
    cy.get("[data-cy=card-answer-title]").contains("Processing"); //upload in progress
    cy.get(".editor-class").type(". Edited Transcript"); // edit transcript
    cy.get("[data-cy=card-answer-title]").contains("Tap to preview"); // upload completes
    cy.get(".editor-class").within(($input) => {
      cy.get("[data-text]").should(
        "have.text",
        "I'm 37 years old. Edited Transcript"
      );
    });
  });

  it("emtpy transcript upload results replace current transcript", () => {
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
                    _id: videoMentor.answers[1].question._id,
                    question: videoMentor.answers[1].question.question,
                  },
                  ...taskListBuild("IN_PROGRESS"),
                  transcript: "",
                  ...uploadTaskMediaBuild(),
                },
              ],
            },
          },
          {
            me: {
              uploadTasks: [
                {
                  question: {
                    _id: videoMentor.answers[1].question._id,
                    question: videoMentor.answers[1].question.question,
                  },
                  ...taskListBuild("DONE"),
                  transcript: "",
                  ...uploadTaskMediaBuild(),
                },
              ],
            },
          },
        ]),
      ],
    });
    cy.visit("/record");
    cy.get("[data-cy=next-btn]").invoke("mouseover").click();
    cy.get(".editor-class").should("have.value", "");
  });

  it("uploads with no transcript does not replace current transcript", () => {
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
                    _id: videoMentor.answers[1].question._id,
                    question: videoMentor.answers[1].question.question,
                  },
                  ...taskListBuild("IN_PROGRESS"),
                  ...uploadTaskMediaBuild(),
                },
              ],
            },
          },
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
                },
              ],
            },
          },
        ]),
      ],
    });
    cy.visit("/record");
    cy.get("[data-cy=next-btn]").invoke("mouseover").click();
    //wait for upload to complete
    cy.get("[data-cy=video-player]").should("be.visible");
    cy.get("[data-cy=transcript]").contains("I'm 37 years old");
  });

  it("Displays virtual background if virtual mentor", () => {
    cyMockDefault(cy, {
      mentor: {
        ...videoMentor,
        hasVirtualBackground: true,
        virtualBackgroundUrl: "https://www.fakeimageurl.com/",
      },
    });
    cy.visit("/record");
    cy.get("[data-cy=video-recorder-background]").should(
      "have.css",
      "background-image",
      'url("https://www.fakeimageurl.com/")'
    );
  });

  it("Does not display virtual background if not virtual mentor", () => {
    cyMockDefault(cy, {
      mentor: { ...videoMentor, hasVirtualBackground: false },
    });
    cy.visit("/record");
    cy.get("[data-cy=video-recorder-background]").should(
      "have.css",
      "background-image",
      "none"
    );
  });

  it("Uses default vbg if mentor has none provided", () => {
    cyMockDefault(cy, {
      mentor: { ...videoMentor, hasVirtualBackground: true },
    });
    cy.visit("/record");
    cy.get("[data-cy=video-recorder-background]").should(
      "have.css",
      "background-image",
      'url("https://default.image.url.com/")'
    );
  });
});
