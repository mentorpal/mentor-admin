/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as api from "api";
import { LoadingError } from "hooks/graphql/loading-reducer";
import { Mentor } from "types";

/** Store */

export enum MentorStatus {
  NONE = 0,
  LOADING = 1,
  SAVING = 2,
  SUCCEEDED = 3,
  FAILED = 4,
}

export interface MentorsState {
  mentors: Record<string, Mentor>;
  mentorStatus: MentorStatus;
}

const initialState: MentorsState = {
  mentors: {},
  mentorStatus: MentorStatus.NONE,
};

/** Actions */

export const loadMentor = createAsyncThunk(
  "mentor/loadMentor",
  async (accessToken: string): Promise<Mentor> => {
    return api.fetchMentor(accessToken);
  }
);

export const loadMentorById = createAsyncThunk(
  "mentor/loadMentor",
  async (headers: {
    accessToken: string;
    mentorId: string;
  }): Promise<Mentor> => {
    return api.fetchMentorById(headers.accessToken, headers.mentorId);
  }
);

/** Reducer */

export const mentorSlice = createSlice({
  name: "mentor",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadMentor.pending, (state) => {
        state.mentorStatus = MentorStatus.LOADING;
      })
      .addCase(loadMentor.fulfilled, (state, action) => {
        state.mentorStatus = MentorStatus.SUCCEEDED;
      })
      .addCase(loadMentor.rejected, (state) => {
        state.mentorStatus = MentorStatus.FAILED;
      });
  },
});

export default mentorSlice.reducer;
