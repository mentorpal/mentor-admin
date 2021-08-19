/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import {
  copyAndSet,
  copyAndRemove,
  copyAndMove,
  getValueIfKeyExists,
  equals,
} from "helpers";
import { Subject, Category, Topic, QuestionType, UtteranceName } from "types";
import useSubjects, { useSubjectActions } from "./useSubjects";
import { SubjectGQL, SubjectQuestionGQL } from "types-gql";
import useQuestions from "../questions/useQuestions";

export interface NewQuestionArgs {
  question: string;
  categoryId: string;
  mentorId: string;
}

interface UseSubjectEdits {
  editedSubject: SubjectGQL;
  isSubjectEdited: boolean;
  editSubject: (data: Partial<SubjectGQL>) => void;
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
  moveQuestion: (toMove: string, moveTo?: string, category?: string) => void;
}

const DEFAULT_SUBJECT = {
  _id: "",
  name: "",
  description: "",
  isRequired: false,
  categories: [],
  topics: [],
  questions: [],
};

export function useSubjectEdits(subjectId?: string): UseSubjectEdits {
  const subject = subjectId
    ? useSubjects(
        (state) =>
          getValueIfKeyExists(subjectId, state.subjects)?.subject ||
          DEFAULT_SUBJECT,
        [subjectId]
      )
    : DEFAULT_SUBJECT;
  const questions = useQuestions(
    (state) => state.questions,
    subject?.questions.map((sq) => sq.question)
  );
  const subjectGQL = toSubjectGQL(subject);
  const [editedSubject, setEditedSubject] = useState<SubjectGQL>(subjectGQL);
  const isSubjectEdited = !equals(subjectGQL, editedSubject);
  const { saveSubject: saveData } = useSubjectActions();

  useEffect(() => {
    setEditedSubject(toSubjectGQL(subject));
  }, [subject]);

  function toSubjectGQL(subject: Subject): SubjectGQL {
    return {
      ...subject,
      questions: subject.questions.map((sq) => ({
        category: subject.categories.find((c) => c.id === sq.category),
        topics: subject.topics.filter((t) => sq.topics.includes(t.id)),
        question: getValueIfKeyExists(sq.question, questions)?.question!,
      })),
    };
  }

  function editSubject(edits: Partial<SubjectGQL>): void {
    setEditedSubject({ ...editedSubject, ...edits });
  }

  function saveSubject(): void {
    if (isSubjectEdited) {
      saveData(editedSubject);
    }
  }

  function addCategory() {
    if (!editedSubject) {
      return;
    }
    editSubject({
      categories: [
        ...editedSubject.categories,
        {
          id: uuid(),
          name: "",
          description: "",
        },
      ],
    });
  }

  function updateCategory(val: Category) {
    if (!editedSubject) {
      return;
    }
    const idx = editedSubject.categories.findIndex((c) => c.id === val.id);
    if (idx !== -1) {
      editSubject({
        categories: copyAndSet(editedSubject.categories, idx, val),
      });
    }
  }

  function removeCategory(val: Category) {
    if (!editedSubject) {
      return;
    }
    const idx = editedSubject.categories.findIndex((c) => c.id === val.id);
    if (idx !== -1) {
      editSubject({
        categories: copyAndRemove(editedSubject.categories, idx),
        questions: [
          ...editedSubject.questions.map((q) => {
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
    if (!editedSubject) {
      return;
    }
    editSubject({
      topics: [
        ...editedSubject.topics,
        {
          id: uuid(),
          name: "",
          description: "",
        },
      ],
    });
  }

  function updateTopic(val: Topic) {
    if (!editedSubject) {
      return;
    }
    const idx = editedSubject.topics.findIndex((t) => t.id === val.id);
    if (idx !== -1) {
      editSubject({ topics: copyAndSet(editedSubject.topics, idx, val) });
    }
  }

  function removeTopic(val: Topic) {
    if (!editedSubject) {
      return;
    }
    const idx = editedSubject.topics.findIndex((t) => t.id === val.id);
    if (idx !== -1) {
      editSubject({ topics: copyAndRemove(editedSubject.topics, idx) });
    }
  }

  function moveTopic(toMove: number, moveTo: number) {
    if (!editedSubject) {
      return;
    }
    editSubject({ topics: copyAndMove(editedSubject.topics, toMove, moveTo) });
  }

  function addQuestion(q?: NewQuestionArgs) {
    if (!editedSubject) {
      return;
    }
    editSubject({
      questions: [
        ...editedSubject.questions,
        {
          question: {
            _id: uuid(),
            question: q?.question || "",
            paraphrases: [],
            type: QuestionType.QUESTION,
            name: UtteranceName.NONE,
            mentor: q?.mentorId || undefined,
          },
          category: q?.categoryId
            ? editedSubject.categories.find((c) => c.id == q.categoryId)
            : undefined,
          topics: [],
        },
      ],
    });
  }

  function updateQuestion(val: SubjectQuestionGQL) {
    if (!editedSubject) {
      return;
    }
    const idx = editedSubject.questions.findIndex(
      (q) => q.question._id === val.question._id
    );
    if (idx !== -1) {
      editSubject({ questions: copyAndSet(editedSubject.questions, idx, val) });
    }
  }

  function removeQuestion(val: SubjectQuestionGQL) {
    if (!editedSubject) {
      return;
    }
    const idx = editedSubject.questions.findIndex(
      (q) => q.question === val.question
    );
    if (idx !== -1) {
      editSubject({ questions: copyAndRemove(editedSubject.questions, idx) });
    }
  }

  function moveQuestion(toMove: string, moveTo?: string, category?: string) {
    if (!editedSubject) {
      return;
    }
    const qToMove = editedSubject.questions.findIndex(
      (q) => q.question._id === toMove
    );
    if (qToMove === -1) {
      return;
    }
    const question = editedSubject.questions[qToMove];
    if (question.category) {
      question.category.id =
        editedSubject.categories.find((c) => c.id === category)?.id || "";
    }
    const qMoveTo = editedSubject.questions.findIndex(
      (q) => q.question._id === moveTo
    );
    if (qMoveTo !== -1) {
      editSubject({
        questions: copyAndMove(editedSubject.questions, qToMove, qMoveTo),
      });
    }
  }

  return {
    editedSubject,
    isSubjectEdited,
    editSubject,
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
