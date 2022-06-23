/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  Mentor,
  MentorType,
  QuestionType,
  Status,
  SubjectTypes,
  UtteranceName,
} from "../../support/types";

export const mentor: Mentor = {
  _id: "clintanderson",
  name: "Clint Anderson",
  firstName: "",
  title: "The Original Clint",
  mentorType: MentorType.VIDEO,
  lastTrainedAt: null,
  questions: [
    {
      question: {
        _id: "A6_1_1",
        question: "Complete",
        type: QuestionType.QUESTION,
        name: null,
        paraphrases: [],
      },
      topics: [],
      category: null,
    },
  ],
  subjects: [
    {
      _id: "background",
      name: "Background",
      description:
        "These questions will ask general questions about your background that might be relevant to how people understand your career.",
      categories: [
        {
          id: "category",
          name: "Category",
          description: "A category",
        },
      ],
      topics: [],
      questions: [
        {
          question: {
            _id: "A1_1_1",
            question: "Who are you and what do you do?",
            type: QuestionType.QUESTION,
            name: null,
            paraphrases: [],
          },
          topics: [],
          category: { id: "category" },
        },
        {
          question: {
            _id: "A2_1_1",
            question: "How old are you now?",
            type: QuestionType.QUESTION,
            name: null,
            paraphrases: [],
          },
          topics: [],
        },
      ],
    },
    {
      _id: "repeat_after_me",
      name: "Repeat After Me",
      type: SubjectTypes.UTTERANCES,
      description: "These are miscellaneous phrases you'll be asked to repeat.",
      isRequired: true,
      categories: [
        {
          id: "category2",
          name: "Category2",
          description: "Another category",
        },
      ],
      topics: [],
      questions: [
        {
          question: {
            _id: "A3_1_1",
            question:
              "Please look at the camera for 30 seconds without speaking. Try to remain in the same position.",
            type: QuestionType.UTTERANCE,
            name: UtteranceName.IDLE,
            paraphrases: [],
            mentorType: MentorType.VIDEO,
            minVideoLength: 10,
          },
          topics: [],
        },
        {
          question: {
            _id: "A4_1_1",
            question:
              "Please give a short introduction of yourself, which includes your name, current job, and title.",
            type: QuestionType.UTTERANCE,
            name: UtteranceName.INTRO,
            paraphrases: [],
          },
          topics: [],
        },
        {
          question: {
            _id: "A5_1_1",
            question:
              "Please repeat the following: 'I couldn't understand the question. Try asking me something else.'",
            type: QuestionType.UTTERANCE,
            name: UtteranceName.OFF_TOPIC,
            paraphrases: [],
          },
          topics: [],
          category: { id: "category2" },
        },
      ],
    },
  ],
  topics: [],
  answers: [
    {
      _id: "A1_1_1",
      question: {
        _id: "A1_1_1",
        question: "Who are you and what do you do?",
        type: QuestionType.QUESTION,
        name: null,
        paraphrases: [],
      },
      transcript:
        "My _name_ is **Clint Anderson** and I'm a ++Nuclear Electrician's Mate++",
      status: Status.INCOMPLETE,
    },
    {
      _id: "A2_1_1",
      question: {
        _id: "A2_1_1",
        question: "How old are you now?",
        type: QuestionType.QUESTION,
        name: null,
        paraphrases: [],
      },
      transcript:
        "I'm [37](https://en.wikipedia.org/wiki/37_%28number%29) years old",
      status: Status.INCOMPLETE,
    },
    {
      _id: "A3_1_1",
      question: {
        _id: "A3_1_1",
        question:
          "Please look at the camera for 30 seconds without speaking. Try to remain in the same position.",
        type: QuestionType.UTTERANCE,
        name: UtteranceName.IDLE,
        paraphrases: [],
        mentorType: MentorType.VIDEO,
        minVideoLength: 10,
      },
      transcript: "",
      status: Status.INCOMPLETE,
    },
    {
      _id: "A4_1_1",
      question: {
        _id: "A4_1_1",
        question:
          "Please give a short introduction of yourself, which includes your name, current job, and title.",
        type: QuestionType.UTTERANCE,
        name: UtteranceName.INTRO,
        paraphrases: [],
      },
      transcript:
        "- My name is Clint Anderson. I work for the Navy as a Nuclear Electrician's Mate \
        ![](https://www.cool.osd.mil/usn/images/sideImage1_em_150324-N-WO404-020.png)",
      status: Status.INCOMPLETE,
    },
    {
      _id: "A5_1_1",
      question: {
        _id: "A5_1_1",
        question:
          "Please repeat the following: 'I couldn't understand the question. Try asking me something else.'",
        type: QuestionType.UTTERANCE,
        name: UtteranceName.OFF_TOPIC,
        paraphrases: [],
      },
      transcript:
        "1. I couldn't understand the [question](https://www.merriam-webster.com/dictionary/question). \
        Try asking **me** something else.",
      status: Status.INCOMPLETE,
    },
    {
      _id: "A6_1_1",
      question: {
        _id: "A6_1_1",
        question: "Complete answer",
        type: QuestionType.QUESTION,
        name: null,
        paraphrases: [],
      },
      transcript: "Complete answer",
      status: Status.COMPLETE,
    },
  ],
};
export default mentor;
