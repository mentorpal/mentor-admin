/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useEffect } from "react";
import { LoadingError, LoadingStatus } from "hooks/graphql/loading-reducer";
import { useAppSelector, useAppDispatch } from "store/hooks";
import { RootState } from "store/store";
import { Answer, Mentor } from "types";
import * as mentorActions from ".";
import {
  ACTIVE_MENTOR_KEY,
  sessionStorageClear,
  sessionStorageGet,
  sessionStorageStore,
} from "store/local-storage";

export function selectActiveMentor(
  state: RootState
): mentorActions.MentorState {
  return state.mentor;
}

export interface SelectFromMentorStateFunc<T> {
  (mentorState: mentorActions.MentorState, rootState: RootState): T;
}

export function useActiveMentor(): UseActiveMentor {
  const loginUser = useAppSelector((state) => state.login.user);
  const mentor = useAppSelector((state) => state.mentor);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const activeMentorId = sessionStorageGet(ACTIVE_MENTOR_KEY);
    if (
      mentor &&
      mentor.userLoadedBy === loginUser?._id &&
      mentor.data?._id === (activeMentorId || loginUser?.defaultMentor._id)
    ) {
      return;
    }
    loadMentor();
  }, [loginUser?._id]);

  function getData<T>(selector: SelectFromMentorStateFunc<T>): T {
    return useAppSelector((state) => {
      return selector(selectActiveMentor(state), state);
    });
  }

  function switchActiveMentor(mentorId?: string): void {
    if (mentorId && mentor.data?._id === mentorId) {
      return;
    }
    if (!mentorId && mentor.data?._id === loginUser?.defaultMentor._id) {
      return;
    }
    if (mentorId) {
      sessionStorageStore(ACTIVE_MENTOR_KEY, mentorId);
    } else {
      sessionStorageClear(ACTIVE_MENTOR_KEY);
    }
    loadMentor();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function loadMentor(): Promise<any> {
    const activeMentorId = sessionStorageGet(ACTIVE_MENTOR_KEY);
    if (activeMentorId) {
      return dispatch(mentorActions.loadMentor({ mentorId: activeMentorId }));
    } else {
      return dispatch(mentorActions.loadMentor({}));
    }
  }

  function saveMentorDetails(data: Mentor): void {
    dispatch(mentorActions.saveMentor(data));
  }

  function saveMentorSubjects(data: Mentor): void {
    dispatch(mentorActions.saveMentorSubjects(data));
  }

  function saveMentorKeywords(data: Mentor): void {
    dispatch(mentorActions.saveMentorKeywords(data));
  }

  function saveMentorPrivacy(data: Mentor): void {
    dispatch(mentorActions.saveMentorPrivacy(data));
  }

  function clearMentorError(): void {
    dispatch(mentorActions.mentorSlice.actions.clearError());
  }

  function updateAnswer(answer: Answer): void {
    dispatch(mentorActions.updateAnswer(answer));
  }

  return {
    mentor: mentor.data,
    isLoading: mentor.mentorStatus === LoadingStatus.LOADING,
    isSaving: mentor.mentorStatus === LoadingStatus.SAVING,
    error: mentor.error,
    getData,
    loadMentor,
    switchActiveMentor,
    saveMentorDetails,
    saveMentorSubjects,
    saveMentorKeywords,
    saveMentorPrivacy,
    clearMentorError,
    updateAnswer,
  };
}

interface UseActiveMentor {
  mentor: Mentor | undefined;
  isLoading: boolean;
  isSaving: boolean;
  error: LoadingError | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getData: (selector: SelectFromMentorStateFunc<any>) => any;
  loadMentor: () => Promise<void>;
  switchActiveMentor: (id?: string) => void;
  saveMentorDetails: (d: Mentor) => void;
  saveMentorSubjects: (d: Mentor) => void;
  saveMentorKeywords: (d: Mentor) => void;
  saveMentorPrivacy: (d: Mentor) => void;
  clearMentorError: () => void;
  updateAnswer: (a: Answer) => void;
}

export default useActiveMentor;
