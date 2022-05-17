/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useSelector } from "react-redux";
import { useAppDispatch } from "store/hooks";
import { useWithConfig } from "store/slices/config/useWithConfig";
import { useWithLogin } from "store/slices/login/useWithLogin";
import { saveThumbnail } from "store/slices/mentor";
import { selectActiveMentor } from "store/slices/mentor/useActiveMentor";
import { RootState } from "store/store";

export function useWithThumbnail(): [string, (file: File) => void] {
  const thumbnail = useSelector<RootState, string>((s: RootState) => {
    return selectActiveMentor(s).data?.thumbnail || "";
  });
  const dispatch = useAppDispatch();
  const { state: loginState } = useWithLogin();
  const { state: configState } = useWithConfig();

  function updateThumbnail(file: File) {
    dispatch(
      saveThumbnail({
        file,
        accessToken: loginState.accessToken || "",
        uploadLambdaUrl: configState.config?.uploadLambdaEndpoint || "",
      })
    );
  }

  return [thumbnail, updateThumbnail];
}
