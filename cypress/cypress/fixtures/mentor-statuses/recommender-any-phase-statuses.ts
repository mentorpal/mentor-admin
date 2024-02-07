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
import { status1 } from "../mentor";
export const startState: Mentor = {
  ...status1,
  answers: [],
  subjects: [],
  thumbnail: "",
};
export const hasGoal: Mentor = {
  ...startState,
  goal: "Hello, world",
};
export const hasKeywords: Mentor = {
  ...hasGoal,
  keywords: ["White"],
};

export const hasSubjects: Mentor = {
  ...hasKeywords,
  subjects: [
    {
      _id: "idle_and_initial_recordings",
      name: "Idle and Initial Recordings",
      type: SubjectTypes.UTTERANCES,
      isArchived: false,
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
          useDefaultTopics: UseDefaultTopics.DEFAULT,
        },
      ],
    },
  ],
};

export const hasIdle: Mentor = {
  ...hasSubjects,
  answers: [
    ...hasSubjects.answers,
    {
      _id: "A3_1_1",
      previousVersions: [],
      question: {
        _id: "A3_1_1",
        clientId: "C3_1_1",
        question:
          "Please look at the camera for 30 seconds without speaking. Try to remain in the same position.",
        type: QuestionType.UTTERANCE,
        name: UtteranceName.IDLE,
        paraphrases: [],
      },
      webMedia: { url: "video.mp4", tag: "intro", type: "video", vttText: "" },
      transcript: "",
      status: Status.COMPLETE,
    },
  ],
};

export const hasIntroNoTranscript: Mentor = {
  ...hasIdle,
  answers: [
    ...hasIdle.answers,
    {
      _id: "A4_1_1",
      previousVersions: [],
      question: {
        _id: "A4_1_1",
        clientId: "C4_1_1",
        question:
          "Please give a short introduction of yourself, which includes your name, current job, and title.",
        type: QuestionType.UTTERANCE,
        name: UtteranceName.INTRO,
        paraphrases: [],
      },
      webMedia: { url: "video.mp4", tag: "intro", type: "video", vttText: "" },
      transcript: "",
      status: Status.NONE,
    },
  ],
};

export const hasIntroAndNoOffTopicVideo: Mentor = {
  ...hasIntroNoTranscript,
  answers: [
    ...hasIntroNoTranscript.answers.map((a) => {
      const aCopy = JSON.parse(JSON.stringify(a));
      if (aCopy.question.name === UtteranceName.INTRO) {
        aCopy.transcript = "intro transcript";
        aCopy.status = Status.COMPLETE;
      }
      return aCopy;
    }),
    {
      _id: "A5_1_1",
      question: {
        _id: "A5_1_1",
        clientId: "C5_1_1",
        question:
          "Please repeat the following: 'I couldn't understand the question. Try asking me something else.'",
        type: QuestionType.UTTERANCE,
        name: UtteranceName.OFF_TOPIC,
        paraphrases: [],
      },
      transcript: "transcript",
      status: Status.INCOMPLETE,
    },
  ],
};

export const missingOffTopicTranscript: Mentor = {
  ...hasIntroAndNoOffTopicVideo,
  answers: hasIntroAndNoOffTopicVideo.answers.map((a) => {
    const aCopy = JSON.parse(JSON.stringify(a));
    if (aCopy.question.name === UtteranceName.OFF_TOPIC) {
      aCopy.webMedia = { url: "video.mp4", tag: "intro", type: "video" };
      aCopy.transcript = "";
    }
    return aCopy;
  }),
};

export const hasOffTopicComplete: Mentor = {
  ...missingOffTopicTranscript,
  answers: missingOffTopicTranscript.answers.map((a) => {
    const aCopy = JSON.parse(JSON.stringify(a));
    if (aCopy.question.name === UtteranceName.OFF_TOPIC) {
      aCopy.transcript = "off topic transcript";
      aCopy.webMedia = { url: "video.mp4", tag: "intro", type: "video" };
      aCopy.status = Status.COMPLETE;
    }
    return aCopy;
  }),
};

export const hasThumbnail: Mentor = {
  ...hasOffTopicComplete,
  thumbnail: "fake/thumbnail",
};
