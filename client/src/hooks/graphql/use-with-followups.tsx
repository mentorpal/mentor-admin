/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { fetchFollowUpQuestions } from "api";
import { navigate } from "gatsby";
import { urlBuild } from "helpers";
import { useState } from "react";
import { useEffect } from "react";
import { useWithLogin } from "store/slices/login/useWithLogin";
import useActiveMentor, {
  isActiveMentorLoading,
  useActiveMentorActions,
} from "store/slices/mentor/useActiveMentor";
import {
  Category,
  Mentor,
  QuestionType,
  Subject,
  SubjectQuestion,
  UtteranceName,
} from "types";
import { v4 as uuid } from "uuid";
import { useWithSubject } from "./use-with-subject";

export enum FollowupsPageState {
  PROMPT_GENERATE_FOLLOWUPS = "PROMPT_GENERATE_FOLLOWUPS",
  GENERATING_FOLLOWUPS = "GENERATING_FOLLOWUPS",
  FAILED_GENERATING_FOLLOWUPS = "FAILED_GENERATING_FOLLOWUPS",
  SUCCESS_GENERATING_FOLLOWUPS = "SUCCESS_GENERATING_FOLLOWUPS",
  SAVING_SELECTED_FOLLOWUPS = "SAVING_SELECTED_FOLLOWUPS",
  FAILED_SAVING_SELECTED_FOLLOWUPS = "FAILED_SAVING_SELECTED_FOLLOWUPS",
  SUCCESS_SAVING_SELECTED_FOLLOWUPS = "SUCCESS_SAVING_SELECTED_FOLLOWUPS",
}

export interface UseWithFollowups {
  mentorId?: string;
  curSubject?: Subject;
  curCategory?: Category;
  followUpQuestions?: string[];
  fetchFollowups: () => void;
  followupPageState: FollowupsPageState;
  saveAndLoadSelectedFollowups: () => void;
  toRecordFollowUpQs: string[];
  setToRecordFollowUpQs: (followups: string[]) => void;
  navigateToMyMentorPage: () => void;
  mentor?: Mentor;
}

export interface newQuestion {
  question: string;
  questionId: string;
  answerId: string;
}

export function useWithFollowups(props: {
  categoryId: string;
  subjectId: string;
}): UseWithFollowups {
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>();
  const [followupPageState, setFollowupPageState] =
    useState<FollowupsPageState>(FollowupsPageState.PROMPT_GENERATE_FOLLOWUPS);
  const [toRecordFollowUpQs, setToRecordFollowUpQs] = useState<string[]>([]);
  const { state } = useWithLogin();
  const isMentorLoading = isActiveMentorLoading();
  const mentorId = useActiveMentor((state) => state.data?._id);
  const mentorAnswers = useActiveMentor((state) => state.data?.answers);
  const { loadMentor } = useActiveMentorActions();
  const {
    editData,
    editedData,
    isEdited: isSubjectEdited,
    saveSubject,
  } = useWithSubject(props.subjectId, state.accessToken || "");
  const { categoryId, subjectId } = props;
  const curSubject = useActiveMentor((state) =>
    state.data?.subjects.find((s) => s._id == subjectId)
  );
  const curCategory = curSubject?.categories.find((c) => c.id === categoryId);

  useEffect(() => {
    if (!isSubjectEdited || !editedData) return;
    setFollowupPageState(FollowupsPageState.SAVING_SELECTED_FOLLOWUPS);
    saveSubject();
  }, [isSubjectEdited]);

  useEffect(() => {
    if (
      !toRecordFollowUpQs.length ||
      isMentorLoading ||
      !mentorId ||
      !curSubject
    )
      return;
    const newQuestionIds = curSubject.questions.reduce(function (
      result: string[],
      question
    ) {
      const index = toRecordFollowUpQs.findIndex(
        (followup) => followup === question.question.question
      );
      if (index !== -1 && question.question.mentor === mentorId) {
        result.push(question.question._id);
      }
      return result;
    },
    []);

    if (newQuestionIds.length) {
      navigate(
        urlBuild("/record", {
          category: categoryId,
          subject: subjectId,
          videoId: newQuestionIds,
        })
      );
    } else {
      navigateToMyMentorPage();
    }
  }, [isMentorLoading]);

  function fetchFollowups() {
    if (!state.accessToken) {
      return;
    }
    fetch(state.accessToken);
  }

  function fetch(accessToken: string) {
    if (!mentorAnswers) {
      return;
    }
    setFollowupPageState(FollowupsPageState.GENERATING_FOLLOWUPS);
    fetchFollowUpQuestions(categoryId, accessToken)
      .then((data) => {
        let followUps = data
          ? data.map((d) => {
              return d.question;
            })
          : [];
        //ensures the same follow up question wasn't already answered elsewhere
        //should exact match follow up questions be asked for different subjects?
        followUps = followUps.filter(
          (followUp) =>
            mentorAnswers.findIndex(
              (a) =>
                a.question.question === followUp &&
                a.question.mentor === mentorId
            ) === -1
        );
        setFollowupPageState(FollowupsPageState.SUCCESS_GENERATING_FOLLOWUPS);
        setFollowUpQuestions(followUps);
      })
      .catch((err) => {
        console.error(err);
        setFollowupPageState(FollowupsPageState.FAILED_GENERATING_FOLLOWUPS);
      });
  }

  function navigateToMyMentorPage() {
    loadMentor();
    navigate("/");
  }

  function saveAndLoadSelectedFollowups() {
    if (!editedData || !curCategory || !mentorId || !toRecordFollowUpQs) {
      return;
    }
    setFollowupPageState(FollowupsPageState.SAVING_SELECTED_FOLLOWUPS);
    const newQuestions: SubjectQuestion[] = toRecordFollowUpQs.map(
      (followUp) => {
        return {
          question: {
            _id: uuid(),
            question: followUp,
            paraphrases: [],
            type: QuestionType.QUESTION,
            name: UtteranceName.NONE,
            mentor: mentorId,
          },
          category: curCategory,
          topics: [],
        };
      }
    );
    editData({
      questions: [...editedData.questions, ...newQuestions],
    });
  }

  return {
    mentorId,
    curSubject,
    curCategory,
    followUpQuestions,
    fetchFollowups,
    followupPageState,
    saveAndLoadSelectedFollowups,
    toRecordFollowUpQs,
    setToRecordFollowUpQs,
    navigateToMyMentorPage,
  };
}
