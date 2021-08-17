/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LoadingError } from "hooks/graphql/loading-reducer";
import { Mentor, User } from "types";
import {
  googleLogin,
  login,
  saveMentorSubjects,
  saveThumbnail,
  saveMentor,
  loadMentor,
} from "./actions";

/** Store */

export interface ActiveMentor {
  data?: Mentor;
  mentorStatus: MentorStatus;
  error?: LoadingError;
  userLoadedBy?: string;
}

export enum LoginStatus {
  NONE = 0,
  NOT_LOGGED_IN = 1,
  IN_PROGRESS = 2,
  AUTHENTICATED = 3,
  FAILED = 4,
}

export enum MentorStatus {
  NONE = 0,
  LOADING = 1,
  SAVING = 2,
  SUCCEEDED = 3,
  FAILED = 4,
}

export interface LoginState {
  accessToken?: string;
  loginStatus: LoginStatus;
  user?: User;
  activeMentor: ActiveMentor;
}

const initialState: LoginState = {
  loginStatus: LoginStatus.NONE,
  activeMentor: {
    mentorStatus: MentorStatus.NONE,
  },
};

/** Actions */

/** Reducer */

export const loginSlice = createSlice({
  name: "login",
  initialState,
  reducers: {
    onLogout: (state) => {
      delete state.user;
      delete state.accessToken;
      state.loginStatus = LoginStatus.NOT_LOGGED_IN;
    },
    loadingInProgress: (state, action: PayloadAction<LoginState>) => {
      state.activeMentor.mentorStatus = MentorStatus.LOADING;
      state.activeMentor.userLoadedBy = action.payload.user?._id;
    },
    clearError: (state) => {
      delete state.activeMentor.error;
    },
    updateMentor: (state, action: PayloadAction<Mentor>) => {
      state.activeMentor.data = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        delete state.user;
        state.loginStatus = LoginStatus.IN_PROGRESS;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.loginStatus = LoginStatus.AUTHENTICATED;
      })
      .addCase(login.rejected, (state) => {
        delete state.user;
        state.loginStatus = LoginStatus.FAILED;
      })
      .addCase(googleLogin.pending, (state) => {
        delete state.user;
        state.loginStatus = LoginStatus.IN_PROGRESS;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.loginStatus = LoginStatus.AUTHENTICATED;
      })
      .addCase(googleLogin.rejected, (state) => {
        delete state.user;
        state.loginStatus = LoginStatus.FAILED;
      })
      .addCase(loadMentor.fulfilled, (state, action) => {
        if (action.payload.isCancelled || !action.payload.result) {
          return;
        }
        state.activeMentor.data = action.payload.result;
        state.activeMentor.mentorStatus = MentorStatus.SUCCEEDED;
      })
      .addCase(loadMentor.rejected, (state) => {
        delete state.activeMentor.data;
        state.activeMentor.error = {
          message: "failed to load mentor",
          error: loadMentor.rejected.name,
        };
        state.activeMentor.mentorStatus = MentorStatus.FAILED;
      })
      .addCase(saveMentor.pending, (state) => {
        state.activeMentor.mentorStatus = MentorStatus.SAVING;
      })
      .addCase(saveMentor.fulfilled, (state, action) => {
        state.activeMentor.data = action.payload as Mentor;
        state.activeMentor.mentorStatus = MentorStatus.SUCCEEDED;
      })
      .addCase(saveMentor.rejected, (state) => {
        state.activeMentor.mentorStatus = MentorStatus.FAILED;
        state.activeMentor.error = {
          message: "failed to save mentor",
          error: saveMentor.rejected.name,
        };
      })
      .addCase(saveThumbnail.pending, (state) => {
        state.activeMentor.mentorStatus = MentorStatus.SAVING;
      })
      .addCase(saveThumbnail.fulfilled, (state, action) => {
        if (state.activeMentor.data) {
          state.activeMentor.data.thumbnail = String(action.payload);
        }
        state.activeMentor.mentorStatus = MentorStatus.SUCCEEDED;
      })
      .addCase(saveThumbnail.rejected, (state) => {
        state.activeMentor.mentorStatus = MentorStatus.FAILED;
        state.activeMentor.error = {
          message: "failed to save mentor",
          error: saveThumbnail.rejected.name,
        };
      })
      .addCase(saveMentorSubjects.pending, (state) => {
        state.activeMentor.mentorStatus = MentorStatus.SAVING;
      })
      .addCase(saveMentorSubjects.fulfilled, (state, action) => {
        state.activeMentor.data = action.payload as Mentor;
        state.activeMentor.mentorStatus = MentorStatus.SUCCEEDED;
      })
      .addCase(saveMentorSubjects.rejected, (state) => {
        state.activeMentor.mentorStatus = MentorStatus.FAILED;
        state.activeMentor.error = {
          message: "failed to save subjects",
          error: saveMentorSubjects.rejected.name,
        };
      });
  },
});

export const { onLogout, clearError, updateMentor } = loginSlice.actions;

export default loginSlice.reducer;
