/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { navigate } from "gatsby";
import { isAnswerComplete, launchMentor, urlBuild } from "helpers";
import { useEffect, useState } from "react";
import { Mentor, SetupScreen, UtteranceName } from "types";
import {
  Phase,
  ProductionRule,
  Recommendation,
  Recommender,
} from "../recommender/recommender";
import {
  MentorUtteranceVideos,
  useWithMentorRecommenderData,
} from "./use-with-mentor-recommender-data";

type AttributeNames = "functionalMentor" | "questionCover" | "responseQuality";
type AttributeWeightRecord = Record<AttributeNames, number>;

export interface RecommenderState {
  mentorData: Mentor;
  mentorUtteranceVideos: MentorUtteranceVideos;
  numberOfTrendingAnswers: number;
}

export interface UseWithMentorRecommender {
  recommender?: Recommender<RecommenderState, RecommendationName>;
}

export enum RecommendationName {
  NONE = "NONE",
  ADD_NAME_OR_JOB = "ADD_NAME_OR_JOB",
  ADD_GOAL = "ADD_GOAL",
  ADD_KEYWORDS = "ADD_KEYWORDS",
  ADD_SUBJECT = "ADD_SUBJECT",
  RECORD_IDLE = "RECORD_IDLE",
  RECORD_INTRO = "RECORD_INTRO",
  RECORD_OFF_TOPIC = "RECORD_OFF_TOPIC",
  ADD_THUMBNAIL = "ADD_THUMBNAIL",
  RECORD_MORE_QUESTIONS = "RECORD_MORE_QUESTIONS",
  BUILD_MENTOR = "BUILD_MENTOR",
  PREVIEW_MENTOR = "PREVIEW_MENTOR",
  ANSWER_TRENDING = "ANSWER_TRENDING",
}

export function useWithMentorRecommender(
  trainMentor?: () => void
): UseWithMentorRecommender {
  const { mentorData, mentorUtteranceVideos, numberOfTrendingAnswers } =
    useWithMentorRecommenderData();
  const [recommender, setRecommender] =
    useState<Recommender<RecommenderState, RecommendationName>>();

  useEffect(() => {
    if (
      !mentorData ||
      !mentorUtteranceVideos ||
      numberOfTrendingAnswers == undefined
    ) {
      return;
    }
    setRecommender(
      new Recommender<RecommenderState, RecommendationName>(
        { mentorData, mentorUtteranceVideos, numberOfTrendingAnswers },
        [
          createAnyPhase(),
          createIncompletePhase(),
          createScriptedPhase(),
          createInteractivePhase(),
          createSpecialistPhase(),
          createConversationalPhase(),
          createFullSubjectPhase(),
          createLifeStoryPhase(),
        ]
      )
    );
  }, [mentorData, mentorUtteranceVideos, numberOfTrendingAnswers]);

  /**
   * A phase that contains rules that MUST all be met before going on to any other phase.
   * If we are at a later stage and one of these rules become true, revert back to this phase.
   */
  function createAnyPhase() {
    const phaseAttributeWeights: AttributeWeightRecord = {
      functionalMentor: 1,
      questionCover: 1,
      responseQuality: 1,
    };

    const nameOrJobTitleMissing = (state: RecommenderState) => {
      return !state.mentorData.title || !state.mentorData.name;
    };
    const goalMissing = (state: RecommenderState) => {
      return (
        !state.mentorData.goal &&
        !state.mentorData.mentorConfig?.disableMyGoalSlide
      );
    };
    const keywordsMissing = (state: RecommenderState) => {
      return (
        !state.mentorData.keywords.length &&
        !state.mentorData.mentorConfig?.disableKeywordsRecommendation
      );
    };
    const noSubject = (state: RecommenderState) => {
      return !state.mentorData.subjects.length;
    };
    const idleVideoIncomplete = (state: RecommenderState) => {
      return (
        !state.mentorUtteranceVideos.idle ||
        !isAnswerComplete(
          state.mentorUtteranceVideos.idle,
          UtteranceName.IDLE,
          state.mentorData.mentorType
        )
      );
    };
    const introVideoIncomplete = (state: RecommenderState) => {
      return (
        !state.mentorUtteranceVideos.intro ||
        !isAnswerComplete(
          state.mentorUtteranceVideos.intro,
          UtteranceName.INTRO,
          state.mentorData.mentorType
        )
      );
    };
    const offTopicVideoIncomplete = (state: RecommenderState) => {
      return (
        !state.mentorUtteranceVideos.offTopic ||
        !isAnswerComplete(
          state.mentorUtteranceVideos.offTopic,
          UtteranceName.OFF_TOPIC,
          state.mentorData.mentorType
        )
      );
    };
    const thumbnailMissing = (state: RecommenderState) => {
      return (
        !state.mentorData.thumbnail &&
        !state.mentorData.mentorConfig?.disableThumbnailRecommendation
      );
    };

    // Note: All reccomendations have same weights in this phase, but other phases rec's have different weights
    const recommendationWeights: AttributeWeightRecord = {
      functionalMentor: 1,
      questionCover: 1,
      responseQuality: 1,
    };

    const addnameAndJobRoleRec = new Recommendation<RecommendationName>(
      recommendationWeights,
      "Add Name and/or Job Role",
      RecommendationName.ADD_NAME_OR_JOB,
      "Providing your name and job role is essential for users to know who they're talking to.",
      () => navigate(`setup?i=${SetupScreen.Tell_Us_About_Yourself}`)
    );
    const addGoalRec = new Recommendation<RecommendationName>(
      recommendationWeights,
      "Add Your Goal",
      RecommendationName.ADD_GOAL,
      "It's important to establish the goal of your mentor.",
      () => navigate(`setup?i=${SetupScreen.My_Goal}`)
    );
    const addKeywordsRec = new Recommendation<RecommendationName>(
      recommendationWeights,
      "Add Keywords",
      RecommendationName.ADD_KEYWORDS,
      "Adding keywords respective to your experiences and identities allows users to easily find mentors they can relate to.",
      () => navigate(`setup?i=${SetupScreen.Experiences_Identities}`)
    );
    const addSubjectRec = new Recommendation<RecommendationName>(
      recommendationWeights,
      "Add a Subject",
      RecommendationName.ADD_SUBJECT,
      "Your mentor doesn't have any subject areas. Subjects give you sets of questions to record.",
      () => navigate("/subjects")
    );
    const recordIdleRec = new Recommendation<RecommendationName>(
      recommendationWeights,
      "Record Your Idle video",
      RecommendationName.RECORD_IDLE,
      "Users see your idle video while typing a question",
      mentorUtteranceVideos?.idle
        ? () =>
            navigate(
              urlBuild("/record", {
                subject: "",
                videoId: mentorUtteranceVideos?.idle?.question || "",
              })
            )
        : undefined
    );
    const recordIntroRec = new Recommendation<RecommendationName>(
      recommendationWeights,
      "Record Your Intro video",
      RecommendationName.RECORD_INTRO,
      "Your mentor's introduction is what they say when a user starts.",
      mentorUtteranceVideos?.intro
        ? () =>
            navigate(
              urlBuild("/record", {
                subject: "",
                videoId: mentorUtteranceVideos?.intro?.question || "",
              })
            )
        : undefined
    );
    const recordOffTopicRec = new Recommendation<RecommendationName>(
      recommendationWeights,
      "Record Off Topic Rec",
      RecommendationName.RECORD_OFF_TOPIC,
      "The off topic response helps tell the user that the AI didn't understand their question.",
      mentorUtteranceVideos?.offTopic
        ? () =>
            navigate(
              urlBuild("/record", {
                subject: "",
                videoId: mentorUtteranceVideos?.offTopic?.question || "",
              })
            )
        : undefined
    );
    const addThumbnail = new Recommendation<RecommendationName>(
      recommendationWeights,
      "Add a Thumbnail",
      RecommendationName.ADD_THUMBNAIL,
      "A thumbnail helps a user pick out your mentor from other mentors."
    );

    const addNameAndJobRolePR = new ProductionRule<
      RecommenderState,
      RecommendationName
    >(nameOrJobTitleMissing, [addnameAndJobRoleRec]);
    const addGoalPR = new ProductionRule(goalMissing, [addGoalRec]);
    const addKeywordsPR = new ProductionRule(keywordsMissing, [addKeywordsRec]);
    const addSubjectPR = new ProductionRule(noSubject, [addSubjectRec]);
    const recordIdlePR = new ProductionRule(idleVideoIncomplete, [
      recordIdleRec,
    ]);
    const recordIntroPR = new ProductionRule(introVideoIncomplete, [
      recordIntroRec,
    ]);
    const recordOffTopicPR = new ProductionRule(offTopicVideoIncomplete, [
      recordOffTopicRec,
    ]);
    const addThumbnailPR = new ProductionRule(thumbnailMissing, [addThumbnail]);
    // Note
    const allProductionRules = [
      addNameAndJobRolePR,
      addGoalPR,
      addKeywordsPR,
      addSubjectPR,
      recordIdlePR,
      recordIntroPR,
      recordOffTopicPR,
      addThumbnailPR,
    ];

    const anyPhase = new Phase<RecommenderState, RecommendationName>(
      allProductionRules,
      phaseAttributeWeights,
      "Any"
    );
    return anyPhase;
  }

  function createIncompletePhase() {
    const phaseAttributeWeights: AttributeWeightRecord = {
      functionalMentor: 1,
      questionCover: 0.2,
      responseQuality: 0,
    };
    const recordQuestionRecWeights: AttributeWeightRecord = {
      functionalMentor: 0.2,
      questionCover: 1,
      responseQuality: 0,
    };
    const addNewSubjectRecWeights: AttributeWeightRecord = {
      functionalMentor: 0.2,
      questionCover: 1,
      responseQuality: 0,
    };
    const buildMentorRecWeights: AttributeWeightRecord = {
      functionalMentor: 0.2,
      questionCover: 1,
      responseQuality: 0,
    };
    const targetAnswerAmount = 5;
    const allProductionRules = [
      recordQuestionProductionRule(
        recordQuestionRecWeights,
        targetAnswerAmount
      ),
      addSubjectProductionRule(addNewSubjectRecWeights, targetAnswerAmount),
      buildMentorProductionRule(buildMentorRecWeights),
    ];
    return new Phase<RecommenderState, RecommendationName>(
      allProductionRules,
      phaseAttributeWeights,
      "Incomplete",
      (state: RecommenderState) => {
        const completeMentorAnswers = state.mentorData.answers.filter(
          (answer) =>
            isAnswerComplete(answer, undefined, state.mentorData.mentorType)
        );
        return (
          completeMentorAnswers.length < targetAnswerAmount ||
          !state.mentorData.lastTrainedAt
        );
      }
    );
  }

  function createScriptedPhase() {
    const targetAnswerAmount = 20;
    const phaseAttributeWeights: AttributeWeightRecord = {
      functionalMentor: 1,
      questionCover: 0.9,
      responseQuality: 0.1,
    };
    const recordQuestionRecWeights: AttributeWeightRecord = {
      functionalMentor: 0,
      questionCover: 1,
      responseQuality: 0,
    };
    const buildMentorRecWeights: AttributeWeightRecord = {
      functionalMentor: 0,
      questionCover: 0.5,
      responseQuality: 0,
    };
    const previewMentorRecWeights: AttributeWeightRecord = {
      functionalMentor: 0,
      questionCover: 0,
      responseQuality: 0.5,
    };
    const trendingAnswerRecWeights: AttributeWeightRecord = {
      functionalMentor: 0,
      questionCover: 0.1,
      responseQuality: 0.5,
    };
    const addNewSubjectRecWeights: AttributeWeightRecord = {
      functionalMentor: 0,
      questionCover: 0.3,
      responseQuality: 0,
    };
    const allProductionRules = [
      recordQuestionProductionRule(
        recordQuestionRecWeights,
        targetAnswerAmount
      ),
      buildMentorProductionRule(buildMentorRecWeights),
      previewMentorProductionRule(previewMentorRecWeights),
      answerTrendingQuestionsProductionRule(trendingAnswerRecWeights),
      addSubjectProductionRule(addNewSubjectRecWeights, targetAnswerAmount),
    ];
    return new Phase<RecommenderState, RecommendationName>(
      allProductionRules,
      phaseAttributeWeights,
      "Scripted",
      (state: RecommenderState) => {
        const completeMentorAnswers = state.mentorData.answers.filter(
          (answer) =>
            isAnswerComplete(answer, undefined, state.mentorData.mentorType)
        );
        return completeMentorAnswers.length < targetAnswerAmount;
      }
    );
  }

  function createInteractivePhase() {
    const targetAnswerAmount = 50;
    const phaseAttributeWeights: AttributeWeightRecord = {
      functionalMentor: 1,
      questionCover: 0.8,
      responseQuality: 0.2,
    };
    const recordQuestionRecWeights: AttributeWeightRecord = {
      functionalMentor: 0,
      questionCover: 1,
      responseQuality: 0,
    };
    const buildMentorRecWeights: AttributeWeightRecord = {
      functionalMentor: 0,
      questionCover: 0.5,
      responseQuality: 0,
    };
    const previewMentorRecWeights: AttributeWeightRecord = {
      functionalMentor: 0,
      questionCover: 0,
      responseQuality: 0.5,
    };
    const addNewSubjectRecWeights: AttributeWeightRecord = {
      functionalMentor: 0,
      questionCover: 0.3,
      responseQuality: 0,
    };
    const trendingAnswerRecWeights: AttributeWeightRecord = {
      functionalMentor: 0,
      questionCover: 0.1,
      responseQuality: 0.5,
    };
    const allProductionRules = [
      recordQuestionProductionRule(
        recordQuestionRecWeights,
        targetAnswerAmount
      ),
      buildMentorProductionRule(buildMentorRecWeights),
      previewMentorProductionRule(previewMentorRecWeights),
      addSubjectProductionRule(addNewSubjectRecWeights, targetAnswerAmount),
      answerTrendingQuestionsProductionRule(trendingAnswerRecWeights),
    ];
    return new Phase<RecommenderState, RecommendationName>(
      allProductionRules,
      phaseAttributeWeights,
      "Interactive",
      (state: RecommenderState) => {
        const completeMentorAnswers = state.mentorData.answers.filter(
          (answer) =>
            isAnswerComplete(answer, undefined, state.mentorData.mentorType)
        );
        return completeMentorAnswers.length < targetAnswerAmount;
      }
    );
  }

  function createSpecialistPhase() {
    const targetAnswerAmount = 150;
    const phaseAttributeWeights: AttributeWeightRecord = {
      functionalMentor: 1,
      questionCover: 0.8,
      responseQuality: 0.2,
    };
    const recordQuestionRecWeights: AttributeWeightRecord = {
      functionalMentor: 0,
      questionCover: 1,
      responseQuality: 0,
    };
    const buildMentorRecWeights: AttributeWeightRecord = {
      functionalMentor: 0,
      questionCover: 0.5,
      responseQuality: 0,
    };
    const previewMentorRecWeights: AttributeWeightRecord = {
      functionalMentor: 0,
      questionCover: 0,
      responseQuality: 0.5,
    };
    const trendingAnswerRecWeights: AttributeWeightRecord = {
      functionalMentor: 0,
      questionCover: 0.3,
      responseQuality: 0.5,
    };
    const addNewSubjectRecWeights: AttributeWeightRecord = {
      functionalMentor: 0,
      questionCover: 0.3,
      responseQuality: 0,
    };
    const allProductionRules = [
      recordQuestionProductionRule(
        recordQuestionRecWeights,
        targetAnswerAmount
      ),
      buildMentorProductionRule(buildMentorRecWeights),
      previewMentorProductionRule(previewMentorRecWeights),
      answerTrendingQuestionsProductionRule(trendingAnswerRecWeights),
      addSubjectProductionRule(addNewSubjectRecWeights, targetAnswerAmount),
    ];
    return new Phase<RecommenderState, RecommendationName>(
      allProductionRules,
      phaseAttributeWeights,
      "Specialist",
      (state: RecommenderState) => {
        const completeMentorAnswers = state.mentorData.answers.filter(
          (answer) =>
            isAnswerComplete(answer, undefined, state.mentorData.mentorType)
        );
        return completeMentorAnswers.length < targetAnswerAmount;
      }
    );
  }

  function createConversationalPhase() {
    const targetAnswerAmount = 250;
    const phaseAttributeWeights: AttributeWeightRecord = {
      functionalMentor: 1,
      questionCover: 0.7,
      responseQuality: 0.3,
    };
    const recordQuestionRecWeights: AttributeWeightRecord = {
      functionalMentor: 0,
      questionCover: 1,
      responseQuality: 0,
    };
    const buildMentorRecWeights: AttributeWeightRecord = {
      functionalMentor: 0,
      questionCover: 0.5,
      responseQuality: 0,
    };
    const previewMentorRecWeights: AttributeWeightRecord = {
      functionalMentor: 0,
      questionCover: 0,
      responseQuality: 0.5,
    };
    const trendingAnswerRecWeights: AttributeWeightRecord = {
      functionalMentor: 0,
      questionCover: 0.3,
      responseQuality: 0.5,
    };
    const addNewSubjectRecWeights: AttributeWeightRecord = {
      functionalMentor: 0,
      questionCover: 0.3,
      responseQuality: 0,
    };
    const allProductionRules = [
      recordQuestionProductionRule(
        recordQuestionRecWeights,
        targetAnswerAmount
      ),
      buildMentorProductionRule(buildMentorRecWeights),
      previewMentorProductionRule(previewMentorRecWeights),
      answerTrendingQuestionsProductionRule(trendingAnswerRecWeights),
      addSubjectProductionRule(addNewSubjectRecWeights, targetAnswerAmount),
    ];
    return new Phase<RecommenderState, RecommendationName>(
      allProductionRules,
      phaseAttributeWeights,
      "Conversational",
      (state: RecommenderState) => {
        const completeMentorAnswers = state.mentorData.answers.filter(
          (answer) =>
            isAnswerComplete(answer, undefined, state.mentorData.mentorType)
        );
        return completeMentorAnswers.length < targetAnswerAmount;
      }
    );
  }

  function createFullSubjectPhase() {
    const targetAnswerAmount = 1000;
    const phaseAttributeWeights: AttributeWeightRecord = {
      functionalMentor: 1,
      questionCover: 0.5,
      responseQuality: 0.5,
    };
    const trendingAnswerRecWeights: AttributeWeightRecord = {
      functionalMentor: 0,
      questionCover: 0.6,
      responseQuality: 0.5,
    };
    const recordQuestionRecWeights: AttributeWeightRecord = {
      functionalMentor: 0,
      questionCover: 0.8,
      responseQuality: 0,
    };
    const buildMentorRecWeights: AttributeWeightRecord = {
      functionalMentor: 0,
      questionCover: 0.5,
      responseQuality: 0,
    };
    const previewMentorRecWeights: AttributeWeightRecord = {
      functionalMentor: 0,
      questionCover: 0,
      responseQuality: 0.5,
    };
    const addNewSubjectRecWeights: AttributeWeightRecord = {
      functionalMentor: 0,
      questionCover: 0.3,
      responseQuality: 0,
    };
    const allProductionRules = [
      answerTrendingQuestionsProductionRule(trendingAnswerRecWeights),
      recordQuestionProductionRule(recordQuestionRecWeights),
      buildMentorProductionRule(buildMentorRecWeights),
      previewMentorProductionRule(previewMentorRecWeights),
      addSubjectProductionRule(addNewSubjectRecWeights),
    ];
    return new Phase<RecommenderState, RecommendationName>(
      allProductionRules,
      phaseAttributeWeights,
      "Full Subject",
      (state: RecommenderState) => {
        const completeMentorAnswers = state.mentorData.answers.filter(
          (answer) =>
            isAnswerComplete(answer, undefined, state.mentorData.mentorType)
        );
        return completeMentorAnswers.length < targetAnswerAmount;
      }
    );
  }

  function createLifeStoryPhase() {
    const targetAnswerAmount = 10000;
    const phaseAttributeWeights: AttributeWeightRecord = {
      functionalMentor: 1,
      questionCover: 0.5,
      responseQuality: 0.5,
    };
    const addNewSubjectRecWeights: AttributeWeightRecord = {
      functionalMentor: 0,
      questionCover: 1,
      responseQuality: 0,
    };
    const trendingAnswerRecWeights: AttributeWeightRecord = {
      functionalMentor: 0,
      questionCover: 0.6,
      responseQuality: 0.4,
    };
    const recordQuestionRecWeights: AttributeWeightRecord = {
      functionalMentor: 0,
      questionCover: 0.8,
      responseQuality: 0,
    };
    const buildMentorRecWeights: AttributeWeightRecord = {
      functionalMentor: 0,
      questionCover: 0.5,
      responseQuality: 0,
    };
    const allProductionRules = [
      addSubjectProductionRule(addNewSubjectRecWeights),
      answerTrendingQuestionsProductionRule(trendingAnswerRecWeights),
      recordQuestionProductionRule(recordQuestionRecWeights),
      buildMentorProductionRule(buildMentorRecWeights),
    ];
    return new Phase<RecommenderState, RecommendationName>(
      allProductionRules,
      phaseAttributeWeights,
      "Life Story",
      (state: RecommenderState) => {
        const completeMentorAnswers = state.mentorData.answers.filter(
          (answer) =>
            isAnswerComplete(answer, undefined, state.mentorData.mentorType)
        );
        return completeMentorAnswers.length < targetAnswerAmount;
      }
    );
  }

  function recordQuestionProductionRule(
    recWeights: AttributeWeightRecord,
    targetAnswerAmount?: number
  ) {
    const recordQuestionRec = new Recommendation<RecommendationName>(
      recWeights,
      "Record More Questions",
      RecommendationName.RECORD_MORE_QUESTIONS,
      "Record more questions to further improve your mentor.",
      () =>
        navigate(
          urlBuild("/record", {
            subject: "",
            status: "INCOMPLETE",
            category: "",
          })
        )
    );
    const activeCondition = (state: RecommenderState) => {
      const completeMentorAnswers = state.mentorData.answers.filter((answer) =>
        isAnswerComplete(answer, undefined, state.mentorData.mentorType)
      );
      return targetAnswerAmount
        ? state.mentorData.answers.length >= targetAnswerAmount &&
            completeMentorAnswers.length < targetAnswerAmount
        : completeMentorAnswers.length < state.mentorData.answers.length;
    };
    const productionRule = new ProductionRule<
      RecommenderState,
      RecommendationName
    >(activeCondition, [recordQuestionRec]);
    return productionRule;
  }

  function addSubjectProductionRule(
    recWeights: AttributeWeightRecord,
    targetAnswerAmount?: number
  ) {
    const addSubjectRec = new Recommendation<RecommendationName>(
      recWeights,
      "Add A Subject",
      RecommendationName.ADD_SUBJECT,
      "Your mentor doesn't have any subject areas. Subjects give you sets of questions to record.",
      () => navigate("/subjects")
    );
    const activeConditon = (state: RecommenderState) => {
      const completeMentorAnswers = state.mentorData.answers.filter((answer) =>
        isAnswerComplete(answer, undefined, state.mentorData.mentorType)
      );
      if (state.mentorData.mentorConfig?.subjects.length) {
        return false;
      }
      // mentorData.answers contains complete AND incomplete answers.
      return targetAnswerAmount
        ? state.mentorData.answers.length < targetAnswerAmount
        : state.mentorData.answers.length == completeMentorAnswers.length;
    };
    const productionRule = new ProductionRule<
      RecommenderState,
      RecommendationName
    >(activeConditon, [addSubjectRec]);
    return productionRule;
  }

  function buildMentorProductionRule(recWeights: AttributeWeightRecord) {
    const buildMentorRec = new Recommendation<RecommendationName>(
      recWeights,
      "Build your mentor",
      RecommendationName.BUILD_MENTOR,
      "You've answered new questions since you last trained your mentor. Rebuild so you can preview.",
      () => trainMentor && trainMentor()
    );
    const activeCondition = (state: RecommenderState) => {
      return !state.mentorData.lastTrainedAt || state.mentorData.isDirty;
    };
    const productionRule = new ProductionRule<
      RecommenderState,
      RecommendationName
    >(activeCondition, [buildMentorRec]);
    return productionRule;
  }

  function previewMentorProductionRule(recWeights: AttributeWeightRecord) {
    const previewMentorRec = new Recommendation<RecommendationName>(
      recWeights,
      "Preview your mentor",
      RecommendationName.PREVIEW_MENTOR,
      "Preview your mentor to review its current status.",
      () => launchMentor(mentorData?._id || "", true)
    );
    const activeCondition = (state: RecommenderState) => {
      const lastPreviewedDate = state.mentorData.lastPreviewedAt
        ? Date.parse(state.mentorData.lastPreviewedAt)
        : 0;
      const lastBuiltDate = state.mentorData.lastTrainedAt
        ? Date.parse(state.mentorData.lastTrainedAt)
        : 0;
      return (
        !state.mentorData.lastPreviewedAt || lastBuiltDate > lastPreviewedDate
      );
    };
    const productionRule = new ProductionRule<
      RecommenderState,
      RecommendationName
    >(activeCondition, [previewMentorRec]);
    return productionRule;
  }

  function answerTrendingQuestionsProductionRule(
    recWeights: AttributeWeightRecord
  ) {
    const answerTrendingQuestionsRec = new Recommendation<RecommendationName>(
      recWeights,
      "Answer Trending Questions",
      RecommendationName.ANSWER_TRENDING,
      "Users have asked questions that your mentor was unable to confidently answer.",
      () => navigate("/feedback")
    );
    const activeCondition = (state: RecommenderState) => {
      return state.numberOfTrendingAnswers >= 5;
    };
    const productionRule = new ProductionRule<
      RecommenderState,
      RecommendationName
    >(activeCondition, [answerTrendingQuestionsRec]);
    return productionRule;
  }

  return {
    recommender,
  };
}
