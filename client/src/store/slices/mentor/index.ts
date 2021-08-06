/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu
The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as api from "api";
import { LoadingError } from "hooks/graphql/loading-reducer";
import { RootState } from "store/store";
import { Mentor } from "types";
import { LoginState } from "../login";

/** Store */

export enum MentorStatus {
  NONE = 0,
  LOADING = 1,
  SAVING = 2,
  SUCCEEDED = 3,
  FAILED = 4,
}

export interface MentorState {
  data?: Mentor;
  mentorStatus: MentorStatus;
  error?: LoadingError;
  userLoadedBy?: string;
}

interface CancellabeResult<T> {
  result?: T;
  isCancelled?: boolean;
}

const initialState: MentorState = {
  mentorStatus: MentorStatus.NONE,
};

/** Actions */

export const loadMentor = createAsyncThunk(
  "mentor/loadMentor",
  async (login: LoginState, thunkAPI): Promise<CancellabeResult<Mentor>> => {
    const state = thunkAPI.getState() as RootState;
    if (
      state.mentor.mentorStatus == MentorStatus.LOADING ||
      state.mentor.mentorStatus == MentorStatus.SAVING
    ) {
      return { isCancelled: true };
    }
    thunkAPI.dispatch(mentorSlice.actions.loadingInProgress(state.login));
    if (!login.accessToken) {
      return Promise.reject("no access token");
    }
    return { result: await api.fetchMentor(login.accessToken) };
  }
);

export const saveMentor = createAsyncThunk(
  "mentor/saveMentor",
  async (headers: {
    accessToken: string;
    editedData: Mentor;
  }): Promise<Mentor | unknown> => {
    try {
      await api.updateMentorDetails(headers.editedData, headers.accessToken);
      return headers.editedData;
    } catch (err) {
      return err.response.data;
    }
  }
);

export const saveMentorSubjects = createAsyncThunk(
  "mentor/saveMentorSubjects",
  async (headers: {
    accessToken: string;
    editedData: Mentor;
  }): Promise<Mentor | unknown> => {
    try {
      await api.updateMentorSubjects(headers.editedData, headers.accessToken);
      // need to fetch the updated mentor because the questions/answers might have changed
      return await api.fetchMentor(headers.accessToken);
    } catch (err) {
      return err.response.data;
    }
  }
);

/** Reducer */

export const mentorSlice = createSlice({
  name: "mentor",
  initialState,
  reducers: {
    loadingInProgress: (state, action: PayloadAction<LoginState>) => {
      state.mentorStatus = MentorStatus.LOADING;
      state.userLoadedBy = action.payload.user?._id;
    },
    clearError: (state) => {
      delete state.error;
    },
    updateMentor: (state, action: PayloadAction<Mentor>) => {
      state.data = action.payload;
    },
    setStatus: (state, action: PayloadAction<MentorStatus>) => {
      state.mentorStatus = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadMentor.fulfilled, (state, action) => {
        if (action.payload.isCancelled || !action.payload.result) {
          return;
        }
        state.data = action.payload.result;
        state.mentorStatus = MentorStatus.SUCCEEDED;
      })
      .addCase(loadMentor.rejected, (state) => {
        delete state.data;
        state.error = {
          message: "failed to load mentor",
          error: loadMentor.rejected.name,
        };
        state.mentorStatus = MentorStatus.FAILED;
      })
      .addCase(saveMentor.pending, (state) => {
        state.mentorStatus = MentorStatus.SAVING;
      })
      .addCase(saveMentor.fulfilled, (state, action) => {
        state.data = action.payload as Mentor;
        state.mentorStatus = MentorStatus.SUCCEEDED;
      })
      .addCase(saveMentor.rejected, (state) => {
        state.mentorStatus = MentorStatus.FAILED;
        state.error = {
          message: "failed to save mentor",
          error: saveMentor.rejected.name,
        };
      })
      .addCase(saveMentorSubjects.pending, (state) => {
        state.mentorStatus = MentorStatus.SAVING;
      })
      .addCase(saveMentorSubjects.fulfilled, (state, action) => {
        state.data = action.payload as Mentor;
        state.mentorStatus = MentorStatus.SUCCEEDED;
      })
      .addCase(saveMentorSubjects.rejected, (state) => {
        state.mentorStatus = MentorStatus.FAILED;
        state.error = {
          message: "failed to save subjects",
          error: saveMentorSubjects.rejected.name,
        };
      });
  },
});

export const { clearError, updateMentor, setStatus } = mentorSlice.actions;

export default mentorSlice.reducer;
