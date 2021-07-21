/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as api from "api";
import { LoginStatus, User } from "types";

export interface LoginState {
  accessToken: string | undefined;
  loginStatus: LoginStatus;
  user: User | undefined;
}

const initialState: LoginState = {
  accessToken: accessTokenGet(),
  loginStatus: LoginStatus.NONE,
  user: undefined,
};

const ACCESS_TOKEN_KEY = "accessToken";
function accessTokenGet(): string {
  if (typeof window === "undefined") {
    return "";
  }
  return localStorage.getItem(ACCESS_TOKEN_KEY) || "";
}
function accessTokenStore(accessToken: string): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
}
function accessTokenClear(): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export const googleLogin = createAsyncThunk(
  "login/googleLogin",
  async (accessToken: string) => {
    const googleToken = await api.loginGoogle(accessToken);
    return await api.login(googleToken.accessToken);
  }
);

export const login = createAsyncThunk(
  "login/login",
  async (accessToken: string) => {
    accessTokenStore(accessToken);
    return await api.login(accessToken);
  }
);

export const logout =
  () => (dispatch: (arg0: { payload: undefined; type: string }) => void) => {
    accessTokenClear();
    dispatch(onLogout());
  };

export const loginSlice = createSlice({
  name: "login",
  initialState,
  reducers: {
    onLogout: (state) => {
      state.user = undefined;
      state.accessToken = undefined;
      state.loginStatus = LoginStatus.NONE;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.user = undefined;
        state.loginStatus = LoginStatus.IN_PROGRESS;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.loginStatus = LoginStatus.AUTHENTICATED;
      })
      .addCase(login.rejected, (state) => {
        state.user = undefined;
        state.loginStatus = LoginStatus.FAILED;
      })
      .addCase(googleLogin.pending, (state) => {
        state.user = undefined;
        state.loginStatus = LoginStatus.IN_PROGRESS;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.loginStatus = LoginStatus.AUTHENTICATED;
      })
      .addCase(googleLogin.rejected, (state) => {
        state.user = undefined;
        state.loginStatus = LoginStatus.FAILED;
      });
  },
});
const { onLogout } = loginSlice.actions;

export default loginSlice.reducer;
