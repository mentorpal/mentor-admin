/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { Subject } from "../../support/types";

export const subject: Partial<Subject> = {
  _id: "background",
  name: "Background",
  description:
    "These questions will ask general questions about your background that might be relevant to how people understand your career.",
  isRequired: true,
  categories: [],
  topics: [],
  questions: [
    {
      question: {
        _id: "A1_1_1",
        question: "Who are you and what do you do?",
        type: null,
        name: null,
        paraphrases: [],
      },
      topics: [],
    },
    {
      question: {
        _id: "A2_1_1",
        question: "How old are you now?",
        type: null,
        name: null,
        paraphrases: [],
      },
      topics: [],
    },
  ],
};
export default subject;
