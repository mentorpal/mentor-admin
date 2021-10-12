/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useEffect, useState } from "react";
import { navigate } from "gatsby";
import { v4 as uuid } from "uuid";

import { updateSubject } from "api";
import { urlBuild, copyAndSet } from "helpers";
import useActiveMentor from "store/slices/mentor/useActiveMentor";
import useQuestions, {
  isQuestionsLoading,
} from "store/slices/questions/useQuestions";
import {
  Answer,
  Question,
  QuestionType,
  Status,
  Subject,
  UtteranceName,
} from "types";
import { SubjectQuestionGQL, SubjectGQL } from "types-gql";
import { LoadingError } from "./loading-reducer";

interface Progress {
  complete: number;
  total: number;
}

export interface RecordingBlock {
  subject: string;
  category?: string;
  name: string;
  description: string;
  questions: string[];
}

interface UseWithReviewAnswerState {
  selectedSubject?: string;
  progress: Progress;
  isSaving: boolean;
  error?: LoadingError;

  getBlocks: () => RecordingBlock[];
  getAnswers: () => Answer[];
  getQuestions: () => Question[];

  clearError: () => void;
  selectSubject: (sId?: string) => void;
  saveChanges: () => void;
  recordAnswers: (status: Status, subject: string, category: string) => void;
  recordAnswer: (question: string) => void;
  addNewQuestion: (subject: string, category?: string) => void;
  editQuestion: (question: Question) => void;
}

export function useWithReviewAnswerState(
  accessToken: string,
  search: { subject?: string }
): UseWithReviewAnswerState {
  const [saveError, setSaveError] = useState<LoadingError>();
  const [selectedSubject, setSelectedSubject] = useState<string | undefined>(
    search.subject
  );
  const [blocks, setBlocks] = useState<RecordingBlock[]>([]);
  const [progress, setProgress] = useState<Progress>({ complete: 0, total: 0 });
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [editedSubjects, setEditedSubjects] = useState<Subject[]>();
  const [editedAnswers, setEditedAnswers] = useState<Answer[]>();
  const [editedQuestions, setEditedQuestions] = useState<Question[]>();
  const { getData, loadMentor, isLoading: isMentorLoading } = useActiveMentor();

  const mentorId = getData((state) => state.data?._id);
  const mentorSubjects = getData((state) => state.data?.subjects);
  const mentorAnswers = getData((state) => state.data?.answers);
  const mentorQuestions = useQuestions(
    (state) => state.questions,
    mentorAnswers?.map((a) => a.question)
  );
  const questionsLoading = isQuestionsLoading(
    mentorAnswers?.map((a) => a.question)
  );

  useEffect(() => {
    setEditedSubjects(mentorSubjects?.map((s) => ({ ...s })));
  }, [mentorSubjects]);

  useEffect(() => {
    setEditedAnswers(mentorAnswers?.map((a) => ({ ...a })));
  }, [mentorAnswers]);

  useEffect(() => {
    const qs = [];
    for (const q of Object.values(mentorQuestions)) {
      if (q.question) {
        qs.push(q.question);
      }
    }
    setEditedQuestions(qs);
  }, [mentorQuestions, questionsLoading]);

  useEffect(() => {
    if (!mentorSubjects || !mentorAnswers) {
      return;
    }
    const _blocks: RecordingBlock[] = [];
    const subject = mentorSubjects?.find((s) => s._id === selectedSubject);
    if (subject) {
      const uncategorizedQuestions = subject.questions
        .filter((sq) => !sq.category)
        .map((sq) => sq.question);
      const subjectAnswers = mentorAnswers.filter((a) =>
        subject.questions.map((q) => q.question).includes(a.question)
      );
      if (uncategorizedQuestions.length > 0) {
        _blocks.push({
          subject: subject._id,
          category: undefined,
          name: subject.name,
          description: subject.description,
          questions: uncategorizedQuestions,
        });
      }
      subject.categories.forEach((c) => {
        const categoryQuestions = subject.questions
          .filter((sq) => sq.category?.id === c.id)
          .map((sq) => sq.question);
        if (categoryQuestions.length > 0) {
          _blocks.push({
            subject: subject._id,
            category: c.id,
            name: c.name,
            description: c.description,
            questions: categoryQuestions,
          });
        }
      });
      setProgress({
        complete: subjectAnswers.filter((a) => a.status === Status.COMPLETE)
          .length,
        total: subjectAnswers.length,
      });
    } else {
      mentorSubjects.forEach((subject) => {
        const uncategorizedQuestions = subject.questions
          .filter((sq) => !sq.category)
          .map((sq) => sq.question);
        if (uncategorizedQuestions.length > 0) {
          _blocks.push({
            subject: subject._id,
            category: undefined,
            name: subject.name,
            description: subject.description,
            questions: uncategorizedQuestions,
          });
        }
        subject.categories.forEach((c) => {
          const categoryQuestions = subject.questions
            .filter((sq) => sq.category?.id === c.id)
            .map((sq) => sq.question);
          if (categoryQuestions.length > 0) {
            _blocks.push({
              subject: subject._id,
              category: c.id,
              name: c.name,
              description: c.description,
              questions: categoryQuestions,
            });
          }
        });
      });
      setProgress({
        complete: mentorAnswers.filter((a) => a.status === Status.COMPLETE)
          .length,
        total: mentorAnswers.length,
      });
    }
    setBlocks(_blocks);
  }, [mentorSubjects, mentorAnswers, selectedSubject]);

  function clearError() {
    setSaveError(undefined);
  }

  function selectSubject(sId?: string) {
    setSelectedSubject(sId || "");
  }

  function recordAnswers(status: Status, subject: string, category: string) {
    navigate(
      urlBuild("/record", {
        status,
        subject,
        category,
        back: urlBuild(
          "/",
          selectedSubject ? { subject: selectedSubject } : {}
        ),
      })
    );
  }

  function recordAnswer(question: string) {
    navigate(
      urlBuild("/record", {
        videoId: question,
        back: urlBuild(
          "/",
          selectedSubject ? { subject: selectedSubject } : {}
        ),
      })
    );
  }

  function addNewQuestion(subject: string, category?: string) {
    if (!editedSubjects || !editedAnswers || !editedQuestions || isSaving) {
      return;
    }
    const subjectIdx = editedSubjects.findIndex((s) => s._id === subject);
    if (subjectIdx === -1) {
      return;
    }
    const newQuestion = {
      _id: uuid(),
      question: "",
      paraphrases: [],
      type: QuestionType.QUESTION,
      name: UtteranceName.NONE,
      mentor: mentorId,
    };
    const newAnswer = {
      _id: uuid(),
      question: newQuestion._id,
      transcript: "",
      status: Status.INCOMPLETE,
      media: undefined,
      hasUntransferredMedia: false,
    };
    let _blocks = blocks;
    const idx = _blocks.findIndex(
      (b) => b.subject === subject && b.category === category
    );
    if (idx !== -1) {
      _blocks = copyAndSet(_blocks, idx, {
        ..._blocks[idx],
        questions: [newQuestion._id, ..._blocks[idx].questions],
      });
    }
    setEditedQuestions([newQuestion, ...editedQuestions]);
    setEditedSubjects(
      copyAndSet(editedSubjects, subjectIdx, {
        ...editedSubjects[subjectIdx],
        questions: [
          {
            question: newQuestion._id,
            category: editedSubjects[subjectIdx].categories.find(
              (c) => c.id === category
            ),
            topics: [],
          },
          ...editedSubjects[subjectIdx].questions,
        ],
      })
    );
    setEditedAnswers([newAnswer, ...editedAnswers]);
    setBlocks(_blocks);
  }

  function editQuestion(question: Question) {
    if (!editedSubjects || !editedAnswers || !editedQuestions || isSaving) {
      return;
    }
    const questionIdx = editedQuestions.findIndex(
      (q) => q._id === question._id
    );
    if (questionIdx === -1) {
      return;
    }
    setEditedQuestions(copyAndSet(editedQuestions, questionIdx, question));
  }

  function saveChanges() {
    if (
      !mentorQuestions ||
      !mentorSubjects ||
      !editedSubjects ||
      !editedQuestions ||
      !editedAnswers ||
      isMentorLoading ||
      isSaving
    ) {
      return;
    }
    setIsSaving(true);
    console.warn(
      "MUST FIX: batch the sequence of updateSubject async calls below into a single batch GQL update/request"
    );
    Promise.all(
      editedSubjects?.map((subject) => {
        const subjectQuestionsGQL: SubjectQuestionGQL[] = [];
        for (const sq of subject.questions) {
          const q = editedQuestions.find((q) => q._id === sq.question);
          if (q) {
            subjectQuestionsGQL.push({ ...sq, question: q });
          }
        }
        const subjectGQL: SubjectGQL = {
          ...subject,
          questions: subjectQuestionsGQL,
        };
        return updateSubject(subjectGQL, accessToken);
      })
    )
      .then(() => {
        loadMentor();
        setIsSaving(false);
      })
      .catch((err) => {
        console.error(err);
        setSaveError({ message: "Failed to save", error: err.message });
        setIsSaving(false);
      });
  }

  function getBlocks() {
    return blocks;
  }

  function getAnswers() {
    return editedAnswers || [];
  }

  function getQuestions() {
    return editedQuestions || [];
  }

  return {
    progress,
    selectedSubject,
    isSaving,
    error: saveError,

    getBlocks,
    getAnswers,
    getQuestions,
    clearError,
    selectSubject,
    saveChanges,
    recordAnswers,
    recordAnswer,
    addNewQuestion,
    editQuestion,
  };
}
