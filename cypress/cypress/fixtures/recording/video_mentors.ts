/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  completeMentor,
  completeQuestion,
  completeSubject,
  completeSubjectQuestion,
} from "../../support/helpers";
import {
  MediaType,
  Mentor,
  MentorConfig,
  MentorType,
  QuestionType,
  Status,
} from "../../support/types";

export const videoMentor: Mentor = completeMentor({
  _id: "clintanderson",
  mentorType: MentorType.VIDEO,
  lastTrainedAt: null,
  keywords: [],
  answers: [
    {
      _id: "A1_1_1",
      previousVersions: [],
      question: {
        _id: "A1_1_1",
        clientId: "C1_1_1",
        name: "A1_1_1",
        type: QuestionType.QUESTION,
        paraphrases: [],
        question: "Who are you and what do you do?",
      },
      transcript: "",
      markdownTranscript: "",
      status: Status.INCOMPLETE,
    },
    {
      _id: "A2_1_1",
      previousVersions: [],
      question: {
        _id: "A2_1_1",
        clientId: "C2_1_1",
        name: "A2_1_1",
        type: QuestionType.QUESTION,
        paraphrases: [],
        question: "How old are you now?",
      },
      transcript: "I'm 37 years old",
      media: [
        {
          type: MediaType.VIDEO,
          tag: "web",
          url: "A2_1_1.mp4",
          vttText: "",
        },
      ],
      status: Status.COMPLETE,
    },
    {
      _id: "A3_1_1",
      previousVersions: [],
      question: {
        _id: "A3_1_1",
        clientId: "C3_1_1",
        name: "A3_1_1",
        type: QuestionType.UTTERANCE,
        paraphrases: [],
        question: "Where do you live?",
      },
      transcript: "In Howard City, Michigan",
      media: [
        {
          type: MediaType.VIDEO,
          tag: "web",
          url: "A3_1_1.mp4",
          vttText: "",
        },
      ],
      status: Status.COMPLETE,
    },
    {
      _id: "A4_1_1",
      previousVersions: [],
      question: {
        _id: "A4_1_1",
        clientId: "C4_1_1",
        name: "A4_1_1",
        type: QuestionType.UTTERANCE,
        paraphrases: [],
        question: "How old are you now?",
      },
      transcript: "",
      media: [
        {
          type: MediaType.VIDEO,
          tag: "web",
          url: "A4_1_1.mp4",
          vttText: "",
        },
      ],
      status: Status.COMPLETE,
    },
  ],
  subjects: [
    completeSubject({
      _id: "subject_1",
      name: "Subject 1",
      questions: [
        completeSubjectQuestion({
          question: {
            _id: "A1_1_1",
            clientId: "C1_1_1",
            question: "Question 1",
            name: null,
            type: QuestionType.QUESTION,
            paraphrases: [],
          },
          category: {
            id: "cat",
            name: "cat",
            description: "cat",
            defaultTopics: [],
          },
        }),
        completeSubjectQuestion({
          question: {
            _id: "A2_1_1",
            clientId: "C2_1_1",
            question: "Question 2",
            name: null,
            type: QuestionType.QUESTION,
            paraphrases: [],
          },
          category: {
            id: "cat",
            name: "cat",
            description: "cat",
            defaultTopics: [],
          },
        }),
      ],
      categories: [
        { id: "cat", name: "cat", description: "cat", defaultTopics: [] },
      ],
    }),
    completeSubject({
      _id: "subject_2",
      name: "Subject 2",
      questions: [
        completeSubjectQuestion({
          question: {
            _id: "A3_1_1",
            clientId: "C3_1_1",
            question: "Question 3",
            name: null,
            type: QuestionType.UTTERANCE,
            paraphrases: [],
          },
        }),
        completeSubjectQuestion({
          question: {
            _id: "A4_1_1",
            clientId: "C4_1_1",
            question: "Question 4",
            name: null,
            type: QuestionType.UTTERANCE,
            paraphrases: [],
          },
        }),
      ],
    }),
  ],
});
export const videoQuestions = [
  completeQuestion({
    _id: "A1_1_1",
    question: "Who are you and what do you do?",
  }),
  completeQuestion({
    _id: "A2_1_1",
    question: "How old are you now?",
    mentor: "clintanderson",
  }),
  completeQuestion({
    _id: "A3_1_1",
    question: "Where do you live?",
    mentor: "clintanderson",
  }),
  completeQuestion({
    _id: "A4_1_1",
    question: "Record an idle video",
    mentor: "clintanderson",
    name: "_IDLE_",
  }),
];

export const mentorConfig: MentorConfig = {
  configId: "testconfigid",
  subjects: ["fakesubject"],
  publiclyVisible: true,
  mentorType: MentorType.VIDEO,
  idleRecordingDuration: 10,
  introRecordingText: "",
  orgPermissions: [],
  loginHeaderText: "test login header text",
  welcomeSlideHeader: "test welcome slide header text",
  welcomeSlideText: "test welcome slide body text",
  disableMyGoalSlide: true,
  disableFollowups: true,
  lockedToSubjects: false,
};
export const videoMentorWithConfig: Mentor = {
  ...videoMentor,
  mentorConfig,
};
