/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { isAnswerComplete } from "helpers";
import { useEffect, useState } from "react";
import { Mentor, UtteranceName } from "types";
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
  recommender?: Recommender<RecommenderState>;
}

export function useWithMentorRecommender(): UseWithMentorRecommender {
  const { mentorData, mentorUtteranceVideos, numberOfTrendingAnswers } =
    useWithMentorRecommenderData();
  const [recommender, setRecommender] =
    useState<Recommender<RecommenderState>>();

  useEffect(() => {
    if (!mentorData || !mentorUtteranceVideos || !numberOfTrendingAnswers) {
      return;
    }
    setRecommender(
      new Recommender(
        { mentorData, mentorUtteranceVideos, numberOfTrendingAnswers },
        [
          createAnyPhase(),
          createIncompletePhase(),
          createScriptedPhase(),
          createLimitedPhase(),
          createSingleAreaPhase(),
          createConversationalPhase(),
        ]
      )
    );
  }, [mentorData, mentorUtteranceVideos]);

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
      return !state.mentorData.goal;
    };
    const keywordsMissing = (state: RecommenderState) => {
      return !state.mentorData.keywords.length;
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
          UtteranceName.IDLE,
          state.mentorData.mentorType
        )
      );
    };
    const thumbnailMissing = (state: RecommenderState) => {
      return !state.mentorData.thumbnail;
    };

    // Note: All reccomendations have same weights in this phase, but other phases rec's have different weights
    const recommendationWeights: AttributeWeightRecord = {
      functionalMentor: 1,
      questionCover: 1,
      responseQuality: 1,
    };
    const addnameAndJobRoleRec = new Recommendation(
      recommendationWeights,
      "Add Name And Job Role"
    );
    const addGoalRec = new Recommendation(
      recommendationWeights,
      "Add Your Goal"
    );
    const addKeywordsRec = new Recommendation(
      recommendationWeights,
      "Add Keywords"
    );
    const addSubjectRec = new Recommendation(
      recommendationWeights,
      "Add a Subject"
    );
    const recordIdleRec = new Recommendation(
      recommendationWeights,
      "Record Your Idle video"
    );
    const recordIntroRec = new Recommendation(
      recommendationWeights,
      "Record Your Intro video"
    );
    const recordOffTopicRec = new Recommendation(
      recommendationWeights,
      "Record Off Topic Rec"
    );
    const addThumbnail = new Recommendation(
      recommendationWeights,
      "Add Thumbnail"
    );

    const addNameAndJobRolePR = new ProductionRule(nameOrJobTitleMissing, [
      addnameAndJobRoleRec,
    ]);
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

    const anyPhase = new Phase<RecommenderState>(
      allProductionRules,
      phaseAttributeWeights
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

    const allProductionRules = [
      recordQuestionProductionRule(recordQuestionRecWeights, 5),
      addSubjectProductionRule(addNewSubjectRecWeights, 5),
      buildMentorProductionRule(buildMentorRecWeights),
    ];
    return new Phase<RecommenderState>(
      allProductionRules,
      phaseAttributeWeights
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
    return new Phase<RecommenderState>(
      allProductionRules,
      phaseAttributeWeights
    );
  }

  function createLimitedPhase() {
    const targetAnswerAmount = 100;
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
    return new Phase<RecommenderState>(
      allProductionRules,
      phaseAttributeWeights
    );
  }

  function createSingleAreaPhase() {
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
    return new Phase<RecommenderState>(
      allProductionRules,
      phaseAttributeWeights
    );
  }

  function createConversationalPhase() {
    const targetAnswerAmount = 1000;
    const phaseAttributeWeights: AttributeWeightRecord = {
      functionalMentor: 1,
      questionCover: 0.5,
      responseQuality: 0.5,
    };
    const trendingAnswerRecWeights: AttributeWeightRecord = {
      functionalMentor: 0,
      questionCover: 0.3,
      responseQuality: 0.5,
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
    const addNewSubjectRecWeights: AttributeWeightRecord = {
      functionalMentor: 0,
      questionCover: 0.3,
      responseQuality: 0,
    };
    const allProductionRules = [
      answerTrendingQuestionsProductionRule(trendingAnswerRecWeights),
      recordQuestionProductionRule(
        recordQuestionRecWeights,
        targetAnswerAmount
      ),
      buildMentorProductionRule(buildMentorRecWeights),
      addSubjectProductionRule(addNewSubjectRecWeights, targetAnswerAmount),
    ];
    return new Phase<RecommenderState>(
      allProductionRules,
      phaseAttributeWeights
    );
  }

  function recordQuestionProductionRule(
    recWeights: AttributeWeightRecord,
    targetAnswerAmount: number
  ) {
    const recordQuestionRec = new Recommendation(
      recWeights,
      "Record More Questions"
    );
    const activeCondition = (state: RecommenderState) => {
      const completeMentorAnswers = state.mentorData.answers.filter((answer) =>
        isAnswerComplete(answer, undefined, state.mentorData.mentorType)
      );
      return completeMentorAnswers.length < targetAnswerAmount;
    };
    const productionRule = new ProductionRule(activeCondition, [
      recordQuestionRec,
    ]);
    return productionRule;
  }

  function addSubjectProductionRule(
    recWeights: AttributeWeightRecord,
    targetAnswerAmount: number
  ) {
    const addSubjectRec = new Recommendation(recWeights, "Add A Subject");
    const activeConditon = (state: RecommenderState) => {
      // mentorData.answers contains complete AND incomplete answers.
      return state.mentorData.answers.length < targetAnswerAmount;
    };
    const productionRule = new ProductionRule(activeConditon, [addSubjectRec]);
    return productionRule;
  }

  function buildMentorProductionRule(recWeights: AttributeWeightRecord) {
    const buildMentorRec = new Recommendation(recWeights, "Build your mentor");
    const activeCondition = (state: RecommenderState) => {
      return !state.mentorData.lastTrainedAt || state.mentorData.isDirty;
    };
    const productionRule = new ProductionRule(activeCondition, [
      buildMentorRec,
    ]);
    return productionRule;
  }

  function previewMentorProductionRule(recWeights: AttributeWeightRecord) {
    const previewMentorRec = new Recommendation(
      recWeights,
      "Preview your mentor"
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
    const productionRule = new ProductionRule(activeCondition, [
      previewMentorRec,
    ]);
    return productionRule;
  }

  function answerTrendingQuestionsProductionRule(
    recWeights: AttributeWeightRecord
  ) {
    const answerTrendingQuestionsRec = new Recommendation(
      recWeights,
      "Answer Trending Questions"
    );
    const activeCondition = (state: RecommenderState) => {
      return state.numberOfTrendingAnswers >= 5;
    };
    const productionRule = new ProductionRule(activeCondition, [
      answerTrendingQuestionsRec,
    ]);
    return productionRule;
  }

  return {
    recommender,
  };
}
