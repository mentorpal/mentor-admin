/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { cySetup, cyMockDefault, mockGQL } from "../support/functions";
import { QuestionType } from "../support/types";

const mentor = {
  _id: "clint",
};

const subject = {
  _id: "background",
  name: "Background",
  description:
    "These questions will ask general questions about your background that might be relevant to how people understand your career.",
  isRequired: false,
  categories: [
    {
      id: "c1",
      name: "Category1",
      description: "1",
    },
  ],
  topics: [
    {
      id: "t1",
      name: "Topic1",
      description: "1",
    },
  ],
  questions: [
    {
      question: {
        _id: "q1",
        question: "question1",
        type: QuestionType.QUESTION,
        name: "",
        paraphrases: ["paraphrase1"],
        mentor: null,
      },
      topics: [{ id: "t1" }],
      category: { id: "c1" },
    },
    {
      question: {
        _id: "q2",
        question: "clintquestion",
        type: QuestionType.UTTERANCE,
        name: "",
        paraphrases: [],
        mentor: "clint",
      },
      topics: [],
      category: null,
    },
    {
      question: {
        _id: "q3",
        question: "notclintquestion",
        type: QuestionType.QUESTION,
        name: "",
        paraphrases: [],
        mentor: "notclint",
      },
      topics: [],
      category: null,
    },
  ],
};

describe("Edit subject", () => {
  it("can open and collapse different sections", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor,
    });
    cy.visit("/author/subject");
    // info opened by default
    cy.get("[data-cy=subject-name]").should("exist");
    cy.get("[data-cy=subject-description]").should("exist");
    cy.get("[data-cy=topics-list]").should("not.exist");
    cy.get("[data-cy=categories]").should("not.exist");
    cy.get("[data-cy=questions]").should("not.exist");
    // close info
    cy.get("[data-cy=toggle-info]").trigger("mouseover").click();
    cy.get("[data-cy=subject-name]").should("not.exist");
    cy.get("[data-cy=subject-description]").should("not.exist");
    cy.get("[data-cy=topics-list]").should("not.exist");
    cy.get("[data-cy=categories]").should("not.exist");
    cy.get("[data-cy=questions]").should("not.exist");
    // open topics
    cy.get("[data-cy=toggle-topics]").trigger("mouseover").click();
    cy.get("[data-cy=subject-name]").should("not.exist");
    cy.get("[data-cy=subject-description]").should("not.exist");
    cy.get("[data-cy=topics-list]").should("exist");
    cy.get("[data-cy=categories]").should("not.exist");
    cy.get("[data-cy=questions]").should("not.exist");
    // open questions (closes topics)
    cy.get("[data-cy=toggle-questions]").trigger("mouseover").click();
    cy.get("[data-cy=subject-name]").should("not.exist");
    cy.get("[data-cy=subject-description]").should("not.exist");
    cy.get("[data-cy=topics-list]").should("not.exist");
    cy.get("[data-cy=categories]").should("exist");
    cy.get("[data-cy=questions]").should("exist");
  });

  it("shows new empty subject if no subject id in url parameters", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor,
    });
    cy.visit("/author/subject");
    cy.get("[data-cy=subject-name]").within(($input) => {
      cy.get("textarea").should("have.value", "");
    });
    cy.get("[data-cy=subject-description]").within(($input) => {
      cy.get("textarea").should("have.value", "");
    });
    cy.get("[data-cy=toggle-topics]").trigger("mouseover").click();
    cy.get("[data-cy=topics-list]").children().should("have.length", 0);
    cy.get("[data-cy=toggle-questions]").trigger("mouseover").click();
    cy.get("[data-cy=categories]").children().should("have.length", 0);
    cy.get("[data-cy=questions]").children().should("have.length", 0);
  });

  it("loads subject with default and mentor-specific questions", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor,
      subject,
    });
    cy.visit("/author/subject?id=background");
    cy.get("[data-cy=subject-name]").within(($input) => {
      cy.get("textarea").should("have.value", "Background");
    });
    cy.get("[data-cy=subject-description]").within(($input) => {
      cy.get("textarea").should(
        "have.value",
        "These questions will ask general questions about your background that might be relevant to how people understand your career."
      );
    });
    // view topics
    cy.get("[data-cy=toggle-topics]").trigger("mouseover").click();
    cy.get("[data-cy=topics-list]").within(($topics) => {
      cy.get("[data-cy=topic-0]").within(($topic) => {
        cy.get("[data-cy=topic-name]").should(
          "have.attr",
          "data-test",
          "Topic1"
        );
        cy.get("[data-cy=toggle-topic]").trigger("mouseover").click();
        cy.get("[data-cy=topic-description]").should(
          "have.attr",
          "data-test",
          "1"
        );
      });
    });
    // view categories
    cy.get("[data-cy=toggle-questions]").trigger("mouseover").click();
    cy.get("[data-cy=categories]").within(($categories) => {
      cy.get("[data-cy=category-0]").within(($cateogry) => {
        cy.get("[data-cy=category-name]").within(($input) => {
          cy.get("input").should("have.value", "Category1");
        });
        cy.get("[data-cy=category-description]").within(($input) => {
          cy.get("input").should("have.value", "1");
        });
        // view questions in category
        cy.get("[data-cy=category-questions]").within(($categoryQuestions) => {
          cy.get("[data-cy=category-question-0]").within(
            ($categoryQuestion) => {
              cy.get("[data-cy=question]").within(($input) => {
                cy.get("textarea").should("have.value", "question1");
              });
              cy.get("[data-cy=question]").trigger("mouseover").click();
            }
          );
        });
        cy.get("[data-cy=toggle-category]").trigger("mouseover").click();
        cy.get("[data-cy=category-questions]").should("not.exist");
      });
    });
    // view question details
    cy.get("[data-cy=edit-question]").within(($edit) => {
      cy.get("[data-cy=select-name]").should("not.exist");
      cy.get("[data-cy=question-topics-list]").within(($topics) => {
        cy.get("[data-cy=topic-0]").within(($topic) => {
          cy.get("[data-cy=topic-name]").should(
            "have.attr",
            "data-test",
            "Topic1"
          );
        });
      });
      cy.get("[data-cy=paraphrases]").within(($paraphrases) => {
        cy.get("[data-cy=paraphrase-0]").within(($paraphrase) => {
          cy.get("input").should("have.value", "paraphrase1");
        });
      });
    });
    // view uncategorized questions
    cy.get("[data-cy=questions]").within(($questions) => {
      cy.get("[data-cy=question-0]").within(($question) => {
        cy.get("[data-cy=question]").within(($input) => {
          cy.get("textarea").should("have.value", "clintquestion");
        });
        cy.get("[data-cy=question]").trigger("mouseover").click();
      });
    });
    // view question details
    cy.get("[data-cy=edit-question]").within(($edit) => {
      cy.get("[data-cy=select-name]").should("exist");
    });
  });

  it("shows mentor-specific questions to that mentor only", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: { _id: "notclint" },
      subject,
    });
    cy.visit("/author/subject?id=background");
    cy.get("[data-cy=toggle-questions]").trigger("mouseover").click();
    cy.get("[data-cy=categories]").within(($categories) => {
      cy.get("[data-cy=category-0]").within(($cateogry) => {
        cy.get("[data-cy=category-questions]").within(($categoryQuestions) => {
          cy.get("[data-cy=category-question-0]").within(
            ($categoryQuestion) => {
              cy.get("[data-cy=question]").within(($input) => {
                cy.get("textarea").should("have.value", "question1");
              });
            }
          );
        });
      });
    });
    cy.get("[data-cy=questions]").within(($questions) => {
      cy.get("[data-cy=question-0]").within(($question) => {
        cy.get("[data-cy=question]").within(($input) => {
          cy.get("textarea").should("have.value", "notclintquestion");
        });
      });
    });
  });

  it("only shows utterance name if question is utterance", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor,
    });
    cy.visit("/author/subject");
    cy.get("[data-cy=toggle-questions]").trigger("mouseover").click();
    cy.get("[data-cy=add-question]").trigger("mouseover").click();
    cy.get("[data-cy=questions]").within(($questions) => {
      cy.get("[data-cy=question-0]").within(($question) => {
        cy.get("[data-cy=question]").trigger("mouseover").click();
      });
    });
    cy.get("[data-cy=select-type]").should("have.attr", "cy-value", "QUESTION");
    cy.get("[data-cy=select-name]").should("not.exist");
    cy.get("[data-cy=select-type]").trigger("mouseover").click();
    cy.get("[data-cy=utterance-type]").trigger("mouseover").click();
    cy.get("[data-cy=select-type]").should(
      "have.attr",
      "cy-value",
      "UTTERANCE"
    );
    cy.get("[data-cy=select-name]").should("have.attr", "cy-value", "");
    cy.get("[data-cy=select-name]").trigger("mouseover").click();
    cy.get("[data-cy=IDLE-name]").trigger("mouseover").click();
    cy.get("[data-cy=select-name]").should("have.attr", "cy-value", "_IDLE_");
  });

  it("only shows video length if question is video only", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor,
    });
    cy.visit("/author/subject");
    cy.get("[data-cy=toggle-questions]").trigger("mouseover").click();
    cy.get("[data-cy=add-question]").trigger("mouseover").click();
    cy.get("[data-cy=questions]").within(($questions) => {
      cy.get("[data-cy=question-0]").within(($question) => {
        cy.get("[data-cy=question]").trigger("mouseover").click();
      });
    });
    cy.get("[data-cy=video-length]").should("not.exist");
    cy.get("[data-cy=select-mentor-type]").trigger("mouseover").click();
    cy.get("[data-cy=video-mentor-type]").trigger("mouseover").click();
    cy.get("[data-cy=select-mentor-type]").should(
      "have.attr",
      "cy-value",
      "VIDEO"
    );

    cy.get("[data-cy=video-length]").within(($input) => {
      cy.get("input").should("have.value", "");
    });
    cy.get("[data-cy=video-length]").clear().type("test");
    cy.get("[data-cy=video-length]").within(($input) => {
      cy.get("input").should("have.value", "");
    });
    cy.get("[data-cy=video-length]").clear().type("10.2");
    cy.get("[data-cy=video-length]").within(($input) => {
      cy.get("input").should("have.value", "10");
    });

    cy.get("[data-cy=select-mentor-type]").trigger("mouseover").click();
    cy.get("[data-cy=chat-mentor-type]").trigger("mouseover").click();
    cy.get("[data-cy=select-mentor-type]").should(
      "have.attr",
      "cy-value",
      "CHAT"
    );
    cy.get("[data-cy=video-length]").should("not.exist");

    cy.get("[data-cy=select-mentor-type]").trigger("mouseover").click();
    cy.get("[data-cy=none-mentor-type]").trigger("mouseover").click();
    cy.get("[data-cy=video-length]").should("not.exist");
  });

  describe("can add, delete, and edit topics", () => {
    it("can add a topic", () => {
      cySetup(cy);
      cyMockDefault(cy, {
        mentor: { _id: "notclint" },
        subject: [
          subject,
          {
            ...subject,
            topics: [
              ...subject.topics,
              {
                id: "t1",
                name: "Topic2",
                description: "2",
              },
            ],
          },
        ],
        gqlQueries: [mockGQL("UpdateSubject", { me: { updateSubject: {} } })],
      });
      cy.visit("/author/subject?id=background");
      cy.get("[data-cy=toggle-topics]").trigger("mouseover").click();
      cy.get("[data-cy=topics-list-add-topic]").trigger("mouseover").click();
      cy.get("[data-cy=topics-list]").within(($topicsList) => {
        cy.get("[data-cy=topic-1]").within(($topic1) => {
          cy.get("[data-cy=toggle-topic]").trigger("mouseover").click();
          cy.get("[data-cy=topic-name]").should("have.attr", "data-test", "");
          cy.get("[data-cy=topic-description]").should(
            "have.attr",
            "data-test",
            ""
          );
          cy.get("[data-cy=topic-name]").clear().type("Topic2");
          cy.get("[data-cy=topic-description]").clear().type("2");
          cy.get("[data-cy=topic-name]").should(
            "have.attr",
            "data-test",
            "Topic2"
          );
          cy.get("[data-cy=topic-description]").should(
            "have.attr",
            "data-test",
            "2"
          );
        });
      });
      cy.get("[data-cy=save-button]").should("not.be.disabled");
      cy.get("[data-cy=save-button]").trigger("mouseover").click();
      cy.get("[data-cy=save-button]").should("be.disabled");
      cy.get("[data-cy=topics-list]").within(($topicsList) => {
        cy.get("[data-cy=topic-1]").within(($topic1) => {
          cy.get("[data-cy=topic-name]").should(
            "have.attr",
            "data-test",
            "Topic2"
          );
          cy.get("[data-cy=topic-description]").should(
            "have.attr",
            "data-test",
            "2"
          );
        });
      });
    });

    it("can delete a topic", () => {
      cySetup(cy);
      cyMockDefault(cy, {
        mentor: { _id: "notclint" },
        subject: [
          subject,
          {
            ...subject,
            topics: [
              ...subject.topics,
              {
                id: "t1",
                name: "Topic2",
                description: "2",
              },
            ],
          },
        ],
        gqlQueries: [mockGQL("UpdateSubject", { me: { updateSubject: {} } })],
      });
      cy.visit("/author/subject?id=background");
      cy.get("[data-cy=toggle-topics]").trigger("mouseover").click();
      cy.get("[data-cy=topic-0]").within(($topic) => {
        cy.get("[data-cy=delete-topic]").trigger("mouseover").click();
      });
      cy.get("[data-cy=topics-list]").children().should("not.exist");
      // deleting topic also removes topic from question
      cy.get("[data-cy=toggle-questions]").trigger("mouseover").click();
      cy.get("[data-cy=categories]").within(($categories) => {
        cy.get("[data-cy=category-questions]").within(($categoryQuestions) => {
          cy.get("[data-cy=category-question-0]").within(
            ($categoryQuestion) => {
              cy.get("[data-cy=question]").trigger("mouseover").click();
            }
          );
        });
      });
      cy.get("[data-cy=edit-question]").within(($edit) => {
        cy.get("[data-cy=question-topics-list]").within(($topics) => {
          cy.get("[data-cy=topic-0]").should("not.exist");
        });
      });
      // after saving reload subject
      cy.get("[data-cy=save-button]").should("not.be.disabled");
      cy.get("[data-cy=save-button]").trigger("mouseover").click();
      cy.get("[data-cy=save-button]").should("be.disabled");
      cy.get("[data-cy=toggle-questions]").trigger("mouseover").click();
      cy.get("[data-cy=question-topics-list]").children().should("not.exist");
    });

    it("can edit a topic", () => {
      cySetup(cy);
      cyMockDefault(cy, {
        mentor,
        subject: [
          subject,
          {
            ...subject,
            topics: [
              {
                id: "t1",
                name: "Topic1 Edited",
                description: "1 Edited",
              },
            ],
          },
        ],
        gqlQueries: [mockGQL("UpdateSubject", { me: { updateSubject: {} } })],
      });
      cy.visit("/author/subject?id=background");
      cy.get("[data-cy=toggle-topics]").trigger("mouseover").click();
      cy.get("[data-cy=topics-list]").within(($tl) => {
        cy.get("[data-cy=topic-0]").within(($t) => {
          cy.get("[data-cy=toggle-topic]").trigger("mouseover").click();
          cy.get("[data-cy=topic-name]").type(" Edited");
          cy.get("[data-cy=topic-description]").type(" Edited");
        });
      });
      cy.get("[data-cy=toggle-questions]").trigger("mouseover").click();
      // also edits topic in question
      cy.get("[data-cy=categories]").within(($categories) => {
        cy.get("[data-cy=category-questions]").within(($categoryQuestions) => {
          cy.get("[data-cy=category-question-0]").within(
            ($categoryQuestion) => {
              cy.get("[data-cy=question]").trigger("mouseover").click();
            }
          );
        });
      });
      cy.get("[data-cy=edit-question]").within(($edit) => {
        cy.get("[data-cy=question-topics-list]").within(($qtl) => {
          cy.get("[data-cy=topic-0]").within(($t) => {
            cy.get("[data-cy=topic-name]").should(
              "have.attr",
              "data-test",
              "Topic1 Edited"
            );
          });
        });
      });
      // after saving reload subject
      cy.get("[data-cy=save-button]").should("not.be.disabled");
      cy.get("[data-cy=save-button]").trigger("mouseover").click();
      cy.get("[data-cy=save-button]").should("be.disabled");
      cy.get("[data-cy=toggle-topics]").trigger("mouseover").click();
      cy.get("[data-cy=topics-list]").within(($tl) => {
        cy.get("[data-cy=topic-0]").within(($t) => {
          cy.get("[data-cy=toggle-topic]").trigger("mouseover").click();
          cy.get("[data-cy=topic-name]").should(
            "have.attr",
            "data-test",
            "Topic1 Edited"
          );
          cy.get("[data-cy=topic-description]").should(
            "have.attr",
            "data-test",
            "1 Edited"
          );
        });
      });
    });
  });

  describe("can add, delete, and edit categories", () => {
    it("can add a category", () => {
      cySetup(cy);
      cyMockDefault(cy, {
        mentor,
        subject: [
          subject,
          {
            ...subject,
            categories: [
              ...subject.categories,
              {
                id: "c2",
                name: "category 2",
                description: "2",
              },
            ],
          },
        ],
        gqlQueries: [mockGQL("UpdateSubject", { me: { updateSubject: {} } })],
      });
      cy.visit("/author/subject?id=background");
      cy.get("[data-cy=toggle-questions]").trigger("mouseover").click();
      cy.get("[data-cy=add-category]").trigger("mouseover").click();
      cy.get("[data-cy=categories]").within(($categories) => {
        cy.get("[data-cy=category-1]").within(($cateogry) => {
          // added new category
          cy.get("[data-cy=category-name]").within(($input) => {
            cy.get("input").should("have.value", "");
          });
          cy.get("[data-cy=category-description]").within(($input) => {
            cy.get("input").should("have.value", "");
          });
          // edit new category
          cy.get("[data-cy=category-name]").type("category 2");
          cy.get("[data-cy=category-description]").type("2");
          cy.get("[data-cy=category-name]").within(($input) => {
            cy.get("input").should("have.value", "category 2");
          });
          cy.get("[data-cy=category-description]").within(($input) => {
            cy.get("input").should("have.value", "2");
          });
        });
      });
      cy.get("[data-cy=save-button]").should("not.be.disabled");
      cy.get("[data-cy=save-button]").trigger("mouseover").click();
      cy.get("[data-cy=save-button]").should("be.disabled");
      // saved changes
      cy.get("[data-cy=categories]").within(($categories) => {
        cy.get("[data-cy=category-1]").within(($cateogry) => {
          cy.get("[data-cy=category-name]").within(($input) => {
            cy.get("input").should("have.value", "category 2");
          });
          cy.get("[data-cy=category-description]").within(($input) => {
            cy.get("input").should("have.value", "2");
          });
        });
      });
    });

    it("can delete a category and send its questions back to uncategorized list", () => {
      cySetup(cy);
      cyMockDefault(cy, {
        mentor,
        subject: [
          subject,
          {
            ...subject,
            categories: [],
          },
        ],
        gqlQueries: [mockGQL("UpdateSubject", { me: { updateSubject: {} } })],
      });
      cy.visit("/author/subject?id=background");
      cy.get("[data-cy=toggle-questions]").trigger("mouseover").click();
      // delete category
      cy.get("[data-cy=categories]").within(($categories) => {
        cy.get("[data-cy=category-0]").within(($category) => {
          cy.get("[data-cy=delete-category]").trigger("mouseover").click();
        });
        cy.get("[data-cy=category-0]").should("not.exist");
      });
      // check category question was put back into uncategorized list
      cy.get("[data-cy=questions]").within(($questions) => {
        cy.get("[data-cy=question-0]").within(($question) => {
          cy.get("[data-cy=question]").within(($input) => {
            cy.get("textarea").should("have.value", "question1");
          });
        });
        cy.get("[data-cy=question-1]").within(($question) => {
          cy.get("[data-cy=question]").within(($input) => {
            cy.get("textarea").should("have.value", "clintquestion");
          });
        });
      });
      cy.get("[data-cy=save-button]").should("not.be.disabled");
    });

    it("can edit a category", () => {
      cySetup(cy);
      cyMockDefault(cy, {
        mentor,
        subject: [
          subject,
          {
            ...subject,
            categories: [
              {
                id: "c1",
                name: "Category1 Edited",
                description: "1 Edited",
              },
            ],
          },
        ],
        gqlQueries: [mockGQL("UpdateSubject", { me: { updateSubject: {} } })],
      });
      cy.visit("/author/subject?id=background");
      cy.get("[data-cy=toggle-questions]").trigger("mouseover").click();
      // edit category
      cy.get("[data-cy=categories]").within(($categories) => {
        cy.get("[data-cy=category-0]").within(($category) => {
          cy.get("[data-cy=category-name]").type(" Edited");
          cy.get("[data-cy=category-description]").type(" Edited");
        });
      });
      cy.get("[data-cy=save-button]").should("not.be.disabled");
      cy.get("[data-cy=save-button]").trigger("mouseover").click();
      cy.get("[data-cy=save-button]").should("be.disabled");
      // check category was saved
      cy.get("[data-cy=categories]").within(($categories) => {
        cy.get("[data-cy=category-0]").within(($category) => {
          cy.get("[data-cy=category-name]").within(($input) => {
            cy.get("input").should("have.value", "Category1 Edited");
          });
          cy.get("[data-cy=category-description]").within(($input) => {
            cy.get("input").should("have.value", "1 Edited");
          });
          cy.get("[data-cy=category-questions]").within(
            ($categoryQuestions) => {
              cy.get("[data-cy=category-question-0]").within(
                ($categoryQuestion) => {
                  cy.get("[data-cy=question]").within(($input) => {
                    cy.get("textarea").should("have.value", "question1");
                  });
                }
              );
            }
          );
        });
      });
    });

    it("can delete a question in a category", () => {
      cySetup(cy);
      cyMockDefault(cy, {
        mentor,
        subject,
        gqlQueries: [mockGQL("UpdateSubject", { me: { updateSubject: {} } })],
      });
      cy.visit("/author/subject?id=background");
      cy.get("[data-cy=toggle-questions]").trigger("mouseover").click();
      cy.get("[data-cy=categories]").within(($categories) => {
        cy.get("[data-cy=category-0]").within(($category) => {
          cy.get("[data-cy=category-questions]").within(
            ($categoryQuestions) => {
              cy.get("[data-cy=category-question-0]").within(
                ($categoryQuestion) => {
                  cy.get("[data-cy=delete-question]")
                    .trigger("mouseover")
                    .click();
                }
              );
              cy.get("[data-cy=category-question-0]").should("not.exist");
            }
          );
        });
      });
      cy.get("[data-cy=questions]").children().should("have.length", 1);
      cy.get("[data-cy=save-button]").should("not.be.disabled");
    });

    it("can edit a question in a category", () => {
      cySetup(cy);
      cyMockDefault(cy, {
        mentor,
        subject,
        gqlQueries: [mockGQL("UpdateSubject", { me: { updateSubject: {} } })],
      });
      cy.visit("/author/subject?id=background");
      cy.get("[data-cy=toggle-questions]").trigger("mouseover").click();
      cy.get("[data-cy=categories]").within(($categories) => {
        cy.get("[data-cy=category-0]").within(($category) => {
          cy.get("[data-cy=category-questions]").within(
            ($categoryQuestions) => {
              cy.get("[data-cy=category-question-0]").within(
                ($categoryQuestion) => {
                  cy.get("[data-cy=question]").trigger("mouseover").click();
                }
              );
            }
          );
        });
      });
      // change question type
      cy.get("[data-cy=edit-question]").within(($editQuestion) => {
        cy.get("[data-cy=select-type]").contains("Question");
        cy.get("[data-cy=select-type]").trigger("mouseover").click();
      });
      cy.get("[data-cy=utterance-type]").trigger("mouseover").click();
      cy.get("[data-cy=edit-question]").within(($editQuestion) => {
        cy.get("[data-cy=select-type]").contains("Utterance");
      });
      cy.get("[data-cy=save-button]").should("not.be.disabled");
      cy.get("[data-cy=edit-question]").within(($editQuestion) => {
        // delete paraphrase
        cy.get("[data-cy=paraphrases]").within(($paraphrases) => {
          cy.get("[data-cy=paraphrase-0]").within(($paraphrase) => {
            cy.get("[data-cy=delete-paraphrase]").trigger("mouseover").click();
          });
          cy.get("[data-cy=paraphrase-0]").should("not.exist");
        });
        // delete topic
        cy.get("[data-cy=question-topics-list]").within(($topics) => {
          cy.get("[data-cy=topic-0]").within(($topic) => {
            cy.get("[data-cy=delete-topic]").trigger("mouseover").click();
          });
          cy.get("[data-cy=topic-0]").should("not.exist");
        });
      });
      cy.get("[data-cy=save-button]").should("not.be.disabled");
    });
  });

  describe("can add, delete, and edit questions", () => {
    it("can add a question", () => {
      cySetup(cy);
      cyMockDefault(cy, {
        mentor,
        subject: [
          subject,
          {
            ...subject,
            questions: [
              ...subject.questions,
              {
                question: {
                  _id: "q4",
                  question: "new question",
                  type: QuestionType.QUESTION,
                  name: "",
                  paraphrases: [],
                  mentor: null,
                },
                topics: [],
                category: null,
              },
            ],
          },
        ],
        gqlQueries: [mockGQL("UpdateSubject", { me: { updateSubject: {} } })],
      });
      cy.visit("/author/subject?id=background");
      cy.get("[data-cy=toggle-questions]").trigger("mouseover").click();
      cy.get("[data-cy=add-question]").trigger("mouseover").click();
      cy.get("[data-cy=questions]").within(($questions) => {
        cy.get("[data-cy=question-1]").within(($question) => {
          cy.get("[data-cy=question]").within(($input) => {
            cy.get("textarea").should("have.value", "");
          });
          cy.get("[data-cy=question]").trigger("mouseover").click();
        });
      });
      cy.get("[data-cy=edit-question]").within(($editQuestion) => {
        cy.get("[data-cy=select-type]").contains("Question");
        cy.get("[data-cy=question-topics-list]").within(($topics) => {
          cy.get("[data-cy=topic-0]").should("not.exist");
        });
        cy.get("[data-cy=paraphrases]").within(($topics) => {
          cy.get("[data-cy=paraphrase-0]").should("not.exist");
        });
      });
      cy.get("[data-cy=save-button]").should("not.be.disabled");
      cy.get("[data-cy=save-button]").trigger("mouseover").click();
      cy.get("[data-cy=save-button]").should("be.disabled");
      cy.get("[data-cy=questions]").children().should("have.length", 2);
    });

    it("can delete a question", () => {
      cySetup(cy);
      cyMockDefault(cy, {
        mentor,
        subject,
      });
      cy.visit("/author/subject?id=background");
      cy.get("[data-cy=toggle-questions]").trigger("mouseover").click();
      cy.get("[data-cy=questions]").within(($questions) => {
        cy.get("[data-cy=question-0]").within(($question) => {
          cy.get("[data-cy=delete-question]").trigger("mouseover").click();
        });
        cy.get("[data-cy=question-0]").should("not.exist");
      });
      cy.get("[data-cy=save-button]").should("not.be.disabled");
    });

    it("can edit a question", () => {
      cySetup(cy);
      cyMockDefault(cy, {
        mentor,
        subject,
      });
      cy.visit("/author/subject?id=background");
      cy.get("[data-cy=toggle-questions]").trigger("mouseover").click();
      // open question
      cy.get("[data-cy=questions]").within(($questions) => {
        cy.get("[data-cy=question-0]").within(($question) => {
          cy.get("[data-cy=question]").trigger("mouseover").click();
        });
      });
      // change question type
      cy.get("[data-cy=edit-question]").within(($editQuestion) => {
        cy.get("[data-cy=select-type]").contains("Utterance");
        cy.get("[data-cy=select-type]").trigger("mouseover").click();
      });
      cy.get("[data-cy=question-type]").trigger("mouseover").click();
      cy.get("[data-cy=edit-question]").within(($editQuestion) => {
        cy.get("[data-cy=select-type]").contains("Question");
      });
      cy.get("[data-cy=save-button]").should("not.be.disabled");
      // add paraphrase
      cy.get("[data-cy=edit-question]").within(($editQuestion) => {
        cy.get("[data-cy=paraphrases]").within(($paraphrases) => {
          cy.get("[data-cy=paraphrase-0]").should("not.exist");
        });
        cy.get("[data-cy=add-paraphrase]").trigger("mouseover").click();
        cy.get("[data-cy=paraphrases]").within(($paraphrases) => {
          cy.get("[data-cy=paraphrase-0]").should("exist");
          cy.get("[data-cy=paraphrase-0]").within(($paraphrase) => {
            cy.get("[data-cy=edit-paraphrase]").within(($input) => {
              cy.get("input").should("have.value", "");
            });
            cy.get("[data-cy=edit-paraphrase]").type("test");
            cy.get("[data-cy=edit-paraphrase]").within(($input) => {
              cy.get("input").should("have.value", "test");
            });
          });
        });
      });
      cy.get("[data-cy=save-button]").should("not.be.disabled");
    });
  });

  it("save button is disabled until edits are made", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor,
      subject,
    });
    cy.visit("/author/subject?id=background");
    cy.get("[data-cy=save-button]").should("be.disabled");
    cy.get("[data-cy=subject-name]").within(($input) => {
      cy.get("textarea").should("have.value", "Background");
    });
    cy.get("[data-cy=subject-name]").type("edit");
    cy.get("[data-cy=subject-name]").within(($input) => {
      cy.get("textarea").should("have.value", "Backgroundedit");
    });
    cy.get("[data-cy=save-button]").should("not.be.disabled");
  });
});
