import { cySetup, cyInterceptGraphQL, cyMockLogin, cyMockGQL } from "../support/functions";
import login from "../fixtures/login";

describe("Select Subjects", () => {
  it("redirects to login page if the user is not logged in", () => {
    cySetup(cy);
    cy.visit("/subjects");
    cy.location("pathname").should("contain", "/login");
  });
});
