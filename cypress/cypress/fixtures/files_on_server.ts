/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { MountedFilesStatus, ServerStorageInfo } from "../support/types";

export const fileStatusOnServer: MountedFilesStatus = {
  mountedFiles: [
    "f5c5aaf8-aaf8-4fe0-84c4-da3a1c5f9305-clint-A1_1_1.mp4",
    "7da74796-3b2a-47bf-b49f-0a8d91f06152-mark-A3_1_1.mp4",
    "f5c5aaf8-aaf8-4fe0-84c4-da3a1c5f9305-jacob-A1_1_1.mp4",
    "f5c5aaf8-aaf8-4fe0-84c4-da3a1c5f9305-6184d14c068d43dc6822a721-60c7b69407dd702a7c3c5963.mp4",
  ],
};

export const storageInfoOnServer: ServerStorageInfo = {
  freeStorage: 147618332672,
  totalStorage: 269490393088,
  usedStorage: 108111388672,
};
