/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { v4 as uuid } from "uuid";

import { fetchSubject, updateSubject } from "api";
import { copyAndSet, copyAndRemove, copyAndMove } from "helpers";
import { useWithData } from "hooks/graphql/use-with-data";
import {
  Category,
  Topic,
  QuestionType,
  UtteranceName,
  Question,
  SubjectTypes,
  UserRole,
} from "types";
import { SubjectGQL, SubjectQuestionGQL } from "types-gql";
import { LoadingError } from "./loading-reducer";
import useActiveMentor from "store/slices/mentor/useActiveMentor";
import { useWithLogin } from "store/slices/login/useWithLogin";

export interface NewQuestionArgs {
  question?: Question;
  categoryId?: string;
  mentorId?: string;
}

interface UseWithSubject {
  editedData: SubjectGQL | undefined;
  isEdited: boolean;
  isLoading: boolean;
  isSaving: boolean;
  error: LoadingError | undefined;
  userCanArchiveSubjects: boolean;
  editData: (d: Partial<SubjectGQL>) => void;
  saveSubject: () => void;
  addCategory: () => void;
  updateCategory: (val: Category) => void;
  removeCategory: (val: Category) => void;
  addTopic: () => void;
  updateTopic: (val: Topic) => void;
  removeTopic: (val: Topic) => void;
  moveTopic: (toMove: number, moveTo: number) => void;
  addQuestion: (q?: NewQuestionArgs) => void;
  updateQuestion: (val: SubjectQuestionGQL) => void;
  removeQuestion: (val: SubjectQuestionGQL) => void;
  moveQuestion: (toMove: string, moveTo: number, category?: string) => void;
}

export function useWithSubject(
  subjectId: string,
  accessToken: string
): UseWithSubject {
  const { loadMentor } = useActiveMentor();
  const {
    editedData,
    isEdited,
    isLoading,
    isSaving,
    error,
    editData,
    saveAndReturnData,
  } = useWithData<SubjectGQL>(fetch);
  const { state } = useWithLogin();
  const canArchiveSubjects =
    state.user?.userRole === UserRole.ADMIN ||
    state.user?.userRole === UserRole.CONTENT_MANAGER;

  const isUtteranceSubject = editedData?.type === SubjectTypes.UTTERANCES;

  function fetch() {
    if (!subjectId) {
      return new Promise<SubjectGQL>((resolve) => {
        resolve({
          _id: "",
          name: "",
          type: SubjectTypes.SUBJECT,
          description: "",
          isRequired: false,
          isArchived: false,
          categories: [],
          topics: [],
          questions: [],
        });
      });
    }
    return fetchSubject(subjectId);
  }

  function saveSubject() {
    saveAndReturnData({
      action: async (editedData: SubjectGQL) => {
        const updated = await updateSubject(editedData, accessToken);
        // we need to reload the mentor after updating a subject because
        // the subjects and questions and answers might have changed
        // would be better to edit in place but for now do the easy (but more expensive) way and
        // change this later if needed
        // this doesn't happen very often anyway
        loadMentor();
        return updated;
      },
    });
  }

  function addCategory() {
    if (!editedData) {
      return;
    }
    editData({
      categories: [
        ...editedData.categories,
        {
          id: uuid(),
          name: "",
          description: "",
        },
      ],
    });
  }

  function updateCategory(val: Category) {
    if (!editedData) {
      return;
    }
    const idx = editedData.categories.findIndex((c) => c.id === val.id);
    if (idx !== -1) {
      editData({ categories: copyAndSet(editedData.categories, idx, val) });
    }
  }

  function removeCategory(val: Category) {
    if (!editedData) {
      return;
    }
    const idx = editedData.categories.findIndex((c) => c.id === val.id);
    if (idx !== -1) {
      editData({
        categories: copyAndRemove(editedData.categories, idx),
        questions: [
          ...editedData.questions.map((q) => {
            if (q.category?.id === val.id) {
              return {
                ...q,
                category: undefined,
              };
            }
            return q;
          }),
        ],
      });
    }
  }

  function addTopic() {
    if (!editedData) {
      return;
    }
    editData({
      topics: [
        ...editedData.topics,
        {
          id: uuid(),
          name: "",
          description: "",
        },
      ],
    });
  }

  function updateTopic(val: Topic) {
    if (!editedData) {
      return;
    }
    const idx = editedData.topics.findIndex((t) => t.id === val.id);
    if (idx !== -1) {
      editData({ topics: copyAndSet(editedData.topics, idx, val) });
    }
  }

  function removeTopic(val: Topic) {
    if (!editedData) {
      return;
    }
    const idx = editedData.topics.findIndex((t) => t.id === val.id);
    if (idx !== -1) {
      editData({ topics: copyAndRemove(editedData.topics, idx) });
    }
  }

  function moveTopic(toMove: number, moveTo: number) {
    if (!editedData) {
      return;
    }
    editData({ topics: copyAndMove(editedData.topics, toMove, moveTo) });
  }

  function addQuestion(args?: NewQuestionArgs) {
    if (!editedData) {
      return;
    }
    editData({
      questions: [
        ...editedData.questions,
        {
          question: args?.question || {
            _id: uuid(),
            clientId: uuid(),
            question: "",
            paraphrases: [],
            type: isUtteranceSubject
              ? QuestionType.UTTERANCE
              : QuestionType.QUESTION,
            name: UtteranceName.NONE,
          },
          category: args?.categoryId
            ? editedData.categories.find((c) => c.id == args.categoryId)
            : undefined,
          topics: [],
        },
      ],
    });
  }

  function updateQuestion(val: SubjectQuestionGQL) {
    if (!editedData) {
      return;
    }
    const idx = editedData.questions.findIndex(
      (q) => q.question._id === val.question._id
    );
    if (idx !== -1) {
      editData({ questions: copyAndSet(editedData.questions, idx, val) });
    }
  }

  function removeQuestion(val: SubjectQuestionGQL) {
    if (!editedData) {
      return;
    }
    const idx = editedData.questions.findIndex(
      (q) => q.question._id === val.question._id
    );
    if (idx !== -1) {
      const questions = copyAndRemove(editedData.questions, idx);
      editData({ questions });
    }
  }

  function moveQuestion(toMove: string, moveTo: number, cId?: string) {
    if (!editedData) {
      return;
    }
    const qToMove = editedData.questions.findIndex(
      (q) => q.question._id === toMove
    );
    if (qToMove === -1) {
      return;
    }
    const question = editedData.questions[qToMove];
    const category = editedData.categories.find((c) => c.id === cId);
    const questions = editedData.questions.filter(
      (q) => q.category?.id === cId
    );
    const qMoveTo = editedData.questions.findIndex(
      (q) => q.question._id === questions[moveTo]?.question?._id
    );
    question.category = category;
    editData({
      questions: copyAndMove(
        editedData.questions,
        qToMove,
        qMoveTo === -1 ? editedData.questions.length - 1 : qMoveTo
      ),
    });
  }

  return {
    editedData,
    isEdited,
    isLoading,
    isSaving,
    error,
    userCanArchiveSubjects: canArchiveSubjects,
    editData,
    saveSubject,
    addCategory,
    updateCategory,
    removeCategory,
    addTopic,
    updateTopic,
    removeTopic,
    moveTopic,
    addQuestion,
    updateQuestion,
    removeQuestion,
    moveQuestion,
  };
}
