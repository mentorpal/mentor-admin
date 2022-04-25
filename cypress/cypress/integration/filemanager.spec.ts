/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  cyMockDefault,
  cyMockDeleteMountedFile,
  cyMockMountedFilesStatus,
  mockGQL,
} from "../support/functions";
import newMentor from "../fixtures/mentor/clint_new";
import clint from "../fixtures/mentor/clint_setup11";
import { login as loginDefault } from "../fixtures/login";
import { UserRole } from "../support/types";
import { fileStatusOnServer } from "../fixtures/files_on_server";
import { mentors } from "../fixtures/basicMentorInfo";
import questions from "../fixtures/questions";

describe("file manager page", () => {
  it("displays mentor name and question text where available", () => {
    cyMockDefault(cy, {
      mentor: [newMentor],
      login: {
        ...loginDefault,
        user: { ...loginDefault.user, userRole: UserRole.ADMIN },
      },
      gqlQueries: [
        mockGQL("Mentors", { mentors }),
        mockGQL("Questions", { questions: questions }),
      ],
    });
    cyMockMountedFilesStatus(cy, { mountedFilesStatus: fileStatusOnServer });
    cyMockDeleteMountedFile(cy, { fileRemoved: true });
    cy.visit("/filemanager");
    cy.get("[data-cy=files-list]").should("exist");
    cy.get("[data-cy=file-list-item-1]").within(($within) => {
      cy.get("[data-cy=file-list-item-mentor]").should(
        "have.text",
        "Clint Anderson"
      );
      cy.get("[data-cy=file-list-item-question]").should(
        "have.text",
        "Who are you and what do you do?"
      );
    });
  });

  it("displays raw file name where question text not available", () => {
    cyMockDefault(cy, {
      mentor: [newMentor],
      login: {
        ...loginDefault,
        user: { ...loginDefault.user, userRole: UserRole.ADMIN },
      },
      gqlQueries: [
        mockGQL("Mentors", { mentors }),
        mockGQL("Questions", { questions: questions }),
      ],
    });
    cyMockMountedFilesStatus(cy, { mountedFilesStatus: fileStatusOnServer });
    cyMockDeleteMountedFile(cy, { fileRemoved: true });
    cy.visit("/filemanager");
    cy.get("[data-cy=files-list]").should("exist");
    cy.get("[data-cy=file-list-item-0]").within(($within) => {
      cy.get("[data-cy=file-list-item-question]").should(
        "have.text",
        "f5c5aaf8-aaf8-4fe0-84c4-da3a1c5f9305-6184d14c068d43dc6822a721-60c7b69407dd702a7c3c5963.mp4"
      );
    });
  });

  it("deleting a file removes it from the list", () => {
    cyMockDefault(cy, {
      mentor: [newMentor],
      login: {
        ...loginDefault,
        user: { ...loginDefault.user, userRole: UserRole.ADMIN },
      },
      gqlQueries: [
        mockGQL("Mentors", { mentors }),
        mockGQL("Questions", { questions: questions }),
      ],
    });
    cyMockMountedFilesStatus(cy, { mountedFilesStatus: fileStatusOnServer });
    cyMockDeleteMountedFile(cy, { fileRemoved: true });
    cy.visit("/filemanager");
    cy.get("[data-cy=files-list]").should("exist");
    cy.get("[data-cy=file-list-item-0]").within(($within) => {
      cy.get("[data-cy=delete-file]").invoke("mouseover").click();
    });
    cy.get("[data-cy=warn-file-deletion-dialog]").within(($within) => {
      cy.get("[data-cy=warn-yes]").invoke("mouseover").click();
    });
    cy.get("[data-cy=file-list-item-4]").should("not.exist");
  });

  it("cannot view filemanager page if not an admin or content manager", () => {
    cyMockDefault(cy, {
      mentor: clint,
      login: {
        ...loginDefault,
        user: { ...loginDefault.user, userRole: UserRole.USER },
      },
    });
    cy.visit("/filemanager");
    cyMockMountedFilesStatus(cy, { mountedFilesStatus: fileStatusOnServer });
    cyMockDeleteMountedFile(cy, { fileRemoved: true });
    cy.get("[data-cy=my-mentor-card]").should("exist");
  });

  it("cannot delete file its respective question is currently being uploaded", () => {
    cyMockDefault(cy, {
      mentor: [newMentor],
      login: {
        ...loginDefault,
        user: { ...loginDefault.user, userRole: UserRole.ADMIN },
      },
      gqlQueries: [
        mockGQL("Mentors", { mentors }),
        mockGQL("Questions", { questions: questions }),
        mockGQL("FetchUploadTasks", [
          {
            me: {
              uploadTasks: [
                {
                  question: {
                    _id: "A1_1_1",
                    question: "Tell me about yourself",
                  },
                  trimUploadTask: {
                    task_name: "trim_upload",
                    status: "IN_PROGRESS",
                  },
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
    cyMockMountedFilesStatus(cy, { mountedFilesStatus: fileStatusOnServer });
    cyMockDeleteMountedFile(cy, { fileRemoved: true });
    cy.visit("/filemanager");
    cy.get("[data-cy=file-list-item-1]").within(($within) => {
      cy.get("[data-cy=delete-file]").invoke("mouseover").click();
    });
    cy.get("[data-cy=error-dialog]").should("exist");
    cy.get("[data-cy=error-dialog-title]").should(
      "have.text",
      "Unable to delete file"
    );
  });

  it("warns user when trying to delete unchecked file", () => {
    cyMockDefault(cy, {
      mentor: [newMentor],
      login: {
        ...loginDefault,
        user: { ...loginDefault.user, userRole: UserRole.ADMIN },
      },
      gqlQueries: [
        mockGQL("Mentors", { mentors }),
        mockGQL("Questions", { questions: questions }),
      ],
    });
    cyMockMountedFilesStatus(cy, { mountedFilesStatus: fileStatusOnServer });
    cyMockDeleteMountedFile(cy, { fileRemoved: true });
    cy.visit("/filemanager");
    cy.get("[data-cy=file-list-item-0]").within(($within) => {
      cy.get("[data-cy=delete-file]").invoke("mouseover").click();
    });
    cy.get("[data-cy=warn-file-deletion-dialog]").should("exist");
  });
});
