/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
export const importPreview = {
  subjects: [
    {
      editType: "NONE",
      importData: {
        _id: "repeat_after_me",
        name: "Repeat After Me",
        description:
          "These are miscellaneous phrases you'll be asked to repeat.",
        categories: [
          {
            id: "c",
            name: "Category",
            description: "A category",
          },
          {
            id: "nc",
            name: "New Category",
            description: "A new category added to the subject",
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
      curData: {
        _id: "repeat_after_me",
        name: "Repeat After Me",
        description:
          "These are miscellaneous phrases you'll be asked to repeat.",
        categories: [
          {
            id: "c",
            name: "Category",
            description: "A category",
          },
          {
            id: "oc",
            name: "Old Category",
            description:
              "A category that is on the current subject but not in the imported one",
          },
        ],
        topics: [
          {
            id: "t",
            name: "Topic",
            description: "A topic",
          },
          {
            id: "ot",
            name: "Old Topic",
            description:
              "A topic that is on the current subject but not in the imported one",
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
              question: "Question 2",
            },
          },
          {
            question: {
              _id: "q3",
              question: "Question 3",
            },
          },
        ],
      },
    },
    {
      editType: "CREATED",
      importData: {
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
      curData: null,
    },
    {
      editType: "ADDED",
      importData: {
        _id: "leadership",
        name: "Leadership",
        description:
          "These questions will ask about being in a leadership role.",
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
      curData: {
        importData: {
          _id: "leadership",
          name: "Leadership",
          description:
            "These questions will ask about being in a leadership role.",
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
      },
    },
    {
      editType: "REMOVED",
      importData: null,
      curData: {
        _id: "background",
        name: "Background",
        description:
          "These questions will ask general questions about your background that might be relevant to how people understand your career.",
        categories: [
          {
            id: "c",
            name: "Category",
            description: "A category",
          },
        ],
        topics: [],
        questions: [
          {
            question: {
              _id: "q1",
              question: "Question 1",
            },
          },
          {
            question: {
              _id: "q5",
              question: "Removed Question 5",
            },
          },
        ],
      },
    },
  ],
  questions: [
    {
      editType: "NONE",
      importData: {
        _id: "q1",
        question: "Question 1",
      },
      curData: {
        _id: "q1",
        question: "Question 1",
      },
    },
    {
      editType: "NONE",
      importData: {
        _id: "q2",
        question: "Edited Question 2",
      },
      curData: {
        _id: "q2",
        question: "Question 2",
      },
    },
    {
      editType: "NONE",
      importData: {
        _id: "q3",
        question: "Question 3",
      },
      curData: {
        _id: "q3",
        question: "Question 3",
      },
    },
    {
      editType: "CREATED",
      importData: {
        _id: "qn",
        question: "A new question being created",
      },
      curData: null,
    },
    {
      editType: "ADDED",
      importData: {
        _id: "q4",
        question: "Added Question 4",
      },
      curData: {
        _id: "q4",
        question: "Added Question 4",
      },
    },
    {
      editType: "REMOVED",
      importData: null,
      curData: {
        _id: "q5",
        question: "Removed Question 5",
      },
    },
  ],
  answers: [
    {
      editType: "NONE",
      importData: {
        transcript: "Answer 1",
        status: "COMPLETE",
        question: {
          _id: "q1",
          question: "Question 1",
        },
      },
      curData: {
        transcript: "Answer 1",
        status: "COMPLETE",
        question: {
          _id: "q1",
          question: "Question 1",
        },
      },
    },
    {
      editType: "NONE",
      importData: {
        transcript: "Edited Answer 2",
        status: "COMPLETE",
        question: {
          _id: "q2",
          question: "Edited Question 2",
        },
      },
      curData: {
        transcript: "Answer 2",
        status: "COMPLETE",
        question: {
          _id: "q2",
          question: "Question 2",
        },
      },
    },
    {
      editType: "CREATED",
      importData: {
        transcript: "A new answer",
        status: "COMPLETE",
        question: {
          _id: "qn",
          question: "A new question being created",
        },
      },
      curData: null,
    },
    {
      editType: "REMOVED",
      importData: null,
      curData: {
        transcript: "Removed Answer 5",
        status: "COMPLETE",
        question: {
          _id: "q5",
          question: "Removed Question 5",
        },
      },
    },
  ],
};
export default importPreview;
