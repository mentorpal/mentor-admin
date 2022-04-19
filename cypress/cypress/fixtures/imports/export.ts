/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { SubjectTypes } from "../../support/types";

export default exportJson;
export const exportJson = {
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
            type: "QUESTION",
            name: null,
            paraphrases: [],
          },
          topics: [],
          category: {
            id: "category",
          },
        },
        {
          question: {
            _id: "A2_1_1",
            question: "How old are you now?",
            type: "QUESTION",
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
      isRequired: true,
      description: "These are miscellaneous phrases you'll be asked to repeat.",
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
            type: "UTTERANCE",
            name: "_IDLE_",
            paraphrases: [],
            mentorType: "VIDEO",
            minVideoLength: 10,
          },
          topics: [],
        },
        {
          question: {
            _id: "A4_1_1",
            question:
              "Please give a short introduction of yourself, which includes your name, current job, and title.",
            type: "UTTERANCE",
            name: "_INTRO_",
            paraphrases: [],
          },
          topics: [],
        },
        {
          question: {
            _id: "A5_1_1",
            question:
              "Please repeat the following: 'I couldn't understand the question. Try asking me something else.'",
            type: "UTTERANCE",
            name: "_OFF_TOPIC_",
            paraphrases: [],
          },
          topics: [],
          category: {
            id: "category2",
          },
        },
      ],
    },
  ],
  questions: [
    {
      _id: "A1_1_1",
      question: "Who are you and what do you do?",
      type: "QUESTION",
      name: null,
      paraphrases: [],
    },
    {
      _id: "A2_1_1",
      question: "How old are you now?",
      type: "QUESTION",
      name: null,
      paraphrases: [],
    },
    {
      _id: "A3_1_1",
      question:
        "Please look at the camera for 30 seconds without speaking. Try to remain in the same position.",
      type: "UTTERANCE",
      name: "_IDLE_",
      paraphrases: [],
      mentorType: "VIDEO",
      minVideoLength: 10,
    },
    {
      _id: "A4_1_1",
      question:
        "Please give a short introduction of yourself, which includes your name, current job, and title.",
      type: "UTTERANCE",
      name: "_INTRO_",
      paraphrases: [],
    },
    {
      _id: "A5_1_1",
      question:
        "Please repeat the following: 'I couldn't understand the question. Try asking me something else.'",
      type: "UTTERANCE",
      name: "_OFF_TOPIC_",
      paraphrases: [],
    },
  ],
  answers: [
    {
      _id: "A1_1_1",
      question: {
        _id: "A1_1_1",
        question: "Who are you and what do you do?",
      },
      transcript:
        "My name is Clint Anderson and I'm a Nuclear Electrician's Mate",
      status: "COMPLETE",
    },
    {
      _id: "A2_1_1",
      question: {
        _id: "A2_1_1",
        question: "How old are you now?",
      },
      transcript: "I'm 37 years old",
      status: "COMPLETE",
    },
    {
      _id: "A3_1_1",
      question: {
        _id: "A3_1_1",
        question:
          "Please look at the camera for 30 seconds without speaking. Try to remain in the same position.",
      },
      media: [
        {
          url: "video.mp4",
          tag: "idle",
          type: "video",
        },
      ],
      transcript: "",
      status: "COMPLETE",
    },
    {
      _id: "A4_1_1",
      question: {
        _id: "A4_1_1",
        question:
          "Please give a short introduction of yourself, which includes your name, current job, and title.",
      },
      transcript: "My name is Clint Anderson I'm a Nuclear Electrician's Mate",
      status: "COMPLETE",
    },
    {
      _id: "A5_1_1",
      question: {
        _id: "A5_1_1",
        question:
          "Please repeat the following: 'I couldn't understand the question. Try asking me something else.'",
      },
      transcript: "",
      status: "INCOMPLETE",
    },
  ],
};
