/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

export interface Ref {
  id: string;
}

export interface _Ref {
  _id: string;
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

export interface User {
  _id: string;
  name: string;
  email: string;
  userRole: UserRole;
  defaultMentor: Mentor;
}

export enum UserRole {
  ADMIN = "ADMIN",
  CONTENT_MANAGER = "CONTENT_MANAGER",
  USER = "USER",
}

export interface UserAccessToken {
  user: User;
  accessToken: string;
  expirationDate: string;
}

export interface Mentor {
  _id: string;
  name: string;
  firstName: string;
  title: string;
  email: string;
  thumbnail: string;
  mentorType: MentorType;
  lastTrainedAt: string;
  isDirty: boolean;
  defaultSubject?: Subject;
  subjects: Subject[];
  topics: Topic[];
  answers: Answer[];
  questions: SubjectQuestion[];
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
  question: Question;
  category?: Category;
  topics: Topic[];
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
  name: string;
  paraphrases: string[];
  mentor?: string;
  mentorType?: string;
  minVideoLength?: number;
}

export interface Media {
  type: string;
  tag: string;
  url: string;
}

export enum MediaType {
  VIDEO = "video",
}

export interface Answer {
  _id: string;
  question: Question;
  transcript: string;
  status: Status;
  media?: Media[];
}

export interface UserQuestion {
  _id: string;
  question: string;
  confidence: number;
  feedback: Feedback;
  mentor: Mentor;
  classifierAnswerType: ClassifierAnswerType;
  classifierAnswer: Answer;
  graderAnswer: Answer;
  updatedAt: string;
  createdAt: string;
}

export interface MountedFilesStatus {
  mountedFiles: string[];
}

export interface ServerStorageInfo {
  totalStorage: number;
  usedStorage: number;
  freeStorage: number;
}

export enum MentorType {
  VIDEO = "VIDEO",
  CHAT = "CHAT",
}

export enum Status {
  INCOMPLETE = "INCOMPLETE",
  COMPLETE = "COMPLETE",
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
  IDLE = "_IDLE_",
  INTRO = "_INTRO_",
  OFF_TOPIC = "_OFF_TOPIC_",
  PROMPT = "_PROMPT_",
  FEEDBACK = "_FEEDBACK_",
  REPEAT = "_REPEAT_",
  REPEAT_BUMP = "_REPEAT_BUMP_",
  PROFANIY = "_PROFANITY_",
}

export interface AsyncJob {
  id: string;
  statusUrl: string;
}

export enum JobState {
  NONE = "NONE",
  FAILURE = "FAILURE",
  SUCCESS = "SUCCESS",
  PENDING = "PENDING",
  STARTED = "STARTED",
}

export enum UploadTaskStatuses {
  NONE = "NONE",
  PENDING = "PENDING",
  QUEUED = "QUEUED",
  IN_PROGESS = "IN_PROGRESS",
  CANCELLING = "CANCELLING",
  CANCELLED = "CANCELLED",
  FAILED = "FAILED",
  DONE = "DONE",
}

export interface TaskInfo {
  task_name: string;
  task_id: string;
  status: UploadTaskStatuses;
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

export enum LoginStatus {
  NONE = 0,
  IN_PROGRESS = 1,
  AUTHENTICATED = 2,
  FAILED = 3,
}
