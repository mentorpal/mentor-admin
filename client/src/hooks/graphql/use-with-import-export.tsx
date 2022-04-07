/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useState } from "react";
import * as api from "api";
import {
  Answer,
  Category,
  ChangedMentorData,
  EditType,
  ImportTask,
  MentorExportJson,
  MentorImportPreview,
  Question,
  ReplacedMentorDataChanges,
  Topic,
} from "types";
import { copyAndRemove, copyAndSet } from "helpers";
import { useActiveMentor } from "store/slices/mentor/useActiveMentor";
import { AnswerGQL, SubjectGQL, SubjectQuestionGQL } from "types-gql";
import { useAppSelector } from "store/hooks";
import { useWithImportStatus } from "./use-with-import-status";
import { useWithSubjects } from "./use-with-subjects";

export interface UseWithImportExport {
  importedJson?: MentorExportJson;
  importPreview?: MentorImportPreview;
  onMentorExported: () => Promise<void>;
  onMentorUploaded: (file: File) => void;
  onConfirmImport: () => void;
  onCancelImport: () => void;
  onTransferMedia: () => void;
  onMapSubject: (curSubject: SubjectGQL, newSubject: SubjectGQL) => void;
  onMapQuestion: (curQuestion: Question, newQuestion: Question) => void;
  onMapCategory: (questionBeingReplaced: Question, category: Category) => void;
  onMapTopic: (questionBeingUpdated: Question, topic: Topic) => void;
  toggleRemoveOldFollowup: (q: Question) => void;
  onReplaceNewAnswer: (a: AnswerGQL) => void;
  onMapQuestionToSubject: (
    questionBeingMapped: Question,
    targetSubject: SubjectGQL
  ) => void;
  onToggleRemoveAllOldAnswers: () => void;
  oldQuestionsToRemove: Question[];
  oldAnswersToRemove: AnswerGQL[];
  toggleRemoveOldAnswer: (a: AnswerGQL) => void;
  onToggleReplaceEntireMentor: () => void;
  onSaveSubjectName: (subject: SubjectGQL, newName: string) => void;
  importTask: ImportTask | undefined;
  isUpdating: boolean;
}

export function useWithImportExport(): UseWithImportExport {
  const [importedJson, setImportJson] = useState<MentorExportJson>();
  const [importPreview, setImportPreview] = useState<MentorImportPreview>();
  const [isUpdating, setIsUpdating] = useState(false);
  const { getData } = useActiveMentor();
  const mentorId = getData((state) => state.data?._id);
  const mentorAnswers: Answer[] = getData((state) => state.data?.answers);
  const accessToken = useAppSelector((state) => state.login.accessToken);
  const { importTask, setImportInProgress } = useWithImportStatus();
  const { data: subjectData } = useWithSubjects();
  const subjects = subjectData?.edges.map((edge) => edge.node);
  const [oldQuestionsToRemove, setOldQuestionsToRemove] = useState<Question[]>(
    []
  );
  const [oldAnswersToRemove, setOldAnswersToRemove] = useState<AnswerGQL[]>([]);

  async function onMentorExported(): Promise<void> {
    if (!mentorId || isUpdating) {
      return;
    }
    setIsUpdating(true);
    await exportMentor(mentorId);
    setIsUpdating(false);
  }

  function onImportUploaded(file: File): void {
    if (!mentorId || isUpdating) {
      return;
    }
    const reader = new FileReader();
    reader.onload = function (e) {
      if (typeof e.target?.result === "string") {
        const json = JSON.parse(e.target?.result);
        updateImport(json);
      }
    };
    reader.readAsText(file);
  }

  async function updateImport(json: MentorExportJson) {
    if (!mentorId || isUpdating) {
      return;
    }
    setIsUpdating(true);
    const preview = await api.importMentorPreview(mentorId, json);
    setImportJson(json);
    setImportPreview(preview);
    setIsUpdating(false);
  }

  function getReplacedMentorChanges(): ReplacedMentorDataChanges {
    const questionChanges: ChangedMentorData<Question>[] =
      oldQuestionsToRemove.map((q) => ({
        editType: EditType.REMOVED,
        data: q,
      }));
    const answerChanges: ChangedMentorData<AnswerGQL>[] =
      oldAnswersToRemove.map((a) => ({
        editType: EditType.REMOVED,
        data: a,
      }));
    return {
      questionChanges: questionChanges,
      answerChanges: answerChanges,
    };
  }

  function onConfirmImport(): void {
    if (!importedJson || !mentorId || isUpdating || !accessToken) {
      return;
    }
    setIsUpdating(true);
    api
      ._importMentor(
        mentorId,
        importedJson,
        getReplacedMentorChanges(),
        accessToken
      )
      .then(() => {
        setImportJson(undefined);
        setImportPreview(undefined);
        setIsUpdating(false);
        setImportInProgress(true); //starts the polling
      });
  }

  function onCancelImport(): void {
    if (isUpdating) {
      return;
    }
    setImportJson(undefined);
    setImportPreview(undefined);
  }

  function onTransferMedia(): void {
    if (!mentorId || !mentorAnswers || isUpdating) {
      return;
    }
    for (const answer of mentorAnswers) {
      if (!answer.hasUntransferredMedia) {
        continue;
      }
      api.transferMedia(mentorId, answer.question);
    }
  }

  function onSaveSubjectName(subject: SubjectGQL, newName: string) {
    if (!importedJson || !importPreview || !mentorId || isUpdating) {
      return;
    }
    const json = {
      ...importedJson,
      subjects: [...importedJson.subjects] || [],
      questions: [...importedJson.questions] || [],
      answers: [...importedJson.answers] || [],
    };

    const idx = json.subjects.findIndex((s) => s._id === subject._id);
    if (idx !== -1) {
      json.subjects[idx].name = newName;
      setImportJson(json);
    }
  }

  // Map subject to subject
  function onMapSubject(subject: SubjectGQL, replacement: SubjectGQL): void {
    if (!importedJson || !importPreview || !mentorId || isUpdating) {
      return;
    }
    const replacementId = replacement._id;
    // First check importedJson for the subject in case we are modifying it, else use fresh one passed in
    const replacementSubject =
      importedJson.subjects.find((subj) => subj._id === replacementId) ||
      replacement;

    let subjects = importedJson.subjects;
    // if the replacement subject is already referenced elsewhere in the import, remove it so we don't include it twice
    const rIdx = subjects.findIndex((s) => s._id === replacementSubject?._id);
    if (rIdx !== -1) {
      subjects = copyAndRemove(subjects, rIdx);
    }
    // find and replace the "new" subject in import with the replacement subject
    const idx = subjects.findIndex((s) => s._id === subject._id);

    if (idx !== -1) {
      // The subject that was replaced may have had some questions that were overwritten by the replacement
      // To handle this, we need to add it to the new subject
      const subjectBeingReplaced = subjects[idx];
      const newQuestions = subjectBeingReplaced.questions.filter(
        (q) =>
          !replacementSubject?.questions.find(
            (rep_q) => rep_q.question._id === q.question._id
          )
      );
      const newQsBarebones: SubjectQuestionGQL[] = newQuestions.map((q) => {
        return {
          ...q,
          category: undefined,
          topics: [],
        };
      });
      const replacementSubj: SubjectGQL = {
        ...replacementSubject,
        questions: replacementSubject.questions.concat(newQsBarebones),
      };
      subjects = copyAndSet(subjects, idx, replacementSubj);
    }

    updateImport({
      ...importedJson,
      subjects,
    });
  }

  // Map question to another question within a subject
  // question answer document needs to stay and be updated with replacement doc
  // replacement doc needs to go away no matter what
  function onMapQuestion(question: Question, replacement: Question): void {
    if (!importedJson || !importPreview || !mentorId || isUpdating) {
      return;
    }
    const json = {
      ...importedJson,
      subjects: [...importedJson.subjects] || [],
      questions: [...importedJson.questions] || [],
      answers: [...importedJson.answers] || [],
    };
    // if the replacement question is already referenced elsewhere in the import, remove it so we don't include it twice
    let rIdx = json.questions.findIndex((q) => q._id === replacement._id);
    ~rIdx && json.questions.splice(rIdx, 1);
    // find and replace the "new" question in import with the replacement question
    // is there a case where we want to some changes from import instead of over-writing with replacement?
    let idx = json.questions.findIndex((q) => q._id === question._id);
    ~idx && json.questions.splice(idx, 1, replacement);
    // replace the question in subjects that use it
    for (const s of json.subjects) {
      rIdx = s.questions.findIndex((q) => q.question._id === replacement._id);
      ~rIdx && s.questions.splice(rIdx, 1);
      idx = s.questions.findIndex((q) => q.question._id === question._id);
      ~idx &&
        s.questions.splice(idx, 1, {
          ...s.questions[idx],
          question: replacement,
        });
    }
    // replace the question in answers that use it
    rIdx = json.answers.findIndex((a) => a.question._id === replacement._id);
    ~rIdx && json.answers.splice(rIdx, 1);
    idx = json.answers.findIndex((a) => a.question._id === question._id);
    ~idx &&
      json.answers.splice(idx, 1, {
        ...json.answers[idx],
        question: replacement,
      });
    setImportJson(json);

    const preview = {
      ...importPreview,
      subjects: [...importPreview.subjects] || [],
      questions: [...importPreview.questions] || [],
      answers: [...importPreview.answers] || [],
    };
    // Simply remove question document from importPreview because we mapped the question to an existing question
    const previewQIdx = preview.questions.findIndex(
      (q) => q.importData?._id === question._id
    );
    if (previewQIdx) {
      preview.questions.splice(previewQIdx, 1);
    }

    // We need to check if an answer document exists for the question that is being mapped to and remove it
    // We need to also check if there is an answer document with "new" data that was part of the question that was mapped
    //    and update the question to point to the target answer.
    const replacementIdx = preview.answers.findIndex(
      (previewAnswer) =>
        (previewAnswer.curData || previewAnswer.importData)?.question._id ===
        replacement._id
    );
    if (replacementIdx !== -1) {
      preview.answers.splice(replacementIdx, 1);
    }
    const newAnswerIdx = preview.answers.findIndex(
      (previewAnswer) =>
        (previewAnswer.curData || previewAnswer.importData)?.question._id ===
        question._id
    );
    if (newAnswerIdx !== -1) {
      // There is some answer document that has the answer data for the imported question that got mapped
      const importData = preview.answers[newAnswerIdx].importData;
      if (importData) {
        //There is some legitimate data that needs to be mapped to the target question
        importData.question = replacement;
      }
    }
    // Also remove the question from the imported subjects question list
    for (const s of preview.subjects) {
      const previewSubjectQuestionIdx =
        s.importData?.questions.findIndex(
          (q) => q.question._id === question._id
        ) || -1;
      if (previewSubjectQuestionIdx !== -1) {
        s.importData?.questions.splice(previewSubjectQuestionIdx, 1);
      }
    }
    setImportPreview(preview);
  }

  // Map a question to a new category
  function onMapCategory(questionBeingReplaced: Question, category: Category) {
    if (!importedJson || !importPreview || !mentorId || isUpdating) {
      return;
    }
    const json = {
      ...importedJson,
      subjects: [...importedJson.subjects] || [],
      questions: [...importedJson.questions] || [],
      answers: [...importedJson.answers] || [],
    };

    for (let i = 0; i < json.subjects.length; i++) {
      const s = json.subjects[i];
      const idx = s.questions.findIndex(
        (q) => q.question._id === questionBeingReplaced._id
      );
      if (idx !== -1) {
        json.subjects[i].questions[idx].category = category;
      }
    }
    setImportJson(json);

    // TODO: Update Preview
    const preview = {
      ...importPreview,
      subjects: [...importPreview.subjects] || [],
      questions: [...importPreview.questions] || [],
      answers: [...importPreview.answers] || [],
    };
    for (const s of preview.subjects) {
      if (!s.importData) {
        continue;
      }
      const subjQIdx = s.importData.questions.findIndex(
        (q) => q.question._id === questionBeingReplaced._id
      );
      if (subjQIdx !== -1) {
        s.importData.questions[subjQIdx].category = category;
      }
    }
    setImportPreview(preview);
  }

  // Map a question to a new subject
  function onMapQuestionToSubject(
    questionBeingMapped: Question,
    targetSubject: SubjectGQL
  ) {
    if (
      !importedJson ||
      !importPreview ||
      !mentorId ||
      isUpdating ||
      !subjects
    ) {
      return;
    }
    const json = {
      ...importedJson,
      subjects: [...importedJson.subjects] || [],
      questions: [...importedJson.questions] || [],
      answers: [...importedJson.answers] || [],
    };

    // Find and remove the question from current subject in import
    let questionsRemoved: SubjectQuestionGQL[] = [];
    for (let i = 0; i < json.subjects.length; i++) {
      const s = json.subjects[i];
      const rIdx = s.questions.findIndex(
        (q) => q.question._id === questionBeingMapped._id
      );
      if (rIdx !== -1) {
        questionsRemoved = json.subjects[i].questions.splice(rIdx, 1);
      }
    }
    if (!questionsRemoved.length) {
      throw new Error(
        `Failed to find question with id ${questionBeingMapped._id} among subjects`
      );
    }
    const questionToAdd = questionsRemoved[0];
    const subjectToAddToIdx = json.subjects.findIndex(
      (subj) => subj._id === targetSubject._id
    );
    // If import json already has subject, simply add question to import json subject
    if (subjectToAddToIdx !== -1) {
      json.subjects[subjectToAddToIdx].questions = json.subjects[
        subjectToAddToIdx
      ].questions.concat({
        ...questionToAdd,
        category: undefined,
        topics: [],
      });
    } else {
      //  Import json does not have subject, so must find it, update it with new question, then add it to jsons import subjects
      const subjectToAddIdx = subjects.findIndex(
        (subj) => subj._id === targetSubject._id
      );
      if (subjectToAddIdx !== -1) {
        const subj: SubjectGQL = { ...subjects[subjectToAddIdx] };
        const subjAlreadyHasQuestion = subj.questions.find(
          (subjQ) => subjQ.question._id === questionToAdd.question._id
        );
        if (!subjAlreadyHasQuestion) {
          subj.questions = subj.questions.concat({
            ...questionToAdd,
            category: undefined,
            topics: [],
          });
        }
        json.subjects = json.subjects.concat(subj);
      } else {
        throw new Error(`Failed to find subject with id ${targetSubject._id}`);
      }
    }
    setImportJson(json);

    const preview = {
      ...importPreview,
      subjects: [...importPreview.subjects] || [],
      questions: [...importPreview.questions] || [],
      answers: [...importPreview.answers] || [],
    };
    for (const s of preview.subjects) {
      const targetQIdx = s.importData?.questions.findIndex(
        (q) => `${q.question._id}` === `${questionBeingMapped._id}`
      );
      if ((targetQIdx !== 0 && !targetQIdx) || targetQIdx === -1) {
        continue;
      }
      const removedQuestions = s.importData?.questions.splice(targetQIdx, 1);
      // Succesfully removed question from import data subject
      if (removedQuestions?.length) {
        const removedQuestion: SubjectQuestionGQL = {
          ...removedQuestions[0],
          category: undefined,
          topics: [],
        };
        // Check if subject exists in preview already, then update it if so
        const targetPreviewSubjectIdx = preview.subjects.findIndex(
          (prevSubj) =>
            (prevSubj.importData?._id || prevSubj.curData?._id) ===
            targetSubject._id
        );
        if (targetPreviewSubjectIdx !== -1) {
          // update this subjects
          const importData =
            preview.subjects[targetPreviewSubjectIdx].importData;
          if (importData) {
            importData.questions = importData.questions.concat(removedQuestion);
            setImportPreview(preview);
            return;
          } else {
            // Need to add import data since we are now changing things
            const currentData =
              preview.subjects[targetPreviewSubjectIdx].curData;
            if (!currentData) {
              throw new Error(
                "Expected current data to exist since import data did not"
              );
            }

            preview.subjects[targetPreviewSubjectIdx].importData = {
              ...currentData,
              questions: currentData.questions
                .filter((q) => !q.question.mentor)
                .concat(removedQuestion),
            };
            preview.subjects[targetPreviewSubjectIdx].editType = EditType.ADDED;
            setImportPreview(preview);
            return;
          }
        } else {
          // try to find subject through main subject data, then add to importPreview
          const targetSubjectData = subjects.find(
            (subj) => subj._id === targetSubject._id
          );
          if (targetSubjectData) {
            preview.subjects = preview.subjects.concat({
              editType: EditType.ADDED,
              curData: targetSubjectData,
              importData: {
                ...targetSubjectData,
                questions: targetSubjectData.questions.concat(removedQuestion),
              },
            });
            setImportPreview(preview);
            return;
          } else {
            throw new Error(
              `Failed to find existing or imported subject with id ${targetSubject._id}`
            );
          }
        }
      }
    }
  }

  // Map a question to a new topic
  function onMapTopic(questionBeingUpdated: Question, topicToMap: Topic) {
    if (
      !importedJson ||
      !importPreview ||
      !mentorId ||
      isUpdating ||
      !subjects
    ) {
      return;
    }
    const json = {
      ...importedJson,
      subjects: [...importedJson.subjects] || [],
      questions: [...importedJson.questions] || [],
      answers: [...importedJson.answers] || [],
    };
    for (const s of json.subjects) {
      const subjQuestionIdx = s.questions.findIndex(
        (subjQ) => subjQ.question._id === questionBeingUpdated._id
      );
      if (subjQuestionIdx !== -1) {
        // Confirm topic is within subject with target question
        const isTopicInSubject = s.topics.find(
          (topic) => topic.id === topicToMap.id
        );
        if (!isTopicInSubject) {
          throw new Error(
            `Topic ${JSON.stringify(topicToMap)} does not exist in subject ${
              s.name
            }`
          );
        }
        s.questions[subjQuestionIdx].topics = [topicToMap];
      }
    }
    setImportJson(json);

    const preview = {
      ...importPreview,
      subjects: [...importPreview.subjects] || [],
      questions: [...importPreview.questions] || [],
      answers: [...importPreview.answers] || [],
    };
    for (const s of preview.subjects) {
      if (!s.importData) {
        continue;
      }
      const subjQIdx = s.importData.questions.findIndex(
        (q) => q.question._id === questionBeingUpdated._id
      );
      if (subjQIdx !== -1) {
        s.importData.questions[subjQIdx].topics = [topicToMap];
      }
    }
    setImportPreview(preview);
  }

  function toggleRemoveOldFollowup(question: Question) {
    if (!oldQuestionsToRemove.find((q) => q._id === question._id)) {
      setOldQuestionsToRemove(oldQuestionsToRemove.concat(question));
    } else {
      setOldQuestionsToRemove(
        oldQuestionsToRemove.filter((q) => q._id !== question._id)
      );
    }
  }

  function toggleRemoveOldAnswer(answer: AnswerGQL) {
    if (
      !oldAnswersToRemove.find((a) => a.question._id === answer.question._id)
    ) {
      setOldAnswersToRemove(oldAnswersToRemove.concat(answer));
    } else {
      setOldAnswersToRemove(
        oldAnswersToRemove.filter((a) => a.question._id !== answer.question._id)
      );
    }
  }

  function onToggleRemoveAllOldAnswers() {
    if (!importPreview) {
      return;
    }
    const oldAnswerPreviews = importPreview.answers.filter(
      (a) => a.editType === EditType.OLD_ANSWER && a.curData
    );
    const oldAnswers: AnswerGQL[] = [];
    oldAnswerPreviews.forEach((oldAnswerPreview) => {
      if (oldAnswerPreview.curData) {
        oldAnswers.push(oldAnswerPreview.curData);
      }
    });
    if (oldAnswersToRemove.length === oldAnswers.length) {
      setOldAnswersToRemove([]);
    } else {
      setOldAnswersToRemove(oldAnswers);
    }
  }

  function onToggleReplaceEntireMentor() {
    if (!importPreview) {
      return;
    }
    const oldQuestionPreviews = importPreview.questions.filter(
      (q) =>
        q.editType === EditType.OLD_FOLLOWUP && q.curData?.mentor == mentorId
    );
    const oldQuestions: Question[] = [];
    oldQuestionPreviews.forEach((oldQuestionPreview) => {
      if (oldQuestionPreview.curData) {
        oldQuestions.push(oldQuestionPreview.curData);
      }
    });

    const oldAnswerPreviews = importPreview.answers.filter(
      (a) => a.editType === EditType.OLD_ANSWER
    );
    const oldAnswers: AnswerGQL[] = [];
    oldAnswerPreviews.forEach((oldAnswerPreview) => {
      if (oldAnswerPreview.curData) {
        oldAnswers.push(oldAnswerPreview.curData);
      }
    });
    if (
      oldQuestionsToRemove.length === oldQuestions.length &&
      oldAnswersToRemove.length === oldAnswers.length
    ) {
      setOldQuestionsToRemove([]);
      setOldAnswersToRemove([]);
    } else {
      setOldQuestionsToRemove(oldQuestions);
      setOldAnswersToRemove(oldAnswers);
    }
  }

  /**
   *
   * @param replacingAnswer either the current answer data or importing answer data
   * @returns
   */
  function onReplaceNewAnswer(replacingAnswer: AnswerGQL) {
    if (
      !importedJson ||
      !importPreview ||
      !mentorId ||
      isUpdating ||
      !subjects
    ) {
      return;
    }

    const preview = {
      ...importPreview,
      subjects: [...importPreview.subjects] || [],
      questions: [...importPreview.questions] || [],
      answers: [...importPreview.answers] || [],
    };
    const previewAnswersIdx = preview.answers.findIndex(
      (a) => a.curData?.question._id === replacingAnswer.question._id
    );
    const curAnswer = preview.answers[previewAnswersIdx].curData;
    const importAnswer = preview.answers[previewAnswersIdx].importData;
    if (!curAnswer || !importAnswer) {
      throw new Error(
        `Old or new answer does not exist for preview answer document corresponding to question id ${replacingAnswer.question._id}`
      );
    }
    preview.answers[previewAnswersIdx] = {
      ...preview.answers[previewAnswersIdx],
      importData: replacingAnswer,
    };
    setImportPreview(preview);

    const json = {
      ...importedJson,
      subjects: [...importedJson.subjects] || [],
      questions: [...importedJson.questions] || [],
      answers: [...importedJson.answers] || [],
    };
    const answerIdx = json.answers.findIndex(
      (a) => a.question._id === replacingAnswer.question._id
    );
    if (answerIdx === -1) {
      throw new Error(
        `Import JSON does not have an answer document for answer for question with id ${replacingAnswer.question._id}`
      );
    }
    json.answers.splice(answerIdx, 1, replacingAnswer);
    setImportJson(json);
  }

  return {
    importedJson,
    importPreview,
    onMentorExported,
    onMentorUploaded: onImportUploaded,
    onConfirmImport,
    onCancelImport,
    onTransferMedia,
    onMapSubject,
    onMapQuestion,
    onMapCategory,
    onMapTopic,
    toggleRemoveOldFollowup,
    onMapQuestionToSubject,
    onSaveSubjectName,
    onReplaceNewAnswer,
    onToggleRemoveAllOldAnswers,
    onToggleReplaceEntireMentor,
    oldQuestionsToRemove,
    toggleRemoveOldAnswer,
    oldAnswersToRemove,
    importTask,
    isUpdating,
  };
}

export function exportMentor(mentorId: string): Promise<void> {
  return api
    .exportMentor(mentorId)
    .then((m) => {
      const element = document.createElement("a");
      element.setAttribute(
        "href",
        "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(m))
      );
      element.setAttribute("download", "mentor.json");
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    })
    .catch((err) => {
      console.error(err);
    });
}
