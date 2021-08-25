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
import { useWithTraining } from "hooks/task/use-with-train";
import useActiveMentor, {
  isActiveMentorLoading,
  useActiveMentorActions,
} from "store/slices/mentor/useActiveMentor";
import {
  useMentorEdits,
  UseMentorEdits,
} from "store/slices/mentor/useMentorEdits";
import useQuestions, {
  isQuestionsLoading,
} from "store/slices/questions/useQuestions";
import {
  Question,
  Status,
  Subject,
  Answer,
  Category,
  QuestionType,
  UtteranceName,
} from "types";
import { SubjectQuestionGQL, SubjectGQL, AnswerGQL } from "types-gql";
import { LoadingError } from "./loading-reducer";
import { loadMentor } from "store/slices/mentor";

interface Progress {
  complete: number;
  total: number;
}

export interface RecordingBlock {
  name: string;
  description: string;
  answers: AnswerGQL[];
  recordAll: (status: Status) => void;
  recordOne: (question: Question) => void;
  editQuestion: (question: Question) => void;
  addQuestion?: () => void;
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
  const [editedQuestions, setEditedQuestions] = useState<Question[]>();
  const [editedSubjects, setEditedSubjects] = useState<Subject[]>();
  const [editedAnswers, setEditedAnswers] = useState<Answer[]>();

  const mentorId = useActiveMentor((state) => state.data?._id);
  const mentorSubjects = useActiveMentor((state) => state.data?.subjects);
  const mentorAnswers = useActiveMentor((state) => state.data?.answers);
  const mentorQuestions = useQuestions(
    (state) => state.questions,
    mentorAnswers?.map((a) => a.question)
  );
  const questionsLoading = isQuestionsLoading(
    mentorAnswers?.map((a) => a.question)
  );
  const mentorError = useActiveMentor((state) => state.error);
  const isMentorLoading = isActiveMentorLoading();
  const { clearMentorError } = useActiveMentorActions();

  const useMentor = useMentorEdits();
  const { editedMentor, saveMentorDetails } = useMentor;
  const {
    isPolling: isTraining,
    error: trainError,
    startTask: startTraining,
    clearError: clearTrainingError,
  } = useWithTraining();

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
    if (!editedSubjects || !editedQuestions || !editedAnswers) {
      return;
    }
    const _blocks: RecordingBlock[] = [];
    const subject = editedSubjects?.find((s) => s._id === selectedSubject);
    if (subject) {
      const uncategorizedQuestions = subject.questions
        .filter((sq) => !sq.category)
        .map((sq) => sq.question);
      const subjectAnswers = editedAnswers.filter((a) =>
        subject.questions.map((q) => q.question).includes(a.question)
      );
      if (uncategorizedQuestions.length > 0) {
        _blocks.push({
          name: subject.name,
          description: subject.description,
          answers: editedAnswers
            .filter((a) => uncategorizedQuestions.includes(a.question))
            .map((a) => ({
              ...a,
              question: editedQuestions.find((q) => q._id === a.question)!,
            })),
          recordAll: (status) => recordAnswers(status, subject._id, ""),
          recordOne: recordAnswer,
          addQuestion: () => addNewQuestion(subject, undefined),
          editQuestion,
        });
      }
      subject.categories.forEach((c) => {
        const categoryQuestions = subject.questions
          .filter((sq) => sq.category?.id === c.id)
          .map((sq) => sq.question);
        if (categoryQuestions.length > 0) {
          _blocks.push({
            name: c.name,
            description: c.description,
            answers: editedAnswers
              .filter((a) => categoryQuestions.includes(a.question))
              .map((a) => ({
                ...a,
                question: editedQuestions.find((q) => q._id === a.question)!,
              })),
            recordAll: (status) => recordAnswers(status, subject._id, c.id),
            recordOne: recordAnswer,
            addQuestion: () => addNewQuestion(subject, c),
            editQuestion,
          });
        }
      });
      setProgress({
        complete: subjectAnswers.filter((a) => a.status === Status.COMPLETE)
          .length,
        total: subjectAnswers.length,
      });
    } else {
      editedSubjects.forEach((subject) => {
        const uncategorizedQuestions = subject.questions
          .filter((sq) => !sq.category)
          .map((sq) => sq.question);
        if (uncategorizedQuestions.length > 0) {
          _blocks.push({
            name: subject.name,
            description: subject.description,
            answers: editedAnswers
              .filter((a) => uncategorizedQuestions.includes(a.question))
              .map((a) => ({
                ...a,
                question: editedQuestions.find((q) => q._id === a.question)!,
              })),
            recordAll: (status) => recordAnswers(status, subject._id, ""),
            recordOne: recordAnswer,
            addQuestion: () => addNewQuestion(subject, undefined),
            editQuestion,
          });
        }
        subject.categories.forEach((c) => {
          const categoryQuestions = subject.questions
            .filter((sq) => sq.category?.id === c.id)
            .map((sq) => sq.question);
          if (categoryQuestions.length > 0) {
            _blocks.push({
              name: c.name,
              description: c.description,
              answers: editedAnswers
                .filter((a) => categoryQuestions.includes(a.question))
                .map((a) => ({
                  ...a,
                  question: editedQuestions.find((q) => q._id === a.question)!,
                })),
              recordAll: (status) => recordAnswers(status, subject._id, c.id),
              recordOne: recordAnswer,
              addQuestion: () => addNewQuestion(subject, c),
              editQuestion,
            });
          }
        });
      });
      setProgress({
        complete: editedAnswers.filter((a) => a.status === Status.COMPLETE)
          .length,
        total: editedAnswers.length,
      });
    }
    setBlocks(_blocks);
  }, [editedSubjects, editedQuestions, editedAnswers, selectedSubject]);

  function clearError() {
    clearMentorError();
    clearTrainingError();
    setSaveError(undefined);
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

  function recordAnswer(question: Question) {
    navigate(
      urlBuild("/record", {
        videoId: question._id,
        back: urlBuild(
          "/",
          selectedSubject ? { subject: selectedSubject } : {}
        ),
      })
    );
  }

  function selectSubject(sId?: string) {
    setSelectedSubject(sId || "");
  }

  function addNewQuestion(subject: Subject, category?: Category) {
    if (!editedSubjects || !editedAnswers || !editedQuestions || isSaving) {
      return;
    }
    const subjectIdx = editedSubjects.findIndex((s) => s._id === subject._id);
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
    setEditedQuestions([newQuestion, ...editedQuestions]);
    setEditedSubjects(
      copyAndSet(editedSubjects, subjectIdx, {
        ...editedSubjects[subjectIdx],
        questions: [
          { question: newQuestion._id, category: category, topics: [] },
          ...editedSubjects[subjectIdx].questions,
        ],
      })
    );
    setEditedAnswers([newAnswer, ...editedAnswers]);
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
      !editedMentor ||
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
        saveMentorDetails();
        loadMentor({ mentorId: editedMentor._id });
        setIsSaving(false);
      })
      .catch((err) => {
        console.error(err);
        setSaveError({ message: "Failed to save", error: err.message });
        setIsSaving(false);
      });
  }

  return {
    useMentor,
    blocks,
    progress,
    selectedSubject,
    isLoading: isMentorLoading,
    isSaving,
    isTraining,
    error: mentorError || trainError || saveError,
    clearError,
    selectSubject,
    saveChanges,
    startTraining,
  };
}

interface UseWithReviewAnswerState {
  useMentor: UseMentorEdits;
  blocks: RecordingBlock[];
  progress: Progress;
  selectedSubject?: string;
  isLoading: boolean;
  isSaving: boolean;
  isTraining: boolean;
  error?: LoadingError;
  clearError: () => void;
  selectSubject: (sId?: string) => void;
  saveChanges: () => void;
  startTraining: (params: string) => void;
}
