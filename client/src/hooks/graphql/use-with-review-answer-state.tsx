/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useEffect, useState } from "react";
import { navigate } from "gatsby";
import { v4 as uuid } from "uuid";
import { isValidObjectId } from "mongoose";
import { addOrUpdateSubjectQuestions } from "api";
import { urlBuild, copyAndSet } from "helpers";
import useActiveMentor from "store/slices/mentor/useActiveMentor";
import useQuestions, {
  isQuestionsLoading,
  useQuestionActions,
} from "store/slices/questions/useQuestions";
import {
  Answer,
  Question,
  QuestionType,
  Status,
  Subject,
  UtteranceName,
} from "types";
import { SubjectQuestionGQL } from "types-gql";
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
  unsavedChanges: () => boolean;
  error?: LoadingError;
  getBlocks: () => RecordingBlock[];
  getAnswers: () => Answer[];
  getQuestions: () => QuestionEdits[];
  clearError: () => void;
  setError: (error: LoadingError) => void;
  selectSubject: (sId?: string) => void;
  saveChanges: () => Promise<void> | void;
  recordAnswers: (status: Status, subject: string, category: string) => void;
  recordAnswer: (question: string) => void;
  addNewQuestion: (subject: string, category?: string) => void;
  editQuestion: (question: QuestionEdits) => void;
}

export interface QuestionEdits {
  originalQuestion: Question;
  newQuestionText: string;
  unsavedChanges: boolean;
}

export function useWithReviewAnswerState(
  accessToken: string,
  search: { subject?: string }
): UseWithReviewAnswerState {
  const [error, setError] = useState<LoadingError>();
  const [selectedSubject, setSelectedSubject] = useState<string | undefined>(
    search.subject
  );
  const [blocks, setBlocks] = useState<RecordingBlock[]>([]);
  const [progress, setProgress] = useState<Progress>({ complete: 0, total: 0 });
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [subjects, setSubjects] = useState<Subject[]>();
  const [answers, setAnswers] = useState<Answer[]>();
  const [questions, setQuestions] = useState<QuestionEdits[]>();
  const { getData, isLoading: isMentorLoading, loadMentor } = useActiveMentor();

  const mentorId: string = getData((state) => state.data?._id);
  const mentorSubjects: Subject[] = getData((state) => state.data?.subjects);
  const mentorAnswers: Answer[] = getData((state) => state.data?.answers);
  const mentorQuestions = useQuestions(
    (state) => state.questions,
    mentorAnswers?.map((a) => a.question)
  );
  const questionsLoading = isQuestionsLoading(
    mentorAnswers?.map((a) => a.question)
  );
  const { loadQuestions } = useQuestionActions();

  useEffect(() => {
    setSubjects(mentorSubjects?.map((s) => ({ ...s })));
  }, [mentorSubjects]);

  useEffect(() => {
    setAnswers(mentorAnswers?.map((a) => ({ ...a })));
  }, [mentorAnswers]);

  useEffect(() => {
    setQuestions(
      Object.values(mentorQuestions)
        .filter((q) => q.question)
        .map((q) => ({
          originalQuestion: q.question!,
          newQuestionText: q.question!.question,
          // freshly loaded questions cannot have unsaved changes
          unsavedChanges: false,
        }))
    );
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
          name: `${subject.name} (Uncategorized)`,
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
            name: `${subject.name} (Uncategorized)`,
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
    setError(undefined);
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

  function addNewQuestion(subId: string, catId?: string) {
    if (!subjects || !answers || !questions || isSaving) {
      return;
    }
    const subjectIdx = subjects.findIndex((s) => s._id === subId);
    if (subjectIdx === -1) {
      return;
    }
    const newQuestion: Question = {
      _id: uuid(),
      clientId: uuid(),
      question: "",
      paraphrases: [],
      type: QuestionType.QUESTION,
      name: UtteranceName.NONE,
      mentor: mentorId,
    };
    const newAnswer: Answer = {
      _id: uuid(),
      question: newQuestion._id,
      questionClientId: newQuestion.clientId,
      hasEditedTranscript: false,
      transcript: "",
      markdownTranscript: "",
      status: Status.INCOMPLETE,
      media: undefined,
      hasUntransferredMedia: false,
    };
    let _blocks = blocks;
    const idx = _blocks.findIndex(
      (b) => b.subject === subId && b.category === catId
    );
    if (idx !== -1) {
      _blocks = copyAndSet(_blocks, idx, {
        ..._blocks[idx],
        questions: [newQuestion._id, ..._blocks[idx].questions],
      });
    }
    setQuestions([
      ...questions,
      {
        originalQuestion: newQuestion,
        newQuestionText: newQuestion.question,
        unsavedChanges: false,
      },
    ]);
    setSubjects(
      copyAndSet(subjects, subjectIdx, {
        ...subjects[subjectIdx],
        questions: [
          {
            question: newQuestion._id,
            category: subjects[subjectIdx].categories.find(
              (c) => c.id === catId
            ),
            topics: [],
          },
          ...subjects[subjectIdx].questions,
        ],
      })
    );
    setAnswers([...answers, newAnswer]);
    setBlocks(_blocks);
  }

  function editQuestion(questionEdits: QuestionEdits) {
    if (!subjects || !answers || !questions || isSaving) {
      return;
    }
    const questionIdx = questions.findIndex(
      (q) => q.originalQuestion._id === questionEdits.originalQuestion._id
    );
    if (questionIdx === -1) {
      return;
    }
    if (
      questionEdits.newQuestionText !== questionEdits.originalQuestion.question
    ) {
      questionEdits.unsavedChanges = true;
    }
    setQuestions(copyAndSet(questions, questionIdx, questionEdits));
  }

  async function saveChanges() {
    if (
      !mentorQuestions ||
      !mentorSubjects ||
      !subjects ||
      !questions ||
      !answers ||
      isMentorLoading ||
      isSaving
    ) {
      return;
    }
    setIsSaving(true);
    const editedQuestions = questions
      .filter((q) => q.originalQuestion.mentor === mentorId)
      .map((q) => ({ ...q.originalQuestion, question: q.newQuestionText }));
    const editedQuestionIds = editedQuestions.map((q) => q._id);
    return Promise.all(
      subjects
        // only update subjects that have mentor questions since we can only edit mentor questions on home screen
        ?.filter((subject) =>
          subject.questions.some((sq) =>
            editedQuestionIds.includes(sq.question)
          )
        )
        .map((subject) => {
          const subjectQuestionsGQL: SubjectQuestionGQL[] = [];
          for (const question of subject.questions.filter((sq) =>
            editedQuestionIds.includes(sq.question)
          )) {
            const mq = editedQuestions.find((q) => q._id === question.question);
            if (mq) {
              subjectQuestionsGQL.push({ ...question, question: mq });
            }
          }
          return addOrUpdateSubjectQuestions(
            subject._id,
            subjectQuestionsGQL,
            accessToken
          );
        })
    )
      .then(async () => {
        await loadMentor();
        await reloadQuestions();
        setIsSaving(false);
      })
      .catch((err) => {
        console.error(err);
        setError({ message: "Failed to save", error: err.message });
        setIsSaving(false);
      });
  }

  function getBlocks() {
    return blocks;
  }

  function getAnswers() {
    return answers || [];
  }

  function getQuestions() {
    return questions || [];
  }

  function unsavedChanges(): boolean {
    return Boolean(
      questions?.find(
        (questionEdits) =>
          questionEdits.newQuestionText !==
          questionEdits.originalQuestion.question
      )
    );
  }

  function reloadQuestions() {
    const qIds = questions
      ?.filter(
        (q) =>
          q.originalQuestion.question !== q.newQuestionText &&
          isValidObjectId(q.originalQuestion._id)
      )
      .map((q) => q.originalQuestion._id);
    if (qIds) {
      return loadQuestions(qIds, true);
    }
  }

  return {
    progress,
    selectedSubject,
    isSaving,
    error,
    unsavedChanges,
    getBlocks,
    getAnswers,
    getQuestions,
    clearError,
    setError,
    selectSubject,
    saveChanges,
    recordAnswers,
    recordAnswer,
    addNewQuestion,
    editQuestion,
  };
}
