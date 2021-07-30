/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useState } from "react";
import * as api from "api";
import {
  Mentor,
  MentorExportJson,
  MentorImportPreview,
  Question,
  Subject,
} from "types";
import { useActiveMentor } from "store/slices/mentor/useActiveMentor";

export interface UseWithImportExport {
  mentor: Mentor | undefined;
  importedJson: MentorExportJson | undefined;
  importPreview: MentorImportPreview | undefined;
  exportMentor: () => void;
  importMentor: (file: File) => void;
  confirmImport: () => void;
  cancelImport: () => void;
  mapSubject: (curSubject: Subject, newSubject: Subject) => void;
  mapQuestion: (curQuestion: Question, newQuestion: Question) => void;
}

export function useWithImportExport(accessToken: string): UseWithImportExport {
  const [importedJson, setImportJson] = useState<MentorExportJson>();
  const [importPreview, setImportPreview] = useState<MentorImportPreview>();
  const { mentorState } = useActiveMentor();
  const mentor = mentorState.data;

  function exportMentor() {
    if (!mentor) {
      return;
    }
    api.exportMentor(mentor._id).then((m) => {
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
    });
  }

  function importMentor(file: File) {
    if (!mentor) {
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

  function updateImport(json: MentorExportJson) {
    if (!mentor) {
      return;
    }
    setImportJson(json);
    api.importMentorPreview(mentor._id, json).then((p) => {
      console.log(JSON.stringify(p, null, " "));
      setImportPreview(p);
    });
  }

  function confirmImport() {
    if (!importedJson || !mentor) {
      return;
    }
    api.importMentor(mentor._id, importedJson, accessToken).then(() => {
      setImportJson(undefined);
      setImportPreview(undefined);
    });
  }

  function cancelImport() {
    setImportJson(undefined);
    setImportPreview(undefined);
  }

  function mapSubject(subject: Subject, replacement: Subject) {
    if (!importedJson || !importPreview || !mentor) {
      return;
    }
    const json = { ...importedJson };
    // if the replacement subject is already referenced elsewhere in the import, remove it so we don't include it twice
    const rIdx = json.subjects.findIndex((s) => s._id === replacement._id);
    ~rIdx && json.subjects.splice(rIdx, 1);
    // find and replace the "new" subject in import with the replacement subject
    // is there a case where we want to some changes from import instead of over-writing with replacement?
    const idx = json.subjects.findIndex((s) => s._id === subject._id);
    ~idx && json.subjects.splice(idx, 1, replacement);
    // TODO: if the subject that was replaced had some questions that were overwritten by the replacement
    // we might need to remap them in imported questions and answers list
    updateImport(json);
  }

  function mapQuestion(question: Question, replacement: Question) {
    if (!importedJson || !importPreview || !mentor) {
      return;
    }
    const json = { ...importedJson };
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
    updateImport(json);
  }

  return {
    mentor,
    importedJson,
    importPreview,
    exportMentor,
    importMentor,
    confirmImport,
    cancelImport,
    mapSubject,
    mapQuestion,
  };
}
