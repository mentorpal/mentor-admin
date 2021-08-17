/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu
The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "api";
import { RootState } from "store/store";
import { Mentor } from "types";
import { loginSlice, MentorStatus, onLogout } from ".";
import { selectActiveMentor } from "../mentor/useActiveMentor";

interface CancellabeResult<T> {
  result?: T;
  isCancelled?: boolean;
}

/** Actions */

export const googleLogin = createAsyncThunk(
  "login/googleLogin",
  async (accessToken: string, { rejectWithValue }) => {
    try {
      const googleToken = await api.loginGoogle(accessToken);
      return await api.login(googleToken.accessToken);
    } catch (err) {
      console.error(err.response.data);
      return rejectWithValue(err.response.data);
    }
  }
);

export const login = createAsyncThunk(
  "login/login",
  async (accessToken: string, { rejectWithValue }) => {
    try {
      accessTokenStore(accessToken);
      return await api.login(accessToken);
    } catch (err) {
      console.error(err.response.data);
      return rejectWithValue(err.response.data);
    }
  }
);

export const logout =
  () =>
  (dispatch: (arg0: { payload: undefined; type: string }) => void): void => {
    accessTokenClear();
    dispatch(onLogout());
  };

export const loadMentor = createAsyncThunk(
  "mentor/loadMentor",
  async (
    headers: { mentorId?: string },
    thunkAPI
  ): Promise<CancellabeResult<Mentor>> => {
    const state = thunkAPI.getState() as RootState;
    if (
      state.login.activeMentor.mentorStatus == MentorStatus.LOADING ||
      state.login.activeMentor.mentorStatus == MentorStatus.SAVING
    ) {
      return { isCancelled: true };
    }
    thunkAPI.dispatch(loginSlice.actions.loadingInProgress(state.login));
    if (!state.login.accessToken || !state.login.user?.defaultMentor._id) {
      return Promise.reject("no access token");
    } else
      return headers.mentorId
        ? {
            result: await api.fetchMentorById(
              state.login.accessToken,
              headers.mentorId
            ),
          }
        : {
            result: await api.fetchMentorById(
              state.login.accessToken,
              state.login.user?.defaultMentor._id
            ),
          };
  }
);

export const saveMentor = createAsyncThunk(
  "mentor/saveMentor",
  async (editedData: Mentor, thunkAPI): Promise<Mentor | unknown> => {
    const state = thunkAPI.getState() as RootState;
    if (state.login.accessToken) {
      try {
        await api.updateMentorDetails(editedData, state.login.accessToken);
        return editedData;
      } catch (err) {
        return err.response.data;
      }
    }
  }
);

export const saveMentorSubjects = createAsyncThunk(
  "mentor/saveMentorSubjects",
  async (editedData: Mentor, thunkAPI): Promise<Mentor | unknown> => {
    const state = thunkAPI.getState() as RootState;
    if (state.login.accessToken) {
      try {
        await api.updateMentorSubjects(editedData, state.login.accessToken);
        // need to fetch the updated mentor because the questions/answers might have changed
        return api.fetchMentorById(state.login.accessToken, editedData._id);
      } catch (err) {
        return err.response.data;
      }
    }
  }
);

export const saveThumbnail = createAsyncThunk(
  "mentor/saveThumbnail",
  async (
    headers: {
      file: File;
    },
    thunkAPI
  ): Promise<string | unknown> => {
    try {
      const state = thunkAPI.getState() as RootState;
      const mentorId = selectActiveMentor(state).data?._id || "";
      if (!mentorId) {
        return Promise.reject("upload api called with no active mentor");
      }
      return await api.uploadThumbnail(mentorId, headers.file);
    } catch (err) {
      return err.response.data;
    }
  }
);

/** Helpers */

export const ACCESS_TOKEN_KEY = "accessToken";

export function accessTokenGet(): string {
  if (typeof window === "undefined") {
    return "";
  }
  return localStorage.getItem(ACCESS_TOKEN_KEY) || "";
}

export function accessTokenStore(accessToken: string): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
}

export function accessTokenClear(): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}
