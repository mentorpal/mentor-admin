/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useEffect, useState } from "react";
import { navigate } from "gatsby";
import { v4 as uuid } from "uuid";
import { copyAndSet, getValueIfKeyExists, urlBuild } from "helpers";
import { useWithTraining } from "hooks/task/use-with-train";
import { LoadingError } from "./loading-reducer";
import {
  UseMentorEdits,
  useMentorEdits,
} from "store/slices/mentor/useMentorEdits";
import useActiveMentor, {
  isActiveMentorLoading,
  isActiveMentorSaving,
  useActiveMentorActions,
} from "store/slices/mentor/useActiveMentor";
import { Status, Question, Category, QuestionType, UtteranceName } from "types";
import { Answer, Subject, SubjectQuestion } from "types";
import useSubjects from "store/slices/subjects/useSubjects";
import { SubjectStatus } from "store/slices/subjects";

interface Progress {
  complete: number;
  total: number;
}

export interface RecordingBlock {
  name: string;
  description: string;
  answers: Answer[];
  recordAll: (status: Status) => void;
  recordOne: (answer: Answer) => void;
  editQuestion: (question: Question) => void;
  addQuestion?: () => void;
}

export function useWithReviewAnswerState(search: {
  subject?: string;
}): UseWithReviewAnswerState {
  const [selectedSubject, setSelectedSubject] = useState<string | undefined>(
    search.subject
  );
  const [blocks, setBlocks] = useState<RecordingBlock[]>([]);
  const [progress, setProgress] = useState<Progress>({ complete: 0, total: 0 });

  const mentorSubjects = useActiveMentor((state) => state.data?.subjects);
  const mentorError = useActiveMentor((state) => state.error);
  const isMentorLoading = isActiveMentorLoading();
  const isMentorSaving = isActiveMentorSaving();

  const subjects = useSubjects((state) => state.subjects, mentorSubjects);
  const isSubjectsSaving = useSubjects(
    (state) => state.status === SubjectStatus.SAVING,
    mentorSubjects
  );
  const isSaving = isMentorSaving || isSubjectsSaving;
  const saveError = useActiveMentor((state) => state.error);

  const { clearMentorError } = useActiveMentorActions();
  const useMentor = useMentorEdits();
  const { editedMentor, isMentorEdited, editMentor, saveMentorDetails } =
    useMentor;
  const {
    isPolling: isTraining,
    error: trainError,
    startTask: startTraining,
    clearError: clearTrainingError,
  } = useWithTraining();

  useEffect(() => {
    if (!editedMentor || isMentorLoading || isSaving) {
      return;
    }
    const _blocks: RecordingBlock[] = [];
    const foundSubject = editedMentor.subjects.find(
      (s) => s === selectedSubject
    );
    const subject = getValueIfKeyExists(foundSubject || "", subjects);
    const answers = editedMentor.answers;
    if (subject) {
      const subjectAnswers = answers.filter((a) =>
        subject.questions.map((q) => q.question).includes(a.question)
      );
      const uncategorizedAnswers = subjectAnswers.filter((a) =>
        subject.questions
          .filter((q) => !q.category)
          .map((q) => q.question)
          .includes(a.question)
      );
      if (uncategorizedAnswers.length > 0) {
        _blocks.push({
          name: subject.name,
          description: subject.description,
          answers: uncategorizedAnswers,
          recordAll: (status) => recordAnswers(status, subject._id, ""),
          recordOne: recordAnswer,
          addQuestion: () => addNewQuestion(subject, undefined),
          editQuestion: (question) => editQuestion(subject, question),
        });
      }
      subject.categories.forEach((c) => {
        const categoryAnswers = subjectAnswers.filter((a) =>
          subject.questions
            .filter((q) => q.category === c.id)
            .map((q) => q.question)
            .includes(a.question)
        );
        if (categoryAnswers.length > 0) {
          _blocks.push({
            name: c.name,
            description: c.description,
            answers: categoryAnswers,
            recordAll: (status) => recordAnswers(status, subject._id, c.id),
            recordOne: recordAnswer,
            addQuestion: () => addNewQuestion(subject, c),
            editQuestion: (question) => editQuestion(subject, question),
          });
        }
      });
      setProgress({
        complete: subjectAnswers.filter((a) => a.status === Status.COMPLETE)
          .length,
        total: subjectAnswers.length,
      });
    } else {
      editedMentor.subjects.forEach((s) => {
        const subject = getValueIfKeyExists(s, subjects);
        const subjectAnswers = answers.filter((a) =>
          subject?.questions.map((q) => q.question).includes(a.question)
        );
        const uncategorizedAnswers = subjectAnswers.filter((a) =>
          subject?.questions
            .filter((q) => !q.category)
            .map((q) => q.question)
            .includes(a.question)
        );
        if (subject && uncategorizedAnswers.length > 0) {
          _blocks.push({
            name: subject.name,
            description: subject.description,
            answers: uncategorizedAnswers,
            recordAll: (status) => recordAnswers(status, subject._id, ""),
            recordOne: recordAnswer,
            addQuestion: () => addNewQuestion(subject, undefined),
            editQuestion: (question) => editQuestion(subject, question),
          });
        }
        subject?.categories.forEach((c) => {
          const categoryAnswers = subjectAnswers.filter((a) =>
            subject.questions
              .filter((sq) => sq.category === c.id)
              .map((sq) => sq.question)
              .includes(a.question)
          );
          if (categoryAnswers.length > 0) {
            _blocks.push({
              name: c.name,
              description: c.description,
              answers: categoryAnswers,
              recordAll: (status) => recordAnswers(status, subject._id, c.id),
              recordOne: recordAnswer,
              addQuestion: () => addNewQuestion(subject, c),
              editQuestion: (question) => editQuestion(subject, question),
            });
          }
        });
      });
      setProgress({
        complete: answers.filter((a) => a.status === Status.COMPLETE).length,
        total: answers.length,
      });
    }

    setBlocks(_blocks);
  }, [editedMentor, selectedSubject]);

  function clearError() {
    clearMentorError();
    clearTrainingError();
    //clearSubjectError();
  }

  function recordAnswers(status: Status, subject: string, category: string) {
    navigate(
      urlBuild("/record", {
        status: status,
        subject: subject,
        category: category,
        back: urlBuild(
          "/",
          selectedSubject ? { subject: selectedSubject } : {}
        ),
      })
    );
  }

  function recordAnswer(answer: Answer) {
    navigate(
      urlBuild("/record", {
        videoId: answer.question,
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

  function addNewQuestion(subject: SubjectGQL, category?: Category) {
    // if (!editedMentor || isMentorLoading || isSaving) {
    //   return;
    // }
    // const subjectIdx = editedMentor.subjects.findIndex(
    //   (s) => s._id === subject._id
    // );
    // if (subjectIdx === -1) {
    //   return;
    // }
    // const newQuestion: SubjectQuestionGQL = {
    //   question: {
    //     _id: uuid(),
    //     question: "",
    //     paraphrases: [],
    //     type: QuestionType.QUESTION,
    //     name: UtteranceName.NONE,
    //     mentor: editedMentor._id,
    //   },
    //   category: category,
    //   topics: [],
    // };
    // editMentor({
    //   subjects: copyAndSet(editedMentor.subjects, subjectIdx, {
    //     ...editedMentor.subjects[subjectIdx],
    //     questions: [newQuestion, ...subject.questions],
    //   }),
    //   answers: [
    //     {
    //       _id: uuid(),
    //       question: newQuestion.question,
    //       transcript: "",
    //       status: Status.INCOMPLETE,
    //       media: undefined,
    //       hasUntransferredMedia: false,
    //     },
    //     ...editedMentor.answers,
    //   ],
    // });
  }

  function editQuestion(subject: Subject, question: Question) {
    // if (!editedMentor || isMentorLoading || isSaving) {
    //   return;
    // }
    // const subjectIdx = editedMentor.subjects.findIndex(
    //   (s) => s._id === subject._id
    // );
    // if (subjectIdx === -1) {
    //   return;
    // }
    // const questionIdx = subject.questions.findIndex(
    //   (q) => q.question._id === question._id
    // );
    // if (questionIdx === -1) {
    //   return;
    // }
    // const answerIdx = editedMentor.answers.findIndex(
    //   (a) => a.question._id === question._id
    // );
    // if (answerIdx === -1) {
    //   return;
    // }
    // editMentor({
    //   subjects: copyAndSet(editedMentor.subjects, subjectIdx, {
    //     ...subject,
    //     questions: copyAndSet(subject.questions, questionIdx, {
    //       ...subject.questions[questionIdx],
    //       question,
    //     }),
    //   }),
    //   answers: copyAndSet(editedMentor.answers, answerIdx, {
    //     ...editedMentor.answers[answerIdx],
    //     question,
    //   }),
    // });
  }

  function saveChanges() {
    if (
      !mentorSubjects ||
      !editedMentor ||
      !isMentorEdited ||
      isMentorLoading ||
      isSaving
    ) {
      return;
    }
    // console.warn(
    //   "MUST FIX: batch the sequence of updateSubject async calls below into a single batch GQL update/request"
    // );
    // Promise.all(
    //   editedMentor.subjects
    //     .filter((s, i) => !equals(s, mentorSubjects[i]))
    //     .map((subject) => {
    //       return updateSubject(subject, accessToken);
    //     })
    // )
    //   .then(() => {
    //     onMentorUpdated(editedMentor); // update with the added/edited mentor questions
    //     saveMentorDetails();
    //     setIsSaving(false);
    //   })
    //   .catch((err) => {
    //     console.error(err);
    //     setSaveError({ message: "Failed to save", error: err.message });
    //     setIsSaving(false);
    //   });
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
