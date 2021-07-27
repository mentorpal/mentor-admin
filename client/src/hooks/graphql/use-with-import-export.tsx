/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useState } from "react";
import * as api from "api";
import { Mentor, MentorExportJson } from "types";
import { useWithMentor } from "./use-with-mentor";

interface UseWithImportExport {
  mentor: Mentor | undefined;
  exportedJson: MentorExportJson | undefined;
  importedJson: MentorExportJson | undefined;
  exportMentor: () => void;
  importMentor: (file: File) => void;
  confirmImport: () => void;
  cancelImport: () => void;
}

export function useWithImportExport(accessToken: string): UseWithImportExport {
  const [exportedJson, setExportJson] = useState<MentorExportJson>();
  const [importedJson, setImportJson] = useState<MentorExportJson>();
  // const [editedJson, setEditJson] = useState<MentorExportJson>();

  const { editedData: mentor, editData: editMentor } =
    useWithMentor(accessToken);

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
      setExportJson(m);
    });
  }

  function importMentor(file: File) {
    if (!mentor) {
      return;
    }
    if (!exportedJson) {
      api.exportMentor(mentor._id).then((m) => {
        setExportJson(m);
      });
    }
    const reader = new FileReader();
    reader.onload = function (e) {
      if (typeof e.target?.result === "string") {
        const result = JSON.parse(e.target?.result);
        setImportJson(result);
      }
    };
    reader.readAsText(file);
  }

  function confirmImport() {
    if (!importedJson || !mentor) {
      return;
    }
    api.importMentor(mentor._id, importedJson, accessToken).then((m) => {
      editMentor(m);
      setExportJson(undefined);
      setImportJson(undefined);
    });
  }

  function cancelImport() {
    setImportJson(undefined);
  }

  return {
    mentor,
    exportedJson,
    importedJson,
    exportMentor,
    importMentor,
    confirmImport,
    cancelImport,
  };
}
