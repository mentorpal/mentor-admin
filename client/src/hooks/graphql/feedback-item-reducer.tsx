/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
// /*
// This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved.
// Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

// The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
// */

// import { QuestionState } from "store/slices/questions";
// import { Answer, UserQuestion } from "types";

// export interface FeedbackItemState {
//   userQuestion: UserQuestion; //Previously called feedback
//   userQuestionDocument?: QuestionState;
//   userQuestionAlreadyAnswered: boolean;
//   userQuestionInQueue: boolean;
//   graderAnswerInQueue: boolean;
//   displayUserQuestionButton: boolean;
//   displayGraderAnswerButton: boolean;
// }

// export interface FeedbackItemAction {
//   type: FeedbackItemActionType;
//   payload?: Answer | string;
// }

// export enum FeedbackItemActionType {
//   INITIALIZE = "INITIALIZE",
//   GRADER_ANSWER_SELECTED = "GRADER_ANSWER_SELECTED",
//   GRADER_ANSWER_CLEARED = "GRADER_ANSWER_CLEARED",
//   ADD_GRADER_ANSWER_TO_QUEUE = "ADD_GRADER_ANSWER_TO_QUEUE",
//   ADD_USER_QUESTION_TO_QUEUE = "ADD_USER_QUESTION_TO_QUEUE"
// }

// export function FeedbackItemReducer(
//   state: FeedbackItemState,
//   action: FeedbackItemAction
// ): LoadingState {
//   const { type, payload } = action;
//   switch (type) {
//     case LoadingActionType.LOADING_STARTED:
//       return { status: LoadingStatusType.LOADING };
//     case LoadingActionType.SAVING_STARTED:
//       return { status: LoadingStatusType.SAVING };
//     case LoadingActionType.LOADING_SUCCEEDED:
//     case LoadingActionType.SAVING_SUCCEEDED:
//       return { status: LoadingStatusType.SUCCESS };
//     case LoadingActionType.LOADING_FAILED:
//     case LoadingActionType.SAVING_FAILED:
//       return { status: LoadingStatusType.ERROR, error: payload };
//     default:
//       return { status: LoadingStatusType.NONE };
//   }
// }
