/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  cyMockDefault,
  mockGQL,
  cyMockFollowUpQuestions,
} from "../support/functions";
import mentor from "../fixtures/mentor/clint_new";

describe("Mentor Record Queue", () => {
  it("Testing that the mocks work", () => {
    cyMockDefault(cy, {
      mentor,
      // This is where you tell cypress to intercept the GraphQL calls and provide it with what data to return with
      // The first param to mockGQL must be the exact name of the GQL query that it's going to intercept.
      //  The second param is the data that the interception should respond with
      gqlQueries: [
        // Ignore these 2 mocks
        mockGQL("ImportTask", { importTask: null }),
        mockGQL("FetchUploadTasks", [{ me: { uploadTasks: [] } }]),
        // This intercepts the FetchMentorRecordQueue query and responds with the data in the second param
        mockGQL("FetchMentorRecordQueue", {
          me: {
            mentorRecordQueue: [
              "question_id_1",
              "question_id_2",
              "question_id_3",
            ],
          },
        }),
        // This intercepts the AddQuestionToRecordQueue request and returns data as if there was a request to add question_id_4 to the list
        mockGQL("AddQuestionToRecordQueue", {
          me: {
            addQuestionToRecordQueue: [
              "question_id_1",
              "question_id_2",
              "question_id_3",
              "question_id_4",
            ],
          },
        }),
        // This intercepts the RemoveQuestionFromRecordQueue and returns data as if there was a request to remove question_id_2 from the list
        mockGQL("RemoveQuestionFromRecordQueue", {
          me: {
            removeQuestionFromRecordQueue: [
              "question_id_1",
              "question_id_3",
              "question_id_4",
            ],
          },
        }),
      ],
    });
    cy.visit("/");
    // start testing stuff here
  });
});