/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { v4 as uuid } from "uuid";

import { fetchSubject, updateSubject } from "api";
import { Category, QuestionType, Subject, SubjectQuestion, Topic } from "types";
import { useWithData } from "./use-with-data";

function copyAndRemove<T>(a: T[], i: number): T[] {
  return [...a.slice(0, i), ...a.slice(i + 1)];
}

function copyAndSet<T>(a: T[], i: number, item: T): T[] {
  return [...a.slice(0, i), item, ...a.slice(i + 1)];
}

function copyAndMove<T>(a: T[], moveFrom: number, moveTo: number): T[] {
  const item = a[moveFrom];
  const removed = copyAndRemove(a, moveFrom);
  return [...removed.slice(0, moveTo), item, ...removed.slice(moveTo)];
}

export function useWithSubject(subjectId: string, accessToken: string) {
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
  } = useWithData<Subject>(fetch, update);

  function fetch() {
    if (!subjectId) {
      return new Promise<Subject>((resolve, reject) => {
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

  function update(editedData: Subject) {
    return updateSubject(editedData, accessToken);
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

  function addQuestion() {
    if (!editedData) {
      return;
    }
    editData({
      questions: [
        ...editedData.questions,
        {
          question: {
            _id: uuid(),
            question: "",
            paraphrases: [],
            type: QuestionType.QUESTION,
            name: "",
          },
          category: undefined,
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
    subject: data,
    editedSubject: editedData,
    isSubjectEdited: isEdited,
    isSubjectLoading: isLoading,
    isSubjectSaving: isSaving,
    subjectError: error,
    clearSubjectError: clearError,
    editSubject: editData,
    saveSubject: saveData,
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
