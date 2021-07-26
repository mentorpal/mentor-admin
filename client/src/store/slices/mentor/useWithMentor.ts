/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAppSelector } from "store/hooks";
import { Mentor } from "types";
import * as mentorActions from "./mentorSlice";

interface UseWithMentor {
  state: mentorActions.MentorState;
  getMentor: (headers: mentorActions.Headers) => void;
  saveMentor: (headers: mentorActions.Headers) => void;
  saveMentorSubjects: (headers: mentorActions.Headers) => void;
  editMentor: (edits: Partial<Mentor>) => void;
}

export function useWithMentor(accessToken: string): UseWithMentor {
  const dispatch = useDispatch();
  const state = useAppSelector((state) => state.mentor);

  useEffect(() => {
    if (state.data) {
      return;
    }
    if (accessToken) {
      getMentor({ accessToken: accessToken, editedData: undefined });
    }
  }, []);

  function getMentor(headers: mentorActions.Headers) {
    if (
      state.mentorStatus === mentorActions.MentorStatus.NONE ||
      state.mentorStatus === mentorActions.MentorStatus.FAILED
    ) {
      dispatch(mentorActions.getMentor(headers));
    }
  }

  function saveMentor(headers: mentorActions.Headers) {
    if (
      state.mentorStatus === mentorActions.MentorStatus.NONE ||
      state.mentorStatus === mentorActions.MentorStatus.FAILED
    ) {
      dispatch(mentorActions.saveMentor(headers));
    }
  }

  function saveMentorSubjects(headers: mentorActions.Headers) {
    if (
      state.mentorStatus === mentorActions.MentorStatus.NONE ||
      state.mentorStatus === mentorActions.MentorStatus.FAILED
    ) {
      dispatch(mentorActions.saveMentorSubjects(headers));
    }
  }
  function editMentor(edits: Partial<Mentor>) {
    if (state.mentorStatus === mentorActions.MentorStatus.LOADING) {
      return;
    }
    dispatch(mentorActions.mentorSlice.actions.editMentor(edits));
  }

  return {
    state,
    getMentor,
    saveMentor,
    saveMentorSubjects,
    editMentor,
  };
}
