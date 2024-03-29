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
  UseDefaultTopics,
  UtteranceName,
} from "../../support/types";

export const mentor: Mentor = {
  _id: "clintanderson",
  thumbnail: "https://new.url/test.png",
  name: "Clinton Anderson",
  firstName: "Clint",
  title: "Nuclear Electrician's Mate",
  mentorType: MentorType.VIDEO,
  lastTrainedAt: "Today",
  isDirty: false,
  email: "clint@anderson.com",
  questions: [],
  keywords: [],
  subjects: [
    {
      isArchived: false,
      _id: "background",
      name: "Background",
      type: SubjectTypes.SUBJECT,
      isRequired: true,
      description:
        "These questions will ask general questions about your background that might be relevant to how people understand your career.",
      categories: [
        {
          id: "category",
          name: "Category",
          description: "A category",
          defaultTopics: [],
        },
      ],
      topics: [],
      questions: [
        {
          question: {
            _id: "A1_1_1",
            clientId: "C1_1_1",
            question: "Who are you and what do you do?",
            type: QuestionType.QUESTION,
            name: null,
            paraphrases: [],
          },
          topics: [],
          category: {
            id: "category",
            name: "Category",
            description: "A category",
            defaultTopics: [],
          },
          useDefaultTopics: UseDefaultTopics.DEFAULT,
        },
        {
          question: {
            _id: "A2_1_1",
            clientId: "C2_1_1",
            question: "How old are you now?",
            type: QuestionType.QUESTION,
            name: null,
            paraphrases: [],
          },
          topics: [],
          useDefaultTopics: UseDefaultTopics.DEFAULT,
        },
      ],
    },
    {
      isArchived: false,
      _id: "idle_and_initial_recordings",
      name: "Idle and Initial Recordings",
      type: SubjectTypes.UTTERANCES,
      isRequired: true,
      description: "These are miscellaneous phrases you'll be asked to repeat.",
      categories: [
        {
          id: "category2",
          name: "Category2",
          description: "Another category",
          defaultTopics: [],
        },
      ],
      topics: [],
      questions: [
        {
          question: {
            _id: "A3_1_1",
            clientId: "C3_1_1",
            question:
              "Please look at the camera for 30 seconds without speaking. Try to remain in the same position.",
            type: QuestionType.UTTERANCE,
            name: UtteranceName.IDLE,
            paraphrases: [],
            mentorType: MentorType.VIDEO,
            minVideoLength: 10,
          },
          topics: [],
          useDefaultTopics: UseDefaultTopics.DEFAULT,
        },
        {
          question: {
            _id: "A4_1_1",
            clientId: "C4_1_1",
            question:
              "Please give a short introduction of yourself, which includes your name, current job, and title.",
            type: QuestionType.UTTERANCE,
            name: UtteranceName.INTRO,
            paraphrases: [],
          },
          topics: [],
          useDefaultTopics: UseDefaultTopics.DEFAULT,
        },
        {
          question: {
            _id: "A5_1_1",
            clientId: "C5_1_1",
            question:
              "Please repeat the following: 'I couldn't understand the question. Try asking me something else.'",
            type: QuestionType.UTTERANCE,
            name: UtteranceName.OFF_TOPIC,
            paraphrases: [],
          },
          topics: [],
          category: {
            id: "category2",
            name: "Category2",
            defaultTopics: [],
            description: "Another category",
          },
          useDefaultTopics: UseDefaultTopics.DEFAULT,
        },
        {
          question: {
            _id: "A8_1_1",
            clientId: "C8_1_1",
            question: "test",
            type: QuestionType.UTTERANCE,
            name: UtteranceName.OFF_TOPIC,
            paraphrases: [],
            mentor: "clintanderson",
          },
          topics: [],
          category: {
            id: "category2",
            defaultTopics: [],
            name: "Category2",
            description: "Another category",
          },
          useDefaultTopics: UseDefaultTopics.DEFAULT,
        },
      ],
    },
  ],
  topics: [],
  answers: [
    {
      previousVersions: [],
      _id: "A1_1_1",
      question: {
        _id: "A1_1_1",
        clientId: "C_A1_1_1",
        question: "Who are you and what do you do?",
        type: QuestionType.QUESTION,
        name: null,
        paraphrases: [],
      },
      transcript:
        "My name is Clint Anderson and I'm a Nuclear Electrician's Mate",
      status: Status.COMPLETE,
    },
    {
      _id: "A2_1_1",
      previousVersions: [],
      question: {
        _id: "A2_1_1",
        clientId: "C_A2_1_1",
        question: "How old are you now?",
        type: QuestionType.QUESTION,
        name: null,
        paraphrases: [],
      },
      transcript: "I'm 37 years old",
      status: Status.COMPLETE,
    },
    {
      _id: "A3_1_1",
      previousVersions: [],
      question: {
        _id: "A3_1_1",
        clientId: "C_A3_1_1",
        question:
          "Please look at the camera for 30 seconds without speaking. Try to remain in the same position.",
        type: QuestionType.UTTERANCE,
        name: UtteranceName.IDLE,
        paraphrases: [],
      },
      media: [{ url: "video.mp4", tag: "idle", type: "video", vttText: "" }],
      transcript: "",
      status: Status.COMPLETE,
    },
    {
      _id: "A4_1_1",
      previousVersions: [],
      question: {
        _id: "A4_1_1",
        clientId: "C_A4_1_1",
        question:
          "Please give a short introduction of yourself, which includes your name, current job, and title.",
        type: QuestionType.UTTERANCE,
        name: UtteranceName.INTRO,
        paraphrases: [],
      },
      transcript: "My name is Clint Anderson I'm a Nuclear Electrician's Mate",
      status: Status.COMPLETE,
    },
    {
      _id: "A5_1_1",
      previousVersions: [],
      question: {
        _id: "A5_1_1",
        clientId: "C_A5_1_1",
        question:
          "Please repeat the following: 'I couldn't understand the question. Try asking me something else.'",
        type: QuestionType.UTTERANCE,
        name: UtteranceName.OFF_TOPIC,
        paraphrases: [],
      },
      transcript: "",
      status: Status.INCOMPLETE,
    },
    {
      _id: "A8_1_1",
      previousVersions: [],
      question: {
        _id: "A8_1_1",
        clientId: "C_A8_1_1",
        question: "test",
        type: QuestionType.UTTERANCE,
        name: UtteranceName.OFF_TOPIC,
        paraphrases: [],
        mentor: "clintanderson",
      },
      transcript: "",
      status: Status.INCOMPLETE,
    },
  ],
  orphanedCompleteAnswers: [],
};
export default mentor;
