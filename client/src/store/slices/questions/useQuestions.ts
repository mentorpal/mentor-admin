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
import { loadQuestionsById } from ".";

export interface UseQuestions {
  getQuestions: (ids?: string[]) => Question[];
  loadQuestions: (ids?: string[], reload?: boolean) => void;
}

export function useQuestions(): UseQuestions {
  const dispatch = useDispatch();
  const questions = useAppSelector((state) => {
    return state.questions.questions;
  });

  function getQuestions(ids?: string[]): Question[] {
    const q: Question[] = [];
    for (const [id, question] of Object.entries(questions)) {
      if (!ids || ids.includes(id)) {
        q.push(question);
      }
    }
    return q;
  }

  function loadQuestions(ids?: string[], reload = false): void {
    if (!reload && ids) {
    }

    dispatch(loadQuestionsById(ids));
  }

  return {
    getQuestions,
    loadQuestions,
  };
}

export default useQuestions;
