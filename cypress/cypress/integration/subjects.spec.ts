import login from "../fixtures/login";
import allSubjects from "../fixtures/subjects/all-subjects";
import { cyInterceptGraphQL, cyMockGQL, cyMockLogin, cySetup } from "../support/functions";

const mentor = {
  _id: "clintanderson",
  subjects: [
    {
      _id: "background",
      name: "Background",
      description: "These questions will ask general questions about your background that might be relevant to how people understand your career.",
      isRequired: true,
    },
    {
      _id: "repeat_after_me",
      name: "Repeat After Me",
      description: "These are miscellaneous phrases you'll be asked to repeat.",
      isRequired: true,
    },
  ]
};

describe("Select Subjects", () => {
  it("redirects to login page if the user is not logged in", () => {
    cySetup(cy);
    cy.visit("/subjects");
    cy.location("pathname").should("contain", "/login");
  });

  it("can select subjects", () => {
    cySetup(cy);
    cyMockLogin();
    cyInterceptGraphQL(cy, [
      cyMockGQL("login", login),
      cyMockGQL("mentor", [mentor, {...mentor, defaultSubject: {_id: "leadership"},  subjects: [...mentor.subjects, {
        _id: "leadership",
        name: "Leadership",
        description: "These questions will ask about being in a leadership role.",
        isRequired: false,
        categories: [],
        topics: [],
        questions: []
      }]}], true),
      cyMockGQL("updateMentor", true, true),
      cyMockGQL("subjects", [allSubjects])
    ]);
    cy.visit("/subjects");
    cy.location("pathname").should("contain", "/subjects");
    cy.get("#subjects").children().should("have.length", 3);
    // required subject background cannot be deselected
    cy.get("#subjects #subject-background #name").contains("Background");
    cy.get("#subjects #subject-background #description").contains("These questions will ask general questions about your background that might ");
    cy.get('#subjects #subject-background #select [type="checkbox"]').should("be.disabled");
    cy.get('#subjects #subject-background #select [type="checkbox"]').should("be.checked");
    cy.get('#subjects #subject-background #default [type="checkbox"]').should("not.be.disabled");
    cy.get('#subjects #subject-background #default [type="checkbox"]').should("not.be.checked");
    // required subject repeat_after_me cannot be deselected
    cy.get("#subjects #subject-repeat_after_me #name").contains("Repeat After Me");
    cy.get("#subjects #subject-repeat_after_me #description").contains("These are miscellaneous phrases you'll be asked to repeat");
    cy.get('#subjects #subject-repeat_after_me #select [type="checkbox"]').should("be.disabled");
    cy.get('#subjects #subject-repeat_after_me #select [type="checkbox"]').should("be.checked");
    cy.get('#subjects #subject-repeat_after_me #default [type="checkbox"]').should("not.be.disabled");
    cy.get('#subjects #subject-repeat_after_me #default [type="checkbox"]').should("not.be.checked");
    // subject leadership is not required and can be deselected
    cy.get("#subjects #subject-leadership #name").contains("Leadership");
    cy.get("#subjects #subject-leadership #description").contains("These questions will ask about being in a leadership role");
    cy.get('#subjects #subject-leadership #select [type="checkbox"]').should("not.be.disabled");
    cy.get('#subjects #subject-leadership #select [type="checkbox"]').should("not.be.checked");
    cy.get('#subjects #subject-leadership #default [type="checkbox"]').should("be.disabled");
    cy.get('#subjects #subject-leadership #default [type="checkbox"]').should("not.be.checked");
    // can only have one primary subject
    cy.get('#subjects #subject-background #default [type="checkbox"]').check().should('be.checked');
    cy.get('#subjects #subject-repeat_after_me #default [type="checkbox"]').should("not.be.checked");
    cy.get('#subjects #subject-leadership #default [type="checkbox"]').should("not.be.checked");
    cy.get('#subjects #subject-repeat_after_me #default [type="checkbox"]').check().should("be.checked");
    cy.get('#subjects #subject-background #default [type="checkbox"]').should('not.be.checked');
    cy.get('#subjects #subject-leadership #default [type="checkbox"]').should("not.be.checked");
    // select subject and primary subject and save
    cy.get('#subjects #subject-leadership #select [type="checkbox"]').check().should('be.checked');
    cy.get('#subjects #subject-leadership #default [type="checkbox"]').check().should('be.checked');
    cy.get('#subjects #subject-background #default [type="checkbox"]').should("not.be.checked");
    cy.get('#subjects #subject-repeat_after_me #default [type="checkbox"]').should("not.be.checked");
    cy.get("#save-button").trigger("mouseover").click();
    cy.get("#save-button").should("not.be.disabled");
    // check was saved
    cy.get('#subjects #subject-background #select [type="checkbox"]').should("be.disabled");
    cy.get('#subjects #subject-background #select [type="checkbox"]').should("be.checked");
    cy.get('#subjects #subject-background #default [type="checkbox"]').should("not.be.disabled");
    cy.get('#subjects #subject-background #default [type="checkbox"]').should("not.be.checked");
    cy.get('#subjects #subject-repeat_after_me #select [type="checkbox"]').should("be.disabled");
    cy.get('#subjects #subject-repeat_after_me #select [type="checkbox"]').should("be.checked");
    cy.get('#subjects #subject-repeat_after_me #default [type="checkbox"]').should("not.be.disabled");
    cy.get('#subjects #subject-repeat_after_me #default [type="checkbox"]').should("not.be.checked");
    cy.get('#subjects #subject-leadership #select [type="checkbox"]').should("not.be.disabled");
    cy.get('#subjects #subject-leadership #select [type="checkbox"]').should("be.checked");
    cy.get('#subjects #subject-leadership #default [type="checkbox"]').should("be.checked");
  });

});
