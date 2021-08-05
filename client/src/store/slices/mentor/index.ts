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

export interface MentorState {
  data?: Mentor;
  editedData?: Mentor;
  isEdited?: boolean;
  mentorStatus: MentorStatus;
  error?: LoadingError;
}

const initialState: MentorState = {
  mentorStatus: MentorStatus.NONE,
};

/** Actions */

export const loadMentor = createAsyncThunk(
  "mentor/loadMentor",
  async (accessToken: string): Promise<Mentor> => {
    return api.fetchMentor(accessToken);
  }
);

export const saveMentor = createAsyncThunk(
  "mentor/saveMentor",
  async (headers: {
    accessToken: string;
    editedData: Mentor;
  }): Promise<boolean | unknown> => {
    try {
      return await api.updateMentorDetails(
        headers.editedData,
        headers.accessToken
      );
    } catch (err) {
      return err.response.data;
    }
  }
);

export const saveThumbnail = createAsyncThunk(
  "mentor/saveThumbnail",
  async (headers: {
    accessToken: string;
    mentorId: string;
    file: File;
  }): Promise<string | unknown> => {
    try {
      return await api
        .uploadThumbnail(headers.mentorId, headers.file)
        .then(() => {
          api.fetchThumbnail(headers.accessToken);
        });
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
  }): Promise<boolean | unknown> => {
    try {
      return await api.updateMentorSubjects(
        headers.editedData,
        headers.accessToken
      );
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
    editMentor: (state, action: PayloadAction<Partial<Mentor>>) => {
      if (state.data) {
        state.editedData = {
          ...state.data,
          ...(state.editedData || {}),
          ...action.payload,
        };
        state.isEdited = true;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadMentor.pending, (state) => {
        delete state.data;

        state.mentorStatus = MentorStatus.LOADING;
      })
      .addCase(loadMentor.fulfilled, (state, action) => {
        state.data = action.payload;
        state.editedData = action.payload;
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
        state.mentorStatus = MentorStatus.LOADING;
        state.isEdited = false;
      })
      .addCase(saveMentor.fulfilled, (state) => {
        state.data = state.editedData;

        state.mentorStatus = MentorStatus.SUCCEEDED;
      })
      .addCase(saveMentor.rejected, (state) => {
        state.mentorStatus = MentorStatus.FAILED;
        state.isEdited = true;
        state.error = {
          message: "failed to save mentor",
          error: saveMentor.rejected.name,
        };
      })
      .addCase(saveThumbnail.pending, (state) => {
        state.mentorStatus = MentorStatus.SAVING;
      })
      .addCase(saveThumbnail.fulfilled, (state, action) => {
        if (state.data) {
          state.data.thumbnail = String(action.payload);
        }
        state.mentorStatus = MentorStatus.SUCCEEDED;
      })
      .addCase(saveThumbnail.rejected, (state) => {
        state.mentorStatus = MentorStatus.FAILED;
        state.error = {
          message: "failed to save mentor",
          error: saveMentor.rejected.name,
        };
      })
      .addCase(saveMentorSubjects.pending, (state) => {
        state.mentorStatus = MentorStatus.LOADING;
        state.isEdited = false;
      })
      .addCase(saveMentorSubjects.fulfilled, (state) => {
        state.data = state.editedData;
        state.isEdited = false;
        state.mentorStatus = MentorStatus.SUCCEEDED;
      })
      .addCase(saveMentorSubjects.rejected, (state) => {
        state.mentorStatus = MentorStatus.FAILED;
        state.isEdited = true;
        state.error = {
          message: "failed to save subjects",
          error: saveMentorSubjects.rejected.name,
        };
      });
  },
});

export default mentorSlice.reducer;
