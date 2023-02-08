/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { logger } from "redux-logger";
import { configureStore } from "@reduxjs/toolkit";
import loginReducer from "./slices/login";
import configReducer from "./slices/config";
import uploadInitReducer from "./slices/upload-init-status";
import mentorReducer from "./slices/mentor";
import questionsReducer from "./slices/questions";
import * as Sentry from "@sentry/react";

const sentryEnhancer = Sentry.createReduxEnhancer({
  actionTransformer: (action) => {
    if (action.error) {
      Sentry.captureException(Error(JSON.stringify(action.error)));
    }
    return action;
  },
});

export const store = configureStore({
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
  reducer: {
    login: loginReducer,
    config: configReducer,
    mentor: mentorReducer,
    questions: questionsReducer,
    uploads: uploadInitReducer,
  },
  enhancers: (defaultEhancers) => defaultEhancers.concat(sentryEnhancer),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
