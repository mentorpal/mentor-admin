/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu
The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as api from "api";
import { extractErrorMessageFromError, splitArrayIntoChunksOfN } from "helpers";
import { LoadingError, LoadingStatus } from "hooks/graphql/loading-reducer";
import { RootState } from "store/store";
import {
  Answer,
  externalVideoIdsDefault,
  Mentor,
  Status,
} from "../../../types";
import { LoginState } from "../login";
import { selectActiveMentor } from "./useActiveMentor";
import { convertSubjectGQL } from "types-gql";

/** Store */

export interface MentorState {
  data?: Mentor;
  mentorStatus: LoadingStatus;
  error?: LoadingError;
  userLoadedBy?: string;
}

interface CancellabeResult<T> {
  result?: T;
  isCancelled?: boolean;
}

const initialState: MentorState = {
  mentorStatus: LoadingStatus.NONE,
};

/** Actions */

async function loadAndHydrateMentor(
  mentorId: string,
  accessToken: string
): Promise<Mentor> {
  const mentor = await api.fetchDehydratedMentor(accessToken, mentorId);
  const tempAnswers = (mentor.answers || []).filter((a) => a.docMissing);
  const hydratedTempAnswers: Answer[] = tempAnswers.map((a) => {
    return {
      ...a,
      question: a.question._id,
      hasEditedTranscript: false,
      markdownTranscript: "",
      transcript: "",
      status: Status.NONE,
      hasUntransferredMedia: false,
      webMedia: undefined,
      mobileMedia: undefined,
      vttMedia: undefined,
      previousVersions: [],
      questionClientId: a.question.clientId,
      externalVideoIds: externalVideoIdsDefault,
      media: [],
      docMissing: true,
    };
  });
  const answerIds = (mentor.answers || [])
    .filter((a) => !a.docMissing)
    .map((a) => a._id);
  const answerChunks = splitArrayIntoChunksOfN(answerIds, 100);
  const orphanedAnswerIds = (mentor.orphanedCompleteAnswers || [])
    .filter((a) => Boolean(a._id))
    .map((a) => a._id);
  const orphanChunks = splitArrayIntoChunksOfN(orphanedAnswerIds, 100);
  const answerPromises = answerChunks.map((chunk) =>
    api.fetchAnswers(accessToken, chunk)
  );
  const orphanedAnswerPromises = orphanChunks.map((chunk) =>
    api.fetchAnswers(accessToken, chunk)
  );
  const answerResults = await Promise.all(answerPromises);
  const orphanedAnswerResults = await Promise.all(orphanedAnswerPromises);
  const answers = answerResults.flat();
  const orphanedAnswers = orphanedAnswerResults.flat();
  const hydratedMentor: Mentor = {
    ...mentor,
    defaultSubject: mentor.defaultSubject
      ? convertSubjectGQL(mentor.defaultSubject)
      : undefined,
    subjects: mentor.subjects?.map((s) => convertSubjectGQL(s)),
    answers: [...answers, ...hydratedTempAnswers, ...orphanedAnswers],
    orphanedCompleteAnswers: orphanedAnswers,
  };
  return hydratedMentor;
}

export const loadMentor = createAsyncThunk(
  "mentor/loadMentor",
  async (
    headers: { mentorId?: string },
    thunkAPI
  ): Promise<CancellabeResult<Mentor>> => {
    const state = thunkAPI.getState() as RootState;
    if (
      state.mentor.mentorStatus == LoadingStatus.LOADING ||
      state.mentor.mentorStatus == LoadingStatus.SAVING
    ) {
      return { isCancelled: true };
    }
    thunkAPI.dispatch(mentorSlice.actions.loadingInProgress(state.login));
    if (!state.login.accessToken || !state.login.user?.defaultMentor._id) {
      return Promise.reject("no access token");
    } else {
      const mentorId = headers.mentorId || state.login.user?.defaultMentor._id;
      const HydratedMentor = await loadAndHydrateMentor(
        mentorId,
        state.login.accessToken
      );
      return { result: HydratedMentor };
    }
  }
);

export const saveMentor = createAsyncThunk(
  "mentor/saveMentor",
  async (editedData: Mentor, thunkAPI): Promise<Mentor | unknown> => {
    const state = thunkAPI.getState() as RootState;
    if (state.login.accessToken) {
      try {
        await api.updateMentorDetails(
          editedData,
          state.login.accessToken,
          editedData._id
        );
        return editedData;
      } catch (err) {
        throw new Error(extractErrorMessageFromError(err));
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
        await api.updateMentorSubjects(
          editedData,
          state.login.accessToken,
          editedData._id
        );
        // need to fetch the updated mentor because the questions/answers might have changed
        return loadAndHydrateMentor(editedData._id, state.login.accessToken);
      } catch (err) {
        throw new Error(extractErrorMessageFromError(err));
      }
    }
  }
);

export const saveMentorKeywords = createAsyncThunk(
  "mentor/saveMentorKeywords",
  async (editedData: Mentor, thunkAPI): Promise<Mentor | unknown> => {
    const state = thunkAPI.getState() as RootState;
    if (state.login.accessToken) {
      try {
        await api.updateMentorKeywords(
          state.login.accessToken,
          editedData,
          editedData._id
        );
        // need to fetch the updated mentor
        return loadAndHydrateMentor(editedData._id, state.login.accessToken);
      } catch (err) {
        throw new Error(extractErrorMessageFromError(err));
      }
    }
  }
);

export const saveMentorPrivacy = createAsyncThunk(
  "mentor/saveMentorPrivacy",
  async (editedData: Mentor, thunkAPI): Promise<Mentor | unknown> => {
    const state = thunkAPI.getState() as RootState;
    if (state.login.accessToken) {
      try {
        await api.updateMentorPrivacy(
          state.login.accessToken,
          editedData,
          editedData._id
        );
        // need to fetch the updated mentor
        return loadAndHydrateMentor(editedData._id, state.login.accessToken);
      } catch (err) {
        throw new Error(extractErrorMessageFromError(err));
      }
    }
  }
);

export const saveThumbnail = createAsyncThunk(
  "mentor/saveThumbnail",
  async (
    headers: {
      file: File;
      accessToken: string;
      uploadLambdaUrl: string;
    },
    thunkAPI
  ): Promise<string | unknown> => {
    try {
      const state = thunkAPI.getState() as RootState;
      const mentorId = selectActiveMentor(state).data?._id || "";
      if (!mentorId) {
        return Promise.reject("upload api called with no active mentor");
      }
      if (!headers.accessToken || !headers.uploadLambdaUrl || !headers.file) {
        return Promise.reject(
          `upload thumbnail called without proper header: ${JSON.stringify(
            headers
          )}`
        );
      }
      return await api.uploadThumbnail(
        mentorId,
        headers.file,
        headers.accessToken,
        headers.uploadLambdaUrl
      );
    } catch (err) {
      throw new Error(extractErrorMessageFromError(err));
    }
  }
);

/** Reducer */

export const mentorSlice = createSlice({
  name: "mentor",
  initialState,
  reducers: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    loadingInProgress: (state: any, action: PayloadAction<LoginState>) => {
      state.mentorStatus = LoadingStatus.LOADING;
      state.userLoadedBy = action.payload.user?._id;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    clearError: (state: any) => {
      delete state.error;
    },
    updateAnswer: (state, action: PayloadAction<Answer>) => {
      if (state.data) {
        state.data.answers = state.data.answers.map((a) =>
          a.question === action.payload.question ? action.payload : a
        );
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadMentor.fulfilled, (state, action) => {
        if (action.payload.isCancelled || !action.payload.result) {
          return;
        }
        state.data = action.payload.result;
        state.mentorStatus = LoadingStatus.SUCCEEDED;
      })
      .addCase(loadMentor.rejected, (state) => {
        delete state.data;
        state.error = {
          message: "failed to load mentor",
          error: loadMentor.rejected.name,
        };
        state.mentorStatus = LoadingStatus.FAILED;
      })
      .addCase(saveMentor.pending, (state) => {
        state.mentorStatus = LoadingStatus.SAVING;
      })
      .addCase(saveMentor.fulfilled, (state, action) => {
        state.data = action.payload as Mentor;
        state.mentorStatus = LoadingStatus.SUCCEEDED;
      })
      .addCase(saveMentor.rejected, (state) => {
        state.mentorStatus = LoadingStatus.FAILED;
        state.error = {
          message: "failed to save mentor",
          error: saveMentor.rejected.name,
        };
      })
      .addCase(saveThumbnail.pending, (state) => {
        state.mentorStatus = LoadingStatus.SAVING;
      })
      .addCase(saveThumbnail.fulfilled, (state, action) => {
        if (state.data) {
          state.data.thumbnail = String(action.payload);
        }
        state.mentorStatus = LoadingStatus.SUCCEEDED;
      })
      .addCase(saveThumbnail.rejected, (state) => {
        state.mentorStatus = LoadingStatus.FAILED;
        state.error = {
          message: "failed to save thumbnail",
          error: saveThumbnail.rejected.name,
        };
      })
      .addCase(saveMentorSubjects.pending, (state) => {
        state.mentorStatus = LoadingStatus.SAVING;
      })
      .addCase(saveMentorSubjects.fulfilled, (state, action) => {
        state.data = action.payload as Mentor;
        state.mentorStatus = LoadingStatus.SUCCEEDED;
      })
      .addCase(saveMentorSubjects.rejected, (state) => {
        state.mentorStatus = LoadingStatus.FAILED;
        state.error = {
          message: "failed to save subjects",
          error: saveMentorSubjects.rejected.name,
        };
      })
      .addCase(saveMentorKeywords.pending, (state) => {
        state.mentorStatus = LoadingStatus.SAVING;
      })
      .addCase(saveMentorKeywords.fulfilled, (state, action) => {
        state.data = action.payload as Mentor;
        state.mentorStatus = LoadingStatus.SUCCEEDED;
      })
      .addCase(saveMentorKeywords.rejected, (state) => {
        state.mentorStatus = LoadingStatus.FAILED;
        state.error = {
          message: "failed to save keywords",
          error: saveMentorKeywords.rejected.name,
        };
      })
      .addCase(saveMentorPrivacy.pending, (state) => {
        state.mentorStatus = LoadingStatus.SAVING;
      })
      .addCase(saveMentorPrivacy.fulfilled, (state, action) => {
        state.data = action.payload as Mentor;
        state.mentorStatus = LoadingStatus.SUCCEEDED;
      })
      .addCase(saveMentorPrivacy.rejected, (state) => {
        state.mentorStatus = LoadingStatus.FAILED;
        state.error = {
          message: "failed to save privacy",
          error: saveMentorPrivacy.rejected.name,
        };
      });
  },
});

export const { clearError, updateAnswer } = mentorSlice.actions;

export default mentorSlice.reducer;
