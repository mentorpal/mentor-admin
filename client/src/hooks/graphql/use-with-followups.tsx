/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useReducer, useState } from "react";
import { navigate } from "gatsby";
import { v4 as uuid } from "uuid";

import { addOrUpdateSubjectQuestions, fetchFollowUpQuestions } from "api";
import { urlBuild } from "helpers";
import { useWithLogin } from "store/slices/login/useWithLogin";
import useActiveMentor from "store/slices/mentor/useActiveMentor";
import { Category, QuestionType, Subject, UtteranceName } from "types";
import { SubjectQuestionGQL } from "types-gql";
import {
  FollowupsPageStatusType,
  FollowupsPageState,
  FollowupsReducer,
  FollowupsActionType,
} from "./followups-reducer";

export interface UseWithFollowups {
  mentorId?: string;
  curSubject?: Subject;
  curCategory?: Category;
  followUpQuestions?: string[];
  followupPageState: FollowupsPageState;
  toRecordFollowUpQs: string[];
  fetchFollowups: () => void;
  saveAndLoadSelectedFollowups: () => void;
  setToRecordFollowUpQs: (followups: string[]) => void;
  navigateToMyMentorPage: () => void;
}

export function useWithFollowups(props: {
  categoryId: string;
  subjectId: string;
}): UseWithFollowups {
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>();
  const [state, dispatch] = useReducer(FollowupsReducer, {
    status: FollowupsPageStatusType.INIT,
    error: undefined,
  });
  const [toRecordFollowUpQs, setToRecordFollowUpQs] = useState<string[]>([]);
  const { state: loginState } = useWithLogin();
  const { getData, loadMentor } = useActiveMentor();
  const { categoryId, subjectId } = props;
  const mentorId = getData((state) => state.data?._id);
  const curSubject: Subject = getData((state) =>
    state.data?.subjects.find((s) => s._id == subjectId)
  );
  const curCategory = curSubject?.categories.find((c) => c.id === categoryId);

  function fetchFollowups() {
    if (!loginState.accessToken) {
      return;
    }
    dispatch({ type: FollowupsActionType.GENERATING_FOLLOWUPS });
    fetchFollowUpQuestions(categoryId, loginState.accessToken)
      .then((data) => {
        const followUps = data
          ? data.map((d) => {
              return d.question;
            })
          : [];
        dispatch({ type: FollowupsActionType.SUCCESS_GENERATING_FOLLOWUPS });
        setFollowUpQuestions(followUps);
      })
      .catch((err) => {
        dispatch({
          type: FollowupsActionType.FAILED_GENERATING_FOLLOWUPS,
          payload: {
            message: "Failed to fetch follow up questions",
            error: err.message,
          },
        });
      });
  }

  function navigateToMyMentorPage() {
    loadMentor();
    navigate("/");
  }

  function saveAndLoadSelectedFollowups() {
    if (
      !loginState.accessToken ||
      !curCategory ||
      !curSubject ||
      !mentorId ||
      !toRecordFollowUpQs
    ) {
      return;
    }
    dispatch({ type: FollowupsActionType.SAVING_SELECTED_FOLLOWUPS });
    const newQuestions: SubjectQuestionGQL[] = toRecordFollowUpQs.map(
      (followUp) => {
        return {
          question: {
            _id: uuid(),
            clientId: uuid(),
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

    addOrUpdateSubjectQuestions(
      curSubject._id,
      newQuestions,
      loginState.accessToken
    )
      .then((newSubjectQuestions) => {
        const newQuestionIds: string[] = newSubjectQuestions.map(
          (question) => question.question
        );
        // The reason we have to wait for mentor to reload first is because the new Q's won't be there
        if (newQuestionIds.length) {
          loadMentor();
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
      })
      .catch((err) => {
        dispatch({
          type: FollowupsActionType.FAILED_GENERATING_FOLLOWUPS,
          payload: {
            message: "Failed to save subject with new follow up questions",
            error: err.message,
          },
        });
      });
  }

  return {
    mentorId,
    curSubject,
    curCategory,
    followUpQuestions,
    followupPageState: state,
    toRecordFollowUpQs,
    fetchFollowups,
    saveAndLoadSelectedFollowups,
    setToRecordFollowUpQs,
    navigateToMyMentorPage,
  };
}
