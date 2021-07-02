/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { v4 as uuid } from "uuid";

import { fetchSubject, updateSubject } from "api";
import { Category, QuestionType, Subject, SubjectQuestion, Topic } from "types";
import { copyAndSet, copyAndRemove, copyAndMove } from "helpers";
import { UseData, useWithData } from "./use-with-data";

interface UseWithSubject extends UseData<Subject> {
  saveSubject: (callbackFunc?: () => void) => void;
  addCategory: () => void;
  updateCategory: (val: Category) => void;
  removeCategory: (val: Category) => void;
  addTopic: () => void;
  updateTopic: (val: Topic) => void;
  removeTopic: (val: Topic) => void;
  moveTopic: (toMove: number, moveTo: number) => void;
  addQuestion: (question?: string, categoryID?: string) => void;
  updateQuestion: (val: SubjectQuestion) => void;
  removeQuestion: (val: SubjectQuestion) => void;
  moveQuestion: (
    toMove: string,
    moveTo: string | undefined,
    category: string | undefined
  ) => void;
}

export function useWithSubject(
  subjectId: string,
  accessToken: string
): UseWithSubject {
  const {
    data,
    editedData,
    isEdited,
    isLoading,
    isSaving,
    error,
    clearError,
    editData,
    saveData,
    reloadData,
  } = useWithData<Subject>(fetch);

  function fetch() {
    if (!subjectId) {
      return new Promise<Subject>((resolve) => {
        resolve({
          _id: "",
          name: "",
          description: "",
          isRequired: false,
          categories: [],
          topics: [],
          questions: [],
        });
      });
    }
    return fetchSubject(subjectId);
  }

  function update(callBackFunc?: () => void) {
    saveData({
      callback: (editedData: Subject) =>
        updateSubject(editedData, accessToken).then(() => {
          if (callBackFunc) callBackFunc();
        }),
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

  function addQuestion(question?: string, categoryID?: string) {
    if (!editedData) {
      return;
    }
    editData({
      questions: [
        ...editedData.questions,
        {
          question: {
            _id: uuid(),
            question: question || "",
            paraphrases: [],
            type: QuestionType.QUESTION,
            name: "",
          },
          category: categoryID
            ? editedData.categories.find((c) => c.id == categoryID)
            : undefined,
          topics: [],
        },
      ],
    });
  }

  function updateQuestion(val: SubjectQuestion) {
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

  function removeQuestion(val: SubjectQuestion) {
    if (!editedData) {
      return;
    }
    const idx = editedData.questions.findIndex(
      (q) => q.question._id === val.question._id
    );
    if (idx !== -1) {
      editData({ questions: copyAndRemove(editedData.questions, idx) });
    }
  }

  function moveQuestion(
    toMove: string,
    moveTo: string | undefined,
    category: string | undefined
  ) {
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
    question.category = editedData.categories.find((c) => c.id === category);
    const qMoveTo = editedData.questions.findIndex(
      (q) => q.question._id === moveTo
    );
    if (qMoveTo !== -1) {
      editData({
        questions: copyAndMove(editedData.questions, qToMove, qMoveTo),
      });
    }
  }

  return {
    data,
    editedData,
    isEdited,
    isLoading,
    isSaving,
    error,
    clearError,
    editData,
    saveData,
    reloadData,

    saveSubject: update,
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
