/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
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
}

const initialState: LoginState = {
  loginStatus: LoginStatus.NONE,
};

/** Actions */

export const googleLogin = createAsyncThunk(
  "login/googleLogin",
  async (accessToken: string, { rejectWithValue }) => {
    try {
      const googleToken = await api.loginGoogle(accessToken);
      return await api.login(googleToken.accessToken);
    } catch (err) {
      console.error(err.response.data);
      return rejectWithValue(err.response.data);
    }
  }
);

// This is the action that calls the api and sets the userSawSplashScreen action in motion
export const userSawSplashScreen = createAsyncThunk(
  "login/userSawSplashScreen", //action
  //callback function
  async (accessToken: string, { rejectWithValue }) => {
    try {
      //promise
      return await api.updateMyFirstTimeTracking(
        { myMentorSplash: true },
        accessToken
      );
    } catch (err) {
      console.error(err.response.data);
      return rejectWithValue(err.response.data);
    }
  }
);

// This is the action that calls the api and sets the userSawSplashScreen action in motion
export const userSawNameSplash = createAsyncThunk(
  "login/userSawNameSplash", //action
  //callback function
  async (accessToken: string, { rejectWithValue }) => {
    try {
      //promise
      return await api.updateMyFirstTimeTracking(
        { nameSplash: showTip },
        accessToken
      );
    } catch (err) {
      console.error(err.response.data);
      return rejectWithValue(err.response.data);
    }
  }
);

// // This is the action that calls the api and sets the userSawSplashScreen action in motion
// export const userSawStatusSplash = createAsyncThunk(
//   "login/userSawSplashScreen", //action
//   //callback function
//   async (accessToken: string, { rejectWithValue }) => {
//     try {
//       //promise
//       return await api.updateMyFirstTimeTracking(
//         { statusSplash: true },
//         accessToken
//       );
//     } catch (err) {
//       console.error(err.response.data);
//       return rejectWithValue(err.response.data);
//     }
//   }
// );

// // This is the action that calls the api and sets the userSawSplashScreen action in motion
// export const userSawCategoriesSplash = createAsyncThunk(
//   "login/userSawSplashScreen", //action
//   //callback function
//   async (accessToken: string, { rejectWithValue }) => {
//     try {
//       //promise
//       return await api.updateMyFirstTimeTracking(
//         { categoriesSplash: true },
//         accessToken
//       );
//     } catch (err) {
//       console.error(err.response.data);
//       return rejectWithValue(err.response.data);
//     }
//   }
// );

// // This is the action that calls the api and sets the userSawSplashScreen action in motion
// export const userSawSaveSplash = createAsyncThunk(
//   "login/userSawSplashScreen", //action
//   //callback function
//   async (accessToken: string, { rejectWithValue }) => {
//     try {
//       //promise
//       return await api.updateMyFirstTimeTracking(
//         { saveSplash: true },
//         accessToken
//       );
//     } catch (err) {
//       console.error(err.response.data);
//       return rejectWithValue(err.response.data);
//     }
//   }
// );

// // This is the action that calls the api and sets the userSawSplashScreen action in motion
// export const userSawBuildSplash = createAsyncThunk(
//   "login/userSawSplashScreen", //action
//   //callback function
//   async (accessToken: string, { rejectWithValue }) => {
//     try {
//       //promise
//       return await api.updateMyFirstTimeTracking(
//         { buildSplash: true },
//         accessToken
//       );
//     } catch (err) {
//       console.error(err.response.data);
//       return rejectWithValue(err.response.data);
//     }
//   }
// );

// // This is the action that calls the api and sets the userSawSplashScreen action in motion
// export const userSawPreviewSplash = createAsyncThunk(
//   "login/userSawSplashScreen", //action
//   //callback function
//   async (accessToken: string, { rejectWithValue }) => {
//     try {
//       //promise
//       return await api.updateMyFirstTimeTracking(
//         { previewSplash: true },
//         accessToken
//       );
//     } catch (err) {
//       console.error(err.response.data);
//       return rejectWithValue(err.response.data);
//     }
//   }
// );

// export const userSawRecommenderSplash = createAsyncThunk(
//   "login/userSawSplashScreen", //action
//   //callback function
//   async (accessToken: string, { rejectWithValue }) => {
//     try {
//       //promise
//       return await api.updateMyFirstTimeTracking(
//         { recommenderSplash: true },
//         accessToken
//       );
//     } catch (err) {
//       console.error(err.response.data);
//       return rejectWithValue(err.response.data);
//     }
//   }
// );

export const login = createAsyncThunk(
  "login/login",
  async (accessToken: string, { rejectWithValue }) => {
    try {
      localStorageStore(ACCESS_TOKEN_KEY, accessToken);
      sessionStorageClear(ACTIVE_MENTOR_KEY);
      return await api.login(accessToken);
    } catch (err) {
      console.error(err.response.data);
      return rejectWithValue(err.response.data);
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
  reducers: {},
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
        sessionStorageStore(
          ACTIVE_MENTOR_KEY,
          action.payload.user.defaultMentor._id
        );
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
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.loginStatus = LoginStatus.AUTHENTICATED;
      })
      .addCase(googleLogin.rejected, (state) => {
        delete state.user;
        state.loginStatus = LoginStatus.FAILED;
      })
      // Add cases for userSawSplashScreen action here, all you need for this one is the fulfilled case
      .addCase(userSawSplashScreen.fulfilled, (state, action) => {
        if (state.user != undefined) {
          state.user.firstTimeTracking.myMentorSplash =
            action.payload.myMentorSplash;
        }
      })
      .addCase(userSawNameSplash.fulfilled, (state, action) => {
        if (state.user != undefined) {
          state.user.firstTimeTracking.nameSplash = action.payload.nameSplash;
        }
      });
    // .addCase(userSawStatusSplash.fulfilled, (state, action) => {
    //   if (state.user != undefined) {
    //     state.user.firstTimeTracking.nameSplash =
    //       action.payload.nameSplash;
    //   }
    // });
  },
});

export default loginSlice.reducer;
