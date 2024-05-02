/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { CancelTokenSource } from "axios";
import {
  UserRole,
  MentorType,
  Subject,
  Topic,
  Answer,
  Category,
  Question,
  Status,
  Media,
  Feedback,
  ClassifierAnswerType,
  EditType,
  Connection,
  Mentor,
  UploadTask,
  UserQuestion,
  TaskInfo,
  SubjectTypes,
  OrgPermission,
  MentorDirtyReason,
  JobState,
  OrgViewPermissionType,
  OrgEditPermissionType,
} from "types";

export interface UserAccessTokenGQL {
  user: UserGQL;
  accessToken: string;
  expirationDate: string;
}

export interface UserGQL {
  _id: string;
  name: string;
  email: string;
  userRole: UserRole;
  defaultMentor: MentorGQL;
  isDisabled: boolean;
}

export interface OrgPermissionsGQL {
  org: string;
  viewPermission: OrgViewPermissionType;
  editPermission: OrgEditPermissionType;
}

export interface MentorConfig {
  configId: string;
  subjects: string[];
  lockedToSubjects: boolean;
  publiclyVisible: boolean;
  mentorType: MentorType;
  orgPermissions: OrgPermissionsGQL[];
  loginHeaderText: string;
  idleRecordingDuration: number;
  introRecordingText: string;
  welcomeSlideHeader: string;
  welcomeSlideText: string;
  disableMyGoalSlide: boolean;
  disableFollowups: boolean;
  disableKeywordsRecommendation: boolean;
  disableThumbnailRecommendation: boolean;
  disableLevelProgressDisplay: boolean;
  completeSubjectsNotificationText: string;
  recordTimeLimitSeconds: number;
}

export interface MentorGQL {
  _id: string;
  name: string;
  firstName: string;
  title: string;
  goal: string;
  email: string;
  allowContact: boolean;
  thumbnail: string;
  mentorType: MentorType;
  lastTrainedAt: string;
  lastPreviewedAt: string;
  numAnswersComplete: number;
  isDirty: boolean;
  lastTrainStatus: JobState;
  dirtyReason: MentorDirtyReason;
  isPublicApproved: boolean;
  directLinkPrivate: boolean;
  isPrivate: boolean;
  isArchived: boolean;
  isAdvanced: boolean;
  mentorConfig?: MentorConfig;
  lockedToConfig?: boolean;
  orgPermissions: OrgPermission[];
  defaultSubject?: SubjectGQL;
  subjects: SubjectGQL[];
  keywords: string[];
  topics: Topic[];
  answers: AnswerGQL[];
  orphanedCompleteAnswers: AnswerGQL[];
  hasVirtualBackground: boolean;
  virtualBackgroundUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubjectGQL {
  _id: string;
  name: string;
  type: SubjectTypes;
  description: string;
  isRequired: boolean;
  isArchived: boolean;
  deleted?: boolean;
  categories: Category[];
  topics: Topic[];
  questions: SubjectQuestionGQL[];
}

export enum UseDefaultTopics {
  TRUE = "TRUE",
  FALSE = "FALSE",
  DEFAULT = "DEFAULT",
}

export interface SubjectQuestionGQL {
  question: Question;
  category?: Category;
  topics: Topic[];
  useDefaultTopics: UseDefaultTopics;
}

export interface AddOrUpdateQuestionGQL {
  question: string;
  category?: string;
  topics: string[];
  useDefaultTopics: UseDefaultTopics;
}

export interface ExternalVideoIdsGQL {
  wistiaId: string;
}

export interface PreviousAnswerVersion {
  transcript: string;
  webVideoHash: string;
  vttText: string;
  videoDuration: number;
  dateVersioned: string;
}

export interface AnswerGQL {
  _id: string;
  question: Question;
  hasEditedTranscript: boolean;
  transcript: string;
  markdownTranscript?: string;
  status: Status;
  webMedia?: Media;
  mobileMedia?: Media;
  vttMedia?: Media;
  hasUntransferredMedia: boolean;
  externalVideoIds: ExternalVideoIdsGQL;

  previousVersions: PreviousAnswerVersion[];
}

export interface UserQuestionGQL {
  _id: string;
  question: string;
  confidence: number;
  feedback: Feedback;
  mentor: MentorGQL;
  classifierAnswerType: ClassifierAnswerType;
  classifierAnswer: AnswerGQL;
  graderAnswer: AnswerGQL;
  dismissed: boolean;
  updatedAt: string;
  createdAt: string;
}

export interface UploadTaskGQL {
  question: Question;
  trimUploadTask?: TaskInfo;
  transcodeWebTask?: TaskInfo;
  transcodeMobileTask?: TaskInfo;
  transcribeTask?: TaskInfo;
  uploadProgress: number;
  errorMessage?: string;
  isCancelling?: boolean;
  tokenSource?: CancelTokenSource;
  transcript?: string;
  originalMedia?: Media;
  webMedia?: Media;
  mobileMedia?: Media;
  vttMedia?: Media;
}

export interface MentorExportJson {
  subjects: SubjectGQL[];
  questions: Question[];
  answers: AnswerGQL[];
}

export interface ImportPreview<T> {
  importData: T | undefined;
  curData: T | undefined;
  editType: EditType;
}

export interface MentorImportPreview {
  subjects: ImportPreview<SubjectGQL>[];
  questions: ImportPreview<Question>[];
  answers: ImportPreview<AnswerGQL>[];
}

export function convertMentorGQL(gql: MentorGQL): Mentor {
  const answersWithoutMentor =
    gql.answers?.filter((a) => !a.question.mentor) || [];
  const answersWithMentor = gql.answers?.filter((a) => a.question.mentor) || [];
  const gqlAnswers = [...answersWithoutMentor, ...answersWithMentor];
  return {
    ...gql,
    orgPermissions: gql.orgPermissions,
    defaultSubject: gql.defaultSubject
      ? convertSubjectGQL(gql.defaultSubject)
      : undefined,
    subjects: gql.subjects?.map((s) => convertSubjectGQL(s)),
    answers: [
      ...gqlAnswers.map((a) => convertAnswerGQL(a)),
      ...(gql.orphanedCompleteAnswers || []).map((a) => convertAnswerGQL(a)),
    ],
    orphanedCompleteAnswers: (gql.orphanedCompleteAnswers || []).map((a) =>
      convertAnswerGQL(a)
    ),
  };
}

export function convertSubjectGQL(gql: SubjectGQL): Subject {
  return {
    ...gql,
    questions: gql.questions?.map((sq) => ({
      ...sq,
      question: sq.question?._id,
    })),
  };
}

export function convertAnswerGQL(gql: AnswerGQL): Answer {
  return {
    ...gql,
    question: gql?.question?._id,
    questionClientId: gql?.question?.clientId,
    media: getAnswerGQLMediaList(gql),
  };
}

export function getAnswerGQLMediaList(answerGql: AnswerGQL): Media[] {
  if (!answerGql) {
    return [];
  }
  const mediaList = [];
  if (answerGql.webMedia) {
    mediaList.push(answerGql.webMedia);
  }
  if (answerGql.mobileMedia) {
    mediaList.push(answerGql.mobileMedia);
  }
  if (answerGql.vttMedia) {
    mediaList.push(answerGql.vttMedia);
  }
  return mediaList;
}

export function convertUserQuestionGQL(gql: UserQuestionGQL): UserQuestion {
  return {
    ...gql,
    mentor: convertMentorGQL(gql.mentor),
    classifierAnswer: convertAnswerGQL(gql.classifierAnswer),
    graderAnswer: convertAnswerGQL(gql.graderAnswer),
  };
}

export function convertUploadTaskGQL(gql: UploadTaskGQL): UploadTask {
  return {
    ...gql,
    question: gql.question._id,
    taskList: getTaskListFromUploadTask(gql),
    media: getMediaListFromUploadTask(gql),
  };
}

export function convertConnectionGQL<T, U>(
  gql: Connection<T>,
  convert: (gql: T) => U
): Connection<U> {
  return {
    ...gql,
    edges: gql.edges.map((edge) => ({
      ...edge,
      node: convert(edge.node),
    })),
  };
}

export function getTaskListFromUploadTask(
  uploadTaskGql: UploadTaskGQL
): TaskInfo[] {
  const taskList = [];
  if (uploadTaskGql.trimUploadTask) {
    taskList.push(uploadTaskGql.trimUploadTask);
  }
  if (uploadTaskGql.transcodeMobileTask) {
    taskList.push(uploadTaskGql.transcodeMobileTask);
  }
  if (uploadTaskGql.transcodeWebTask) {
    taskList.push(uploadTaskGql.transcodeWebTask);
  }
  if (uploadTaskGql.transcribeTask) {
    taskList.push(uploadTaskGql.transcribeTask);
  }
  return taskList;
}

export function getMediaListFromUploadTask(
  uploadTaskGql: UploadTaskGQL
): Media[] {
  const mediaList = [];
  if (uploadTaskGql.webMedia) {
    mediaList.push(uploadTaskGql.webMedia);
  }
  if (uploadTaskGql.mobileMedia) {
    mediaList.push(uploadTaskGql.mobileMedia);
  }
  if (uploadTaskGql.vttMedia) {
    mediaList.push(uploadTaskGql.vttMedia);
  }
  if (uploadTaskGql.originalMedia) {
    mediaList.push(uploadTaskGql.originalMedia);
  }
  return mediaList;
}
