/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAppSelector } from "store/hooks";
import { RootState } from "store/store";
import { Question } from "types";
import { loadQuestionsById, clearError, QuestionsState, clearErrors } from ".";

export interface SelectFromQuestionStateFunc<T> {
  (questionState: QuestionsState, rootState: RootState): T;
}

export interface QuestionActions {
  loadQuestions: (ids: string[], reload?: boolean) => void;
  saveQuestion: (data: Question) => void;
  clearQuestionError: (id: string) => void;
  clearQuestionErrors: () => void;
}

export function useQuestions<T>(
  selector: SelectFromQuestionStateFunc<T>,
  ids?: string[]
): T {
  const { loadQuestions } = useQuestionActions();
  const data = useAppSelector((state) => {
    return selector(state.questions, state);
  });

  useEffect(() => {
    if (ids) {
      loadQuestions(ids);
    }
  }, [ids]);

  return data;
}

export function useQuestionActions(): QuestionActions {
  const dispatch = useDispatch();
  const data = useAppSelector((state) => {
    return state.questions.questions;
  });

  function loadQuestions(ids: string[], reload = false): void {
    if (!reload) {
      const qIds = Object.keys(data);
      ids = ids.filter((i) => !qIds.includes(i));
    }
    dispatch(loadQuestionsById({ ids, reload }));
  }

  function saveQuestion(data: Question): void {
    dispatch(saveQuestion(data));
  }

  function clearQuestionError(id: string): void {
    dispatch(clearError(id));
  }

  function clearQuestionErrors(): void {
    dispatch(clearErrors());
  }

  return {
    loadQuestions,
    saveQuestion,
    clearQuestionError,
    clearQuestionErrors,
  };
}

export default useQuestions;
