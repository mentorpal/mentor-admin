/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu
The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchSubjectsById, updateSubject } from "api";
import { getValueIfKeyExists } from "helpers";
import { LoadingError, LoadingStatus } from "hooks/graphql/loading-reducer";
import { RootState } from "store/store";
import { Subject } from "types";
import { convertSubjectGQL, SubjectGQL } from "types-gql";
import { questionsSlice, saveQuestion } from "../questions";

/** Store */

export interface SubjectsState {
  subjects: Record<string, SubjectState>;
}

export interface SubjectState {
  subject?: Subject;
  status: LoadingStatus;
  error?: LoadingError;
}

const initialState: SubjectsState = {
  subjects: {},
};

/** Actions */

export const loadSubjectsById = createAsyncThunk(
  "subjects/loadSubjectsById",
  async (
    args: { ids: string[]; reload?: boolean },
    thunkAPI
  ): Promise<Subject[]> => {
    const state = thunkAPI.getState() as RootState;
    const ids = args.reload
      ? args.ids
      : args.ids.filter((id) => {
          const s = getValueIfKeyExists(id, state.subjects.subjects);
          return (
            !s ||
            s.status === LoadingStatus.FAILED ||
            s.status === LoadingStatus.NONE
          );
        });
    for (const id in ids) {
      thunkAPI.dispatch(subjectsSlice.actions.loadingInProgress(id));
    }
    if (ids.length === 0) {
      return [];
    }
    return await fetchSubjectsById(ids);
  }
);

export const saveSubject = createAsyncThunk(
  "subjects/saveSubject",
  async (editedData: SubjectGQL, thunkAPI): Promise<Subject> => {
    thunkAPI.dispatch(subjectsSlice.actions.savingInProgress(editedData._id));
    const state = thunkAPI.getState() as RootState;
    if (!state.login.accessToken) {
      return Promise.reject("no access token");
    }
    const subject = await updateSubject(editedData, state.login.accessToken);
    for (const sq of subject.questions) {
      const q = sq.question;
      thunkAPI.dispatch(saveQuestion(q));
    }
    return convertSubjectGQL(subject);
  }
);

/** Reducer */

export const subjectsSlice = createSlice({
  name: "subjects",
  initialState,
  reducers: {
    loadingInProgress: (state, action: PayloadAction<string>) => {
      state.subjects[action.payload] = {
        ...state.subjects[action.payload],
        status: LoadingStatus.LOADING,
        error: undefined,
      };
    },
    savingInProgress: (state, action: PayloadAction<string>) => {
      state.subjects[action.payload] = {
        ...state.subjects[action.payload],
        status: LoadingStatus.SAVING,
        error: undefined,
      };
    },
    clearError: (state, action: PayloadAction<string>) => {
      state.subjects[action.payload] = {
        ...state.subjects[action.payload],
        error: undefined,
      };
    },
    clearErrors: (state) => {
      for (const k of Object.keys(state.subjects)) {
        state.subjects[k] = {
          ...state.subjects[k],
          error: undefined,
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // loadSubjectsById
      .addCase(loadSubjectsById.fulfilled, (state, action) => {
        for (const s of action.payload) {
          state.subjects[s._id] = {
            subject: s,
            status: LoadingStatus.SUCCEEDED,
            error: undefined,
          };
        }
      })
      .addCase(loadSubjectsById.rejected, (state, action) => {
        for (const id of action.meta.arg.ids) {
          state.subjects[id] = {
            ...state.subjects[id],
            status: LoadingStatus.FAILED,
            error: {
              message: `failed to load subject`,
              error: loadSubjectsById.rejected.name,
            },
          };
        }
      })
      // saveSubject
      .addCase(saveSubject.fulfilled, (state, action) => {
        const s = action.payload;
        if (action.meta.arg._id !== s._id) {
          delete state.subjects[action.meta.arg._id];
        }
        state.subjects[s._id] = {
          subject: s,
          status: LoadingStatus.SUCCEEDED,
          error: undefined,
        };
      })
      .addCase(saveSubject.rejected, (state, action) => {
        state.subjects[action.meta.arg._id] = {
          ...state.subjects[action.meta.arg._id],
          status: LoadingStatus.FAILED,
          error: {
            message: `failed to save subject`,
            error: saveSubject.rejected.name,
          },
        };
      });
  },
});

export default subjectsSlice.reducer;
