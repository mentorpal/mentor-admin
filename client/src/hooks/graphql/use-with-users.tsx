/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { fetchUsers, updateMentorPrivacy, updateUserPermissions } from "api";
import { useState } from "react";
import { Connection, User } from "types";
import { LoadingError } from "./loading-reducer";
import {
  useWithDataConnection,
  UseDataConnection,
} from "./use-with-data-connection";

export interface UseUserData extends UseDataConnection<User> {
  onUpdateUserPermissions: (userId: string, permissionLevel: string) => void;
  onUpdateMentorPrivacy: (mentorId: string, isPrivate: boolean) => void;
  userDataError?: LoadingError;
}

export function useWithUsers(accessToken: string): UseUserData {
  const [userDataError, setUserDataError] = useState<LoadingError>();
  const {
    data,
    isLoading,
    searchParams,
    error,
    reloadData,
    editData,
    saveData,
    sortBy,
    filter,
    nextPage,
    prevPage,
    setSearchParams,
  } = useWithDataConnection<User>(fetch);

  function fetch(): Promise<Connection<User>> {
    return fetchUsers(accessToken, searchParams);
  }

  function onUpdateUserPermissions(
    userId: string,
    permissionLevel: string
  ): void {
    updateUserPermissions(userId, permissionLevel, accessToken)
      .then(() => {
        reloadData();
      })
      .catch((err) => {
        setUserDataError({
          message: "Failed to update user permissions",
          error: `${err}`,
        });
      });
  }

  function onUpdateMentorPrivacy(mentorId: string, isPrivate: boolean): void {
    updateMentorPrivacy(mentorId, isPrivate, accessToken)
      .then(() => {
        reloadData();
      })
      .catch((err) => {
        setUserDataError({
          message: "Failed to update mentor privacy",
          error: `${err}`,
        });
      });
  }

  return {
    data,
    isLoading,
    searchParams,
    error,
    userDataError,
    reloadData,
    editData,
    saveData,
    sortBy,
    filter,
    nextPage,
    prevPage,
    onUpdateUserPermissions,
    onUpdateMentorPrivacy,
    setSearchParams,
  };
}
