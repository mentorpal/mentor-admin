/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
export default importJson;
export const importJson = {
  subjects: [
    {
      _id: "idle_and_initial_recordings",
      name: "Idle and Initial Recordings",
      description: "These are miscellaneous phrases you'll be asked to repeat.",
      categories: [
        {
          id: "c",
          name: "Category",
          description: "A category",
          defaultTopics: [],
        },
        {
          id: "nc",
          name: "New Category",
          description: "A new category added to the subject",
          defaultTopics: [],
        },
      ],
      topics: [
        {
          id: "t",
          name: "Topic",
          description: "A topic",
        },
        {
          id: "nt",
          name: "New Topic",
          description: "A new topic added to the subject",
        },
      ],
      questions: [
        {
          question: {
            _id: "q1",
            question: "Question 1",
          },
        },
        {
          question: {
            _id: "q2",
            question: "Edited Question 2",
          },
        },
        {
          question: {
            _id: "qn",
            question: "A new question being created",
          },
        },
      ],
    },
    {
      _id: "new_subject",
      name: "New subject",
      description: "A new subject",
      categories: [],
      questions: [
        {
          question: {
            _id: "q4",
            question: "Added Question 4",
          },
        },
      ],
    },
    {
      _id: "leadership",
      name: "Leadership",
      description: "These questions will ask about being in a leadership role.",
      categories: [],
      topics: [],
      questions: [
        {
          question: {
            _id: "q4",
            question: "Added Question 4",
          },
        },
      ],
    },
  ],
  questions: [
    {
      _id: "q1",
      question: "Question 1",
    },
    {
      _id: "q2",
      question: "Edited Question 2",
    },
    {
      _id: "q3",
      question: "Question 3",
    },
    {
      _id: "qn",
      question: "A new question being created",
    },
    {
      _id: "q4",
      question: "Added Question 4",
    },
  ],
  answers: [
    {
      transcript: "Answer 1",
      status: "COMPLETE",
      question: {
        _id: "q1",
        question: "Question 1",
      },
    },
    {
      transcript: "Edited Answer 2",
      status: "COMPLETE",
      question: {
        _id: "q2",
        question: "Edited Question 2",
      },
    },
    {
      transcript: "A new answer",
      status: "COMPLETE",
      question: {
        _id: "qn",
        question: "A new question being created",
      },
    },
  ],
};
