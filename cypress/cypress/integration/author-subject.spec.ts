/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { cySetup, cyInterceptGraphQL, cyMockLogin, cyMockGQL } from "../support/functions";
import login from "../fixtures/login"
import { QuestionType } from "../support/types";

const mentor = {
  _id: "clint"
}

const subject = {
  _id: "background",
  name: "Background",
  description: "These questions will ask general questions about your background that might be relevant to how people understand your career.",
  isRequired: false,
  categories: [
    {
      id: "c1",
      name: "Category1",
      description: "1"
    }
  ],
  topics: [
    {
      id: "t1",
      name: "Topic1",
      description: "1"
    }
  ],
  questions: [
    {
      question: {
        _id: "q1",
        question: "question1",
        type: QuestionType.QUESTION,
        name: "",
        paraphrases: ["paraphrase1"],
        mentor: null
      },
      topics: [{ id: "t1" }],
      category: { id: "c1" }
    },
    {
      question: {
        _id: "q2",
        question: "clintquestion",
        type: QuestionType.UTTERANCE,
        name: "",
        paraphrases: [],
        mentor: "clint"
      },
      topics: [],
      category: null
    },
    {
      question: {
        _id: "q3",
        question: "notclintquestion",
        type: QuestionType.QUESTION,
        name: "",
        paraphrases: [],
        mentor: "notclint"
      },
      topics: [],
      category: null
    }
  ],
}

describe("Edit subject", () => {

  it("redirects to login page if not logged in", () => {
    cySetup(cy);
    cy.visit("/profile");
    cy.location("pathname").should("contain", "/login");
  });

  it("can open and collapse different sections", () => {
    cySetup(cy);
    cyMockLogin();
    cyInterceptGraphQL(cy, [
      cyMockGQL("login", login),
      cyMockGQL("mentor", mentor, true)
    ]);
    cy.visit("/author/subject");
    // info opened by default
    cy.get("#name").should("exist");
    cy.get("#description").should("exist");
    cy.get("#topics").should("not.exist");
    cy.get("#categories").should("not.exist");
    cy.get("#questions").should("not.exist");
    // close info
    cy.get("#toggle-info").trigger("mouseover").click();
    cy.get("#name").should("not.exist");
    cy.get("#description").should("not.exist");
    cy.get("#topics").should("not.exist");
    cy.get("#categories").should("not.exist");
    cy.get("#questions").should("not.exist");
    // open topics
    cy.get("#toggle-topics").trigger("mouseover").click();
    cy.get("#name").should("not.exist");
    cy.get("#description").should("not.exist");
    cy.get("#topics").should("exist");
    cy.get("#categories").should("not.exist");
    cy.get("#questions").should("not.exist");
    // open questions (closes topics)
    cy.get("#toggle-questions").trigger("mouseover").click();
    cy.get("#name").should("not.exist");
    cy.get("#description").should("not.exist");
    cy.get("#topics").should("not.exist");
    cy.get("#categories").should("exist");
    cy.get("#questions").should("exist");
  });

  it("shows new empty subject if no subject id in url parameters", () => {
    cySetup(cy);
    cyMockLogin();
    cyInterceptGraphQL(cy, [
      cyMockGQL("login", login),
      cyMockGQL("mentor", mentor, true)
    ]);
    cy.visit("/author/subject");
    cy.get("#name").should("have.value", "");
    cy.get("#description").should("have.value", "");
    cy.get("#toggle-topics").trigger("mouseover").click();
    cy.get("#topics").children().should("have.length", 0);
    cy.get("#toggle-questions").trigger("mouseover").click();
    cy.get("#categories").children().should("have.length", 0);
    cy.get("#questions").children().should("have.length", 0);
  });

  it("loads subject with default and mentor-specific questions if no subject id in url parameters", () => {
    cySetup(cy);
    cyMockLogin();
    cyInterceptGraphQL(cy, [
      cyMockGQL("login", login),
      cyMockGQL("mentor", mentor, true),
      cyMockGQL("subject", subject),
    ]);
    cy.visit("/author/subject?id=background");
    cy.get("#name").should("have.value", "Background");
    cy.get("#description").should("have.value", "These questions will ask general questions about your background that might be relevant to how people understand your career.");
    cy.get("#toggle-topics").trigger("mouseover").click();
    cy.get("#topics").children().should("have.length", 1);
    cy.get("#topic-0 #name").should("have.value", "Topic1");
    cy.get("#topic-0 #toggle").trigger("mouseover").click();
    cy.get("#topic-0 #description").should("have.value", "1");
    cy.get("#toggle-questions").trigger("mouseover").click();
    cy.get("#categories").children().should("have.length", 1);
    cy.get("#category-0 #name").should("have.value", "Category1");
    cy.get("#category-0 #description").should("have.value", "1");
    cy.get("#category-0 #category-questions li").children().should("have.length", "1");
    cy.get("#category-0 #category-questions #category-question-0 #question").should("have.value", "question1");
    cy.get("#category-0 #category-questions #category-question-0 #question").trigger("mouseover").click();
    cy.get("#edit-question #name").should("have.value", "");
    cy.get("#edit-question #topics li").should("have.length", 2);
    cy.get("#edit-question #topics #topic-0 #name").contains("Topic1")
    cy.get("#edit-question #paraphrases li").should("have.length", 2);
    cy.get("#edit-question #paraphrases #paraphrase-0 #edit-paraphrase").should("have.value", "paraphrase1")

    cy.get("#questions li").children().should("have.length", 1);
    cy.get("#questions #question-0 #question").should("have.value", "clintquestion");
    cy.get("#questions #question-0 #question").trigger("mouseover").click();
    cy.get("#edit-question #topics li").should("have.length", 1);
    cy.get("#edit-question #paraphrases li").should("have.length", 1);
  });

  it("shows mentor-specific questions to that mentor only", () => {
    cySetup(cy);
    cyMockLogin();
    cyInterceptGraphQL(cy, [
      cyMockGQL("login", login),
      cyMockGQL("mentor", { _id: "notclint" }, true),
      cyMockGQL("subject", subject),
    ]);
    cy.visit("/author/subject?id=background");
    cy.get("#toggle-questions").trigger("mouseover").click();
    cy.get("#categories").children().should("have.length", 1);
    cy.get("#category-0 #category-questions li").children().should("have.length", "1");
    cy.get("#category-0 #category-questions #category-question-0 #question").should("have.value", "question1");
    cy.get("#questions li").children().should("have.length", 1);
    cy.get("#questions #question-0 #question").should("have.value", "notclintquestion")
  });

  describe("can add, delete, and edit topics", () => {
    it("can add a topic", () => {
      cySetup(cy);
      cyMockLogin();
      cyInterceptGraphQL(cy, [
        cyMockGQL("login", login),
        cyMockGQL("mentor", mentor, true),
        cyMockGQL("updateSubject", {}, true),
        cyMockGQL("subject", [subject, {
          ...subject, topics: [...subject.topics, {
            id: "t1",
            name: "Topic2",
            description: "2"
          }]
        }]),
      ]);
      cy.visit("/author/subject?id=background");
      cy.get("#toggle-topics").trigger("mouseover").click();
      cy.get("#add-topic").trigger("mouseover").click();
      cy.get("#topics").children().should("have.length", 2);
      cy.get("#topic-1 #toggle").trigger("mouseover").click();
      cy.get("#topic-1 #name").should("have.value", "");
      cy.get("#topic-1 #description").should("have.value", "");
      cy.get("#topic-1 #name").clear().type("Topic2");
      cy.get("#topic-1 #description").clear().type("2");
      cy.get("#topic-1 #name").should("have.value", "Topic2");
      cy.get("#topic-1 #description").should("have.value", "2");

      cy.get("#save-button").should("not.be.disabled");
      cy.get("#save-button").trigger("mouseover").click();
      cy.get("#save-button").should("be.disabled");
      cy.get("#topic-1 #name").should("have.value", "Topic2");
      cy.get("#topic-1 #description").should("have.value", "2");
    });

    it("can delete a topic", () => {
      cySetup(cy);
      cyMockLogin();
      cyInterceptGraphQL(cy, [
        cyMockGQL("login", login),
        cyMockGQL("mentor", mentor, true),
        cyMockGQL("updateSubject", {}, true),
        cyMockGQL("subject", [subject, {
          ...subject, topics: []
        }]),
      ]);
      cy.visit("/author/subject?id=background");
      cy.get("#toggle-topics").trigger("mouseover").click();
      cy.get("#topics").children().should("have.length", 1);
      cy.get("#topic-0 #delete").trigger("mouseover").click();
      cy.get("#topics").children().should("not.exist");
      // deleting topic also removes topic from question
      cy.get("#toggle-questions").trigger("mouseover").click();
      cy.get("#categories").children().should("have.length", 1);
      cy.get("#category-0 #category-questions li").children().should("have.length", "1");
      cy.get("#category-0 #category-questions #category-question-0 #question").trigger("mouseover").click();
      cy.get("#edit-question #name").should("have.value", "");
      cy.get("#edit-question #topics li").should("have.length", 1);
      // after saving reload subject
      cy.get("#save-button").should("not.be.disabled");
      cy.get("#save-button").trigger("mouseover").click();
      cy.get("#save-button").should("be.disabled");
      cy.get("#toggle-questions").trigger("mouseover").click();
      cy.get("#topics").children().should("not.exist");
    });

    it("can edit a topic", () => {
      cySetup(cy);
      cyMockLogin();
      cyInterceptGraphQL(cy, [
        cyMockGQL("login", login),
        cyMockGQL("mentor", mentor, true),
        cyMockGQL("updateSubject", {}, true),
        cyMockGQL("subject", [subject, {
          ...subject, topics: [{
            id: "t1",
            name: "Topic1 Edited",
            description: "1 Edited"
          }]
        }]),
      ]);
      cy.visit("/author/subject?id=background");
      cy.get("#toggle-topics").trigger("mouseover").click();
      cy.get("#topic-0 #toggle").trigger("mouseover").click();
      cy.get("#topic-0 #name").clear().type("Topic1 Edited");
      cy.get("#topic-0 #description").clear().type("1 Edited");
      // editing topic also edits topic from question
      cy.get("#toggle-questions").trigger("mouseover").click();
      cy.get("#categories").children().should("have.length", 1);
      cy.get("#category-0 #category-questions li").children().should("have.length", "1");
      cy.get("#category-0 #category-questions #category-question-0 #question").trigger("mouseover").click();
      cy.get("#edit-question #name").should("have.value", "");
      cy.get("#edit-question #topics li").should("have.length", 2);
      cy.get("#edit-question #topics #topic-0 #name").contains("Topic1 Edited")
      // after saving reload subject
      cy.get("#save-button").should("not.be.disabled");
      cy.get("#save-button").trigger("mouseover").click();
      cy.get("#save-button").should("be.disabled");
      cy.get("#toggle-topics").trigger("mouseover").click();
      cy.get("#topic-0 #toggle").trigger("mouseover").click();
      cy.get("#topic-0 #name").should("have.value", "Topic1 Edited");
      cy.get("#topic-0 #description").should("have.value", "1 Edited");
    });

    it("can reorder topics by dragging them", () => {

    });
  })

  describe("can add, delete, and edit categories", () => {
    it("can add a category", () => {

    });

    it("can delete a category and send its questions back to uncategorized list", () => {

    });

    it("can edit a category", () => {

    });

    it("can add a question to a category by dragging it from questions list", () => {

    });

    it("can add a question to a category by dragging it from another category, removing it from original category", () => {

    });

    it("can remove a question from a category by dragging it to questions list", () => {

    });

    it("can delete a question in a category", () => {

    })

    it("can edit a question in a category", () => {

    });

  })

  it("can add, delete, and edit questions", () => {

  })

  it("save button is disabled until edits are made", () => {
    cySetup(cy);
    cyMockLogin();
    cyInterceptGraphQL(cy, [
      cyMockGQL("login", login),
      cyMockGQL("mentor", mentor, true),
      cyMockGQL("subject", subject),
    ]);
    cy.visit("/author/subject?id=background");
    cy.get("#save-button").should("be.disabled");
    cy.get("#name").should("have.value", "Background");
    cy.get("#name").clear().type("New name");
    cy.get("#name").should("have.value", "New name");
    cy.get("#save-button").should("not.be.disabled");
  })

});
