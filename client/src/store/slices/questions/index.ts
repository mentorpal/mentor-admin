/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu
The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchQuestionsById, updateQuestion } from "api";
import { LoadingError } from "hooks/graphql/loading-reducer";
import { RootState } from "store/store";
import { Question } from "types";

/** Store */

export enum QuestionStatus {
  NONE = 0,
  LOADING = 1,
  SAVING = 2,
  SUCCEEDED = 3,
  FAILED = 4,
}

export interface QuestionsState {
  questions: Record<string, Question>;
  status: QuestionStatus;
  error?: LoadingError;
}

const initialState: QuestionsState = {
  questions: {},
  status: QuestionStatus.NONE,
};

/** Actions */

export const loadQuestionsById = createAsyncThunk(
  "questions/loadQuestionsById",
  async (args: { ids?: string[] }, thunkAPI): Promise<Question[]> => {
    thunkAPI.dispatch(questionsSlice.actions.loadingInProgress());
    return await fetchQuestionsById(args.ids);
  }
);

export const saveQuestion = createAsyncThunk(
  "questions/saveQuestion",
  async (editedData: Question, thunkAPI): Promise<Question> => {
    thunkAPI.dispatch(questionsSlice.actions.savingInProgress());
    const state = thunkAPI.getState() as RootState;
    if (!state.login.accessToken) {
      return Promise.reject("no access token");
    }
    await updateQuestion(editedData, state.login.accessToken);
    return editedData;
  }
);
/** Reducer */

export const questionsSlice = createSlice({
  name: "questions",
  initialState,
  reducers: {
    loadingInProgress: (state) => {
      state.status = QuestionStatus.LOADING;
    },
    savingInProgress: (state) => {
      state.status = QuestionStatus.SAVING;
    },
  },
  extraReducers: (builder) => {
    builder
      // loadQuestionsById
      .addCase(loadQuestionsById.fulfilled, (state, action) => {
        for (const q of action.payload) {
          state.questions[q._id] = q;
        }
        state.status = QuestionStatus.SUCCEEDED;
      })
      .addCase(loadQuestionsById.rejected, (state, action) => {
        state.error = {
          message: `failed to load questions: ${action.meta.arg}`,
          error: loadQuestionsById.rejected.name,
        };
        state.status = QuestionStatus.FAILED;
      })
      // saveQuestion
      .addCase(saveQuestion.fulfilled, (state, action) => {
        const q = action.payload;
        state.questions[q._id] = q;
        state.status = QuestionStatus.SUCCEEDED;
      })
      .addCase(saveQuestion.rejected, (state, action) => {
        state.error = {
          message: `failed to save question: ${action.meta.arg._id}`,
          error: saveQuestion.rejected.name,
        };
        state.status = QuestionStatus.FAILED;
      });
  },
});

export default questionsSlice.reducer;
