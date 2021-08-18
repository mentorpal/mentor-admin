/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { CancelTokenSource } from "axios";

export interface UserAccessToken {
  user: User;
  accessToken: string;
  expirationDate: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  userRole: UserRole;
  defaultMentor: string;
}

export interface Mentor {
  _id: string;
  name: string;
  firstName: string;
  title: string;
  email: string;
  thumbnail: string;
  allowContact: boolean;
  defaultSubject?: string;
  subjects: string[];
  lastTrainedAt: string;
  isDirty: boolean;
  mentorType: MentorType;
}

export interface Subject {
  _id: string;
  name: string;
  description: string;
  isRequired: boolean;
  categories: Category[];
  topics: Topic[];
  questions: SubjectQuestion[];
}

export interface SubjectQuestion {
  question: string;
  category?: string;
  topics: string[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface Topic {
  id: string;
  name: string;
  description: string;
}

export interface Question {
  _id: string;
  question: string;
  type: QuestionType;
  name: UtteranceName;
  paraphrases: string[];
  mentor?: string;
  mentorType?: string;
  minVideoLength?: number;
}

export interface Answer {
  _id: string;
  mentor: string;
  question: string;
  transcript: string;
  status: Status;
  media?: Media[];
  hasUntransferredMedia: boolean;
}

export interface Media {
  type: string;
  tag: string;
  url: string;
  needsTransfer: boolean;
}

export interface UserQuestion {
  _id: string;
  mentor: string;
  question: string;
  confidence: number;
  feedback: Feedback;
  classifierAnswerType: ClassifierAnswerType;
  classifierAnswer: string;
  graderAnswer: string;
  updatedAt: string;
  createdAt: string;
}

export interface FollowUpQuestion {
  question: string;
  entityType?: string;
}

export interface UploadTask {
  question: string;
  taskId: string;
  uploadStatus: UploadStatus;
  transcript?: string;
  media?: Media[];
  uploadProgress: number;
  errorMessage?: string;
  isCancelling?: boolean;
  tokenSource?: CancelTokenSource;
}

export interface AsyncJob {
  id: string;
  statusUrl: string;
}

export interface CancelJob {
  id: string;
  cancelledId: string;
}

export interface TaskStatus<T> {
  state: JobState;
  status?: string;
  info?: T;
}

export interface TrainingInfo {
  mentor: string;
  questions?: TrainExpectionResult[];
}

export interface TrainExpectionResult {
  accuracy: number;
}

export interface VideoInfo {
  mentor: string;
  videoId: string;
  video: File;
  transcript: string;
}

export interface ImportPreview<T> {
  importData: T | undefined;
  curData: T | undefined;
  editType: EditType;
}

export interface Config {
  googleClientId: string;
  urlVideoIdleTips: string;
  videoRecorderMaxLength: number;
}

export interface Connection<T> {
  edges: Edge<T>[];
  pageInfo: PageInfo;
}

export interface Edge<T> {
  cursor: string;
  node: T;
}

export interface PageInfo {
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  startCursor: string;
  endCursor: string;
}

export enum LoginStatus {
  NONE = 0,
  IN_PROGRESS = 1,
  AUTHENTICATED = 2,
  FAILED = 3,
}

export enum EditType {
  NONE = "NONE",
  ADDED = "ADDED",
  REMOVED = "REMOVED",
  CREATED = "CREATED",
}

export enum RecordPageState {
  INITIALIZING = "INITIALIZING",
  RECORDING_ANSWERS = "RECORDING_ANSWERS",
  FETCHING_FOLLOW_UPS = "FETCHING_FOLLOW_UPS",
  REVIEWING_FOLLOW_UPS = "REVIEWING_FOLLOW_UPS",
  RELOADING_MENTOR = "RELOADING_MENTOR",
}

export enum UserRole {
  ADMIN = "ADMIN",
  CONTENT_MANAGER = "CONTENT_MANAGER",
  USER = "USER",
}

export enum JobState {
  NONE = "NONE",
  FAILURE = "FAILURE",
  SUCCESS = "SUCCESS",
  PENDING = "PENDING",
  STARTED = "STARTED",
}

export enum Feedback {
  GOOD = "GOOD",
  BAD = "BAD",
  NEUTRAL = "NEUTRAL",
}

export enum ClassifierAnswerType {
  CLASSIFIER = "CLASSIFIER",
  OFF_TOPIC = "OFF_TOPIC",
  EXACT_MATCH = "EXACT",
  PARAPHRASE = "PARAPHRASE",
}

export enum QuestionType {
  UTTERANCE = "UTTERANCE",
  QUESTION = "QUESTION",
}

export enum UtteranceName {
  NONE = "",
  IDLE = "_IDLE_",
  INTRO = "_INTRO_",
  OFF_TOPIC = "_OFF_TOPIC_",
  PROMPT = "_PROMPT_",
  FEEDBACK = "_FEEDBACK_",
  REPEAT = "_REPEAT_",
  REPEAT_BUMP = "_REPEAT_BUMP_",
  PROFANIY = "_PROFANITY_",
}

export enum MentorType {
  VIDEO = "VIDEO",
  CHAT = "CHAT",
}

export enum Status {
  INCOMPLETE = "INCOMPLETE",
  COMPLETE = "COMPLETE",
}

export enum MediaType {
  VIDEO = "video",
}

export enum MediaTag {
  WEB = "web",
  MOBILE = "mobile",
}

export enum AnswerAttentionNeeded {
  NONE = "",
  NEEDS_TRANSCRIPT = "NEEDS_TRANSCRIPT",
}

export enum UploadStatus {
  PENDING = "PENDING", // local state only; sending upload request to upload api
  POLLING = "POLLING", // local state only; upload request has been received by api, start polling
  TRIM_IN_PROGRESS = "TRIM_IN_PROGRESS",
  TRANSCRIBE_IN_PROGRESS = "TRANSCRIBE_IN_PROGRESS", // api has started transcribing
  TRANSCRIBE_FAILED = "TRANSCRIBE_FAILED", // api transcribe failed (should it still try to upload anyway...?)
  UPLOAD_IN_PROGRESS = "UPLOAD_IN_PROGRESS", // api has started uploading video
  UPLOAD_FAILED = "UPLOAD_FAILED", // api upload failed
  CANCEL_IN_PROGRESS = "CANCEL_IN_PROGRESS", //
  CANCEL_FAILED = "CANCEL_FAILED",
  CANCELLED = "CANCELLED", // api has successfully cancelled the upload
  DONE = "DONE", // api is done with upload process
}
