/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as api from "api";
import {
  ACCESS_TOKEN_KEY,
  ACTIVE_MENTOR_KEY,
  localStorageClear,
  localStorageStore,
  sessionStorageClear,
  sessionStorageStore,
} from "store/local-storage";
import { User } from "types";
import { extractErrorMessageFromError } from "helpers";

/** Store */

export enum LoginStatus {
  NONE = 0,
  NOT_LOGGED_IN = 1,
  IN_PROGRESS = 2,
  AUTHENTICATED = 3,
  FAILED = 4,
}

export interface LoginState {
  accessToken?: string;
  loginStatus: LoginStatus;
  user?: User;
  isDisabled?: boolean;
}

const initialState: LoginState = {
  loginStatus: LoginStatus.NONE,
};

/** Actions */

// This is the action that calls the api and sets the userSawSplashScreen action in motion
export const userSawSplashScreen = createAsyncThunk(
  "login/userSawSplashScreen", //action
  //callback function
  async (accessToken: string) => {
    try {
      //promise
      return await api.updateMyFirstTimeTracking(
        { myMentorSplash: true },
        accessToken
      );
    } catch (err) {
      throw new Error(extractErrorMessageFromError(err));
    }
  }
);

// This is the action that calls the api and sets the userSawSplashScreen action in motion
export const userSawTooltips = createAsyncThunk(
  "login/userSawTooltips", //action
  //callback function
  async (accessToken: string) => {
    try {
      //promise
      return await api.updateMyFirstTimeTracking(
        { tooltips: true },
        accessToken
      );
    } catch (err) {
      throw new Error(extractErrorMessageFromError(err));
    }
  }
);

export const googleLogin = createAsyncThunk(
  "login/googleLogin",
  async (accessToken: string, thunkAPI) => {
    try {
      const googleLogin = await api.loginGoogle(accessToken);
      localStorageStore(ACCESS_TOKEN_KEY, googleLogin.accessToken);
      sessionStorageClear(ACTIVE_MENTOR_KEY);
      return await api.login(googleLogin.accessToken);
    } catch (err: unknown) {
      if (
        err instanceof Error &&
        err.message.includes("Your account has been disabled")
      ) {
        thunkAPI.dispatch(loginSlice.actions.setIsDisabled(true));
      }
      throw new Error(extractErrorMessageFromError(err));
    }
  }
);

export const login = createAsyncThunk(
  "login/login",
  async (accessToken: string, thunkAPI) => {
    try {
      localStorageStore(ACCESS_TOKEN_KEY, accessToken);
      sessionStorageClear(ACTIVE_MENTOR_KEY);
      return await api.login(accessToken);
    } catch (err: unknown) {
      if (
        err instanceof Error &&
        err.message.includes("Your account has been disabled")
      ) {
        thunkAPI.dispatch(loginSlice.actions.setIsDisabled(true));
      }
      throw new Error(extractErrorMessageFromError(err));
    }
  }
);

export const logout = createAsyncThunk(
  "login/logout",
  async (): Promise<void> => {
    localStorageClear(ACCESS_TOKEN_KEY);
    sessionStorageClear(ACTIVE_MENTOR_KEY);
  }
);

/** Reducer */

export const loginSlice = createSlice({
  name: "login",
  initialState,
  reducers: {
    setIsDisabled: (state: LoginState, action: PayloadAction<boolean>) => {
      state.isDisabled = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logout.fulfilled, (state) => {
        delete state.user;
        delete state.accessToken;
        state.loginStatus = LoginStatus.NOT_LOGGED_IN;
      })
      .addCase(login.pending, (state) => {
        delete state.user;
        state.loginStatus = LoginStatus.IN_PROGRESS;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.loginStatus = LoginStatus.AUTHENTICATED;
        if (action.payload.user) {
          sessionStorageStore(
            ACTIVE_MENTOR_KEY,
            action.payload.user.defaultMentor._id
          );
        }
      })
      .addCase(login.rejected, (state) => {
        delete state.user;
        state.loginStatus = LoginStatus.FAILED;
      })
      // Look at these googleLogin cases and do similar for userSawSplashScreen
      .addCase(googleLogin.pending, (state) => {
        delete state.user;
        state.loginStatus = LoginStatus.IN_PROGRESS;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.user = action.payload?.user;
        state.accessToken = action.payload?.accessToken;
        state.loginStatus = LoginStatus.AUTHENTICATED;
        if (action.payload.user) {
          sessionStorageStore(
            ACTIVE_MENTOR_KEY,
            action.payload.user.defaultMentor._id
          );
        }
      })
      .addCase(googleLogin.rejected, (state) => {
        delete state.user;
        state.loginStatus = LoginStatus.FAILED;
      })
      // Add cases for userSawSplashScreen action here, all you need for this one is the fulfilled case
      .addCase(userSawSplashScreen.fulfilled, (state, action) => {
        if (state.user != undefined && action.payload != undefined) {
          state.user.firstTimeTracking.myMentorSplash =
            action.payload.myMentorSplash;
        }
      })
      .addCase(userSawTooltips.fulfilled, (state, action) => {
        if (state.user != undefined) {
          state.user.firstTimeTracking.tooltips = action.payload.tooltips;
        }
      });
  },
});

export const { setIsDisabled } = loginSlice.actions;

export default loginSlice.reducer;
