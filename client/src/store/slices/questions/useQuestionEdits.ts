// /*
// This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved.
// Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

// The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
// */
// import { useEffect, useState } from "react";
// import { v4 as uuid } from "uuid";

// import { Question, QuestionType, UtteranceName } from "types";
// import { getValueIfKeyExists, equals } from "helpers";
// import useQuestions, { isQuestionsLoading, isQuestionsSaving, useQuestionActions } from "./useQuestions";

// interface QuestionEdit {
//   question: Question;
//   editedQuestion: Question;
//   // isQuestionEdited: boolean;
//   // editQuestion: (data: Partial<Question>) => void;
//   // saveQuestion: () => void;
// }

// interface UseQuestionEdits {
//   editedQuestions: Record<string, QuestionEdit>;
//   isQuestionEdited: (idx?: number) => boolean;
//   editQuestion: (idx: number, data: Partial<Question>) => void;
//   saveQuestion: (idx: number) => void;
//   saveQuestions: () => void;
// }

// const DEFAULT_QUESTION = {
//   _id: uuid(),
//   question: "",
//   paraphrases: [],
//   type: QuestionType.QUESTION,
//   name: UtteranceName.NONE,
// };

// export function useQuestionEdits(ids: string[]): UseQuestionEdits {
//   const questions = useQuestions(state => state.questions, ids);
//   const questionsLoading = isQuestionsLoading(ids);
//   const questionsSaving = isQuestionsSaving(ids);

//   const [editedQuestions, setEditedQuestions] = useState<QuestionEdit[]>();

//   useEffect(() => {
//     const qs: QuestionEdit[] = [];
//     for (const [k, v] of Object.entries(questions)) {
//       if (v.question) {
//         qs.push({
//           question: v.question,
//           editedQuestion: {...v.question},
//         })
//       }
//     }
//     setEditedQuestions(qs);
//   }, [questions]);

//   function isQuestionEdited(idx?: number): boolean {
//     if (idx !== undefined) {
//       return equals()
//     }
//   }

//   return {
//     editedQuestions,

//   }
// }
