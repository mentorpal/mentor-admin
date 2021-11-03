/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { fetchFollowUpQuestions, updateSubject } from "api";
import { navigate } from "gatsby";
import { urlBuild } from "helpers";
import { useReducer, useState } from "react";
import { useEffect } from "react";
import { useWithLogin } from "store/slices/login/useWithLogin";
import useActiveMentor from "store/slices/mentor/useActiveMentor";
import {
  Answer,
  Category,
  Mentor,
  Question,
  QuestionType,
  Subject,
  UtteranceName,
} from "types";
import { v4 as uuid } from "uuid";
import {
  FollowupsPageStatusType,
  FollowupsPageState,
  FollowupsReducer,
  FollowupsActionType,
} from "./followups-reducer";
import useQuestions, {
  isQuestionsLoading,
} from "store/slices/questions/useQuestions";
import { convertSubjectGQL, SubjectGQL, SubjectQuestionGQL } from "types-gql";

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
  const mentorId = getData((state) => state.data?._id);
  const mentorAnswers: Answer[] = getData((state) => state.data?.answers);
  const mentorQuestionsRecord = useQuestions(
    (state) => state.questions,
    mentorAnswers?.map((a) => a.question)
  );
  const [mentorQuestions, setMentorQuestions] = useState<Question[]>();
  const questionsLoading = isQuestionsLoading(
    mentorAnswers?.map((a) => a.question)
  );
  const { categoryId, subjectId } = props;
  const curSubject: Subject = getData((state) =>
    state.data?.subjects.find((s) => s._id == subjectId)
  );
  const curCategory = curSubject?.categories.find((c) => c.id === categoryId);

  useEffect(() => {
    const qs = [];
    for (const q of Object.values(mentorQuestionsRecord)) {
      if (q.question) {
        qs.push(q.question);
      }
    }
    setMentorQuestions(qs);
  }, [mentorQuestionsRecord, questionsLoading]);

  function fetchFollowups() {
    if (!mentorAnswers || !loginState.accessToken) {
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
      !toRecordFollowUpQs ||
      !mentorQuestions
    ) {
      return;
    }
    dispatch({ type: FollowupsActionType.SAVING_SELECTED_FOLLOWUPS });
    const newQuestions: SubjectQuestionGQL[] = toRecordFollowUpQs.map(
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

    const subjectQuestionsGQL: SubjectQuestionGQL[] = [];
    for (const sq of curSubject.questions) {
      const q = mentorQuestions.find((q) => q._id === sq.question);
      if (q) {
        subjectQuestionsGQL.push({ ...sq, question: q });
      }
    }
    const subjectGQL: SubjectGQL = {
      ...curSubject,
      questions: [...subjectQuestionsGQL, ...newQuestions],
    };
    //subject
    const oldSubjectQs = curSubject.questions;
    updateSubject(subjectGQL, loginState.accessToken)
      .then((subjectGQL) => {
        const subject = convertSubjectGQL(subjectGQL);
        //compare new subject questions to old subject questions
        const newQuestionIds: string[] = subject.questions
          .filter(
            (newQuestionId) =>
              !oldSubjectQs.find(
                (oldId) => oldId.question === newQuestionId.question
              )
          )
          .map((question) => question.question);
        //TODO: The reason we have to wait for mentor to reload first is because the new Q's won't be there
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
    fetchFollowups,
    followupPageState: state,
    saveAndLoadSelectedFollowups,
    toRecordFollowUpQs,
    setToRecordFollowUpQs,
    navigateToMyMentorPage,
  };
}
