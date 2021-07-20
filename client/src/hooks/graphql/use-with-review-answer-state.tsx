/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useEffect, useState } from "react";
import { navigate } from "gatsby";
import { v4 as uuid } from "uuid";
import { updateSubject, CLIENT_ENDPOINT } from "api";
import {
  Status,
  Answer,
  Subject,
  Category,
  SubjectQuestion,
  QuestionType,
  Question,
  Mentor,
} from "types";
import { copyAndSet, equals, urlBuild } from "helpers";
import { useWithTraining } from "hooks/task/use-with-train";
import { useWithMentor } from "./use-with-mentor";
import { LoadingError } from "./loading-reducer";

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

export function useWithReviewAnswerState(
  accessToken: string,
  search: { subject?: string }
): UseWithReviewAnswerState {
  const [selectedSubject, setSelectedSubject] = useState<string | undefined>(
    search.subject
  );
  const [blocks, setBlocks] = useState<RecordingBlock[]>([]);
  const [progress, setProgress] = useState<Progress>({ complete: 0, total: 0 });
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<LoadingError>();
  const {
    data: mentor,
    error: mentorError,
    editedData: editedMentor,
    isLoading: isMentorLoading,
    isEdited: isMentorEdited,
    editData: editMentor,
    reloadData: reloadMentor,
  } = useWithMentor(accessToken);
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
      (s) => s._id === selectedSubject
    );
    const answers = editedMentor.answers;
    if (foundSubject) {
      const subject = foundSubject;
      const subjectAnswers = answers.filter((a) =>
        subject.questions.map((q) => q.question._id).includes(a.question._id)
      );
      const uncategorizedAnswers = subjectAnswers.filter((a) =>
        subject.questions
          .filter((q) => !q.category)
          .map((q) => q.question._id)
          .includes(a.question._id)
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
            .filter((q) => q.category?.id === c.id)
            .map((q) => q.question._id)
            .includes(a.question._id)
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
      editedMentor.subjects.forEach((subject) => {
        const subjectAnswers = answers.filter((a) =>
          subject.questions.map((q) => q.question._id).includes(a.question._id)
        );
        const uncategorizedAnswers = subjectAnswers.filter((a) =>
          subject.questions
            .filter((q) => !q.category)
            .map((q) => q.question._id)
            .includes(a.question._id)
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
              .filter((q) => q.category?.id === c.id)
              .map((q) => q.question._id)
              .includes(a.question._id)
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

  useEffect(() => {
    if (mentorError) {
      setError(mentorError);
    }
  }, [mentorError]);

  useEffect(() => {
    if (trainError) {
      setError(trainError);
      clearTrainingError(); //here
    }
  }, [trainError]);

  function recordAnswers(status: Status, subject: string, category: string) {
    navigate(
      `/record?back=${encodeURI(
        `/?subject=${selectedSubject}`
      )}&status=${status}&subject=${subject}&category=${category}`
    );
  }

  function recordAnswer(answer: Answer) {
    navigate(
      `/record?back=${encodeURI(`/?subject=${selectedSubject}`)}&videoId=${
        answer.question._id
      }`
    );
  }

  function selectSubject(sId: string | undefined) {
    setSelectedSubject(sId);
  }

  function addNewQuestion(subject: Subject, category: Category | undefined) {
    if (!editedMentor || isMentorLoading || isSaving) {
      return;
    }
    const subjectIdx = editedMentor.subjects.findIndex(
      (s) => s._id === subject._id
    );
    if (subjectIdx === -1) {
      return;
    }
    const newQuestion: SubjectQuestion = {
      question: {
        _id: uuid(),
        question: "",
        paraphrases: [],
        type: QuestionType.QUESTION,
        name: "",
        mentor: editedMentor._id,
      },
      category: category,
      topics: [],
    };
    editMentor({
      subjects: copyAndSet(editedMentor.subjects, subjectIdx, {
        ...editedMentor.subjects[subjectIdx],
        questions: [newQuestion, ...subject.questions],
      }),
      answers: [
        {
          _id: uuid(),
          question: newQuestion.question,
          transcript: "",
          status: Status.INCOMPLETE,
          media: undefined,
        },
        ...editedMentor.answers,
      ],
    });
  }

  function editQuestion(subject: Subject, question: Question) {
    if (!editedMentor || isMentorLoading || isSaving) {
      return;
    }
    const subjectIdx = editedMentor.subjects.findIndex(
      (s) => s._id === subject._id
    );
    if (subjectIdx === -1) {
      return;
    }
    const questionIdx = subject.questions.findIndex(
      (q) => q.question._id === question._id
    );
    if (questionIdx === -1) {
      return;
    }
    const answerIdx = editedMentor.answers.findIndex(
      (a) => a.question._id === question._id
    );
    if (answerIdx === -1) {
      return;
    }
    editMentor({
      subjects: copyAndSet(editedMentor.subjects, subjectIdx, {
        ...subject,
        questions: copyAndSet(subject.questions, questionIdx, {
          ...subject.questions[questionIdx],
          question,
        }),
      }),
      answers: copyAndSet(editedMentor.answers, answerIdx, {
        ...editedMentor.answers[answerIdx],
        question,
      }),
    });
  }

  function saveChanges() {
    if (
      !mentor ||
      !editedMentor ||
      !isMentorEdited ||
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
      editedMentor.subjects
        .filter((s, i) => !equals(s, mentor.subjects[i]))
        .map((subject) => {
          return updateSubject(subject, accessToken);
        })
    )
      .then(() => {
        reloadMentor();
        setIsSaving(false);
      })
      .catch((err) => {
        console.error(err);
        setError({ message: "Failed to save", error: err.message });
        setIsSaving(false);
      });
  }
  function launchMentor(params: string) {
    const path = urlBuild(`${location.origin}${CLIENT_ENDPOINT}`, {
      mentor: params,
    });
    window.location.href = path;
  }

  return {
    mentor,
    isMentorEdited,
    blocks,
    progress,
    selectedSubject,
    isLoading: isMentorLoading,
    isSaving,
    isTraining,
    error,
    clearError: () => setError(undefined),
    selectSubject,
    saveChanges,
    startTraining,
    launchMentor,
  };
}

interface UseWithReviewAnswerState {
  mentor: Mentor | undefined;
  isMentorEdited: boolean;
  blocks: RecordingBlock[];
  progress: Progress;
  selectedSubject: string | undefined;
  isLoading: boolean;
  isSaving: boolean;
  isTraining: boolean;
  error: LoadingError | undefined;
  clearError: () => void;
  selectSubject: (sId: string | undefined) => void;
  saveChanges: () => void;
  startTraining: (params: string) => void;
  launchMentor: (params: string) => void;
}
