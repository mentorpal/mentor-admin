/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { Mentor, QuestionType, Status } from "../../support/types";
import clint_prev from "./clint_setup9";

export const mentor: Mentor = {
  ...clint_prev,
  subjects: [
    ...clint_prev.subjects,
    {
      _id: "leadership",
      name: "Leadership",
      description: "These questions will ask about being in a leadership role.",
      isRequired: false,
      categories: [],
      topics: [],
      questions: [
        {
          question: {
            _id: "A7_1_1",
            question:
              "What's the hardest decision you've had to make as a leader?",
            type: QuestionType.QUESTION,
            name: null,
            paraphrases: [],
          },
          topics: [],
        },
      ],
    },
  ],
  answers: [
    ...clint_prev.answers,
    {
      _id: "A7_1_1",
      question: {
        _id: "A7_1_1",
        question: "What's the hardest decision you've had to make as a leader?",
        type: QuestionType.QUESTION,
        name: null,
        paraphrases: [],
      },
      transcript: "",
      status: Status.INCOMPLETE,
    },
  ],
};
export default mentor;
