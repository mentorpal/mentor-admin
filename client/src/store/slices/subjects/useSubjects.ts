/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAppSelector } from "store/hooks";
import { RootState } from "store/store";
import { SubjectGQL } from "types-gql";
import { loadSubjectsById, SubjectsState } from ".";

export interface SelectFromSubjectStateFunc<T> {
  (subjectState: SubjectsState, rootState: RootState): T;
}

export function useSubjects<T>(
  selector: SelectFromSubjectStateFunc<T>,
  ids?: string[]
): T {
  const { loadSubjects } = useSubjectActions();
  const data = useAppSelector((state) => {
    return selector(state.subjects, state);
  });

  useEffect(() => {
    if (ids) {
      loadSubjects(ids);
    }
  }, [ids]);

  return data;
}

export interface SubjectActions {
  loadSubjects: (ids: string[], reload?: boolean) => void;
  saveSubject: (data: SubjectGQL) => void;
}

export function useSubjectActions(): SubjectActions {
  const dispatch = useDispatch();
  const data = useAppSelector((state) => {
    return state.subjects.subjects;
  });

  function loadSubjects(ids: string[], reload = false): void {
    if (!reload) {
      const qIds = Object.keys(data);
      ids = ids.filter((i) => !qIds.includes(i));
    }
    dispatch(loadSubjectsById({ ids, reload }));
  }

  function saveSubject(data: SubjectGQL): void {
    dispatch(saveSubject(data));
  }

  return {
    loadSubjects,
    saveSubject,
  };
}

export default useSubjects;
