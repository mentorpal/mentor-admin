/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { createSlice } from "@reduxjs/toolkit";
import { PayloadAction } from "@reduxjs/toolkit";

export interface UploadedFile {
  questionId: string;
  fileUrl: string;
}

type QuestionId = string;
type FileUrl = string;

type UploadingFiles = Record<QuestionId, FileUrl>;

export interface UploadInitState {
  uploadsInitializing: string[];
  uploadingFiles: UploadingFiles;
  warnFailedUpload: boolean;
}

const initialState: UploadInitState = {
  uploadsInitializing: [],
  uploadingFiles: {},
  warnFailedUpload: false,
};

export const uploadInitStatusSlice = createSlice({
  name: "uploadInitStatus",
  initialState,
  reducers: {
    uploadInitStarted: (state, action: PayloadAction<string>) => {
      state.uploadsInitializing.push(action.payload);
    },
    uploadInitCompleted: (state, action: PayloadAction<string>) => {
      state.uploadsInitializing = state.uploadsInitializing.filter(
        (uploadId) => uploadId != action.payload
      );
    },
    newFileUploadStarted: (state, action: PayloadAction<UploadedFile>) => {
      state.uploadingFiles[action.payload.questionId] = action.payload.fileUrl;
    },
    fileFinishedUploading: (state, action: PayloadAction<QuestionId>) => {
      delete state.uploadingFiles[action.payload];
    },
    uploadFailed: (state) => {
      state.warnFailedUpload = true;
    },
  },
});

export const {
  uploadInitStarted,
  uploadInitCompleted,
  newFileUploadStarted,
  fileFinishedUploading,
  uploadFailed,
} = uploadInitStatusSlice.actions;

export default uploadInitStatusSlice.reducer;
