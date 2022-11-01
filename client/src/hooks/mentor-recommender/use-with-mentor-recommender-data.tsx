/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { getValueIfKeyExists } from "helpers";
import { useWithTrendingFeedback } from "hooks/use-with-trending-feedback";
import { useEffect, useState } from "react";
import { useWithLogin } from "store/slices/login/useWithLogin";
import { useActiveMentor } from "store/slices/mentor/useActiveMentor";
import useQuestions from "store/slices/questions/useQuestions";
import { Answer, Mentor, UtteranceName } from "types";
import { RecommenderState } from "./use-with-mentor-recommender";

export interface MentorUtteranceVideos {
  idle?: Answer;
  intro?: Answer;
  offTopic?: Answer;
}

export function useWithMentorRecommenderData(): Partial<RecommenderState> {
  const { getData } = useActiveMentor();
  const { state: loginState } = useWithLogin();
  const { bestRepIds } = useWithTrendingFeedback(loginState.accessToken || "");

  const mentorData: Mentor | undefined = getData((m) => m.data);
  const mentorQuestions = useQuestions(
    (s) => s.questions,
    mentorData?.answers?.map((a) => a.question)
  );
  const [mentorUtteranceVideos, setMentorUtteranceVideos] =
    useState<MentorUtteranceVideos>();

  useEffect(() => {
    if (!mentorData || !mentorQuestions) {
      return;
    }
    const idle = mentorData?.answers.find(
      (a) =>
        getValueIfKeyExists(a.question, mentorQuestions)?.question?.name ===
        UtteranceName.IDLE
    );
    const intro = mentorData?.answers.find(
      (a) =>
        getValueIfKeyExists(a.question, mentorQuestions)?.question?.name ===
        UtteranceName.INTRO
    );
    const offTopic = mentorData?.answers.find(
      (a) =>
        getValueIfKeyExists(a.question, mentorQuestions)?.question?.name ===
        UtteranceName.OFF_TOPIC
    );
    setMentorUtteranceVideos({ idle, intro, offTopic });
  }, [mentorData, mentorQuestions]);

  return {
    mentorData,
    mentorUtteranceVideos,
    numberOfTrendingAnswers: bestRepIds.length,
  };
}
