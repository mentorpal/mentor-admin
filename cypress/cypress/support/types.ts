/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

export enum SetupScreen {
  Welcome = 0,
  Tell_Us_About_Yourself = 1,
  Pick_Mentor_Type = 2,
  Mentor_Privacy = 3,
  My_Goal = 4,
  Experiences_Identities = 5,
  Select_Subjects = 6,
  Start_Recordin = 7,
  Idle_Video_Tips = 8,
  Idle_And_Initial_Recordings = 9,
  Build_Mentor = 10,
}

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

export interface FirstTimeTracking {
  myMentorSplash: boolean;
  tooltips: boolean;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  userRole: UserRole;
  defaultMentor: Mentor;
  firstTimeTracking: FirstTimeTracking;
}

export enum MentorDirtyReason {
  ANSWERS_REMOVED = "ANSWERS_REMOVED",
  ANSWERS_ADDED = "ANSWERS_ADDED",
  NONE = "NONE",
}

export enum UserRole {
  ADMIN = "ADMIN",
  CONTENT_MANAGER = "CONTENT_MANAGER",
  USER = "USER",
  SUPER_CONTENT_MANAGER = "SUPER_CONTENT_MANAGER",
  SUPER_ADMIN = "SUPER_ADMIN",
}

export interface UserAccessToken {
  user: User;
  accessToken: string;
  expirationDate: string;
}

export enum OrgViewPermissionType {
  NONE = "NONE", // no custom settings, use "isPrivate"
  HIDDEN = "HIDDEN", // org cannot see or use mentor
  SHARE = "SHARE", // org can use mentor as-is
}

export enum OrgEditPermissionType {
  NONE = "NONE", // no custom settings, use "isPrivate"
  MANAGE = "MANAGE", // org can edit content
  ADMIN = "ADMIN", // org can edit content and edit sharing settings
}

export interface OrgPermissionsGQL {
  org: string;
  viewPermission: OrgViewPermissionType;
  editPermission: OrgEditPermissionType;
}

export interface MentorConfig {
  configId: string;
  subjects: string[];
  publiclyVisible: boolean;
  mentorType: MentorType;
  orgPermissions: OrgPermissionsGQL[];
  loginHeaderText: string;
  welcomeSlideHeader: string;
  welcomeSlideText: string;
  disableMyGoalSlide: boolean;
  disableFollowups: boolean;
}

export interface Mentor {
  _id: string;
  name: string;
  firstName: string;
  title: string;
  goal: string;
  email: string;
  thumbnail: string;
  mentorType: MentorType;
  lastTrainedAt: string;
  lastPreviewedAt: string;
  isDirty: boolean;
  isPublicApproved: boolean;
  isPrivate: boolean;
  isArchived: boolean;
  isAdvanced: boolean;
  defaultSubject?: Subject;
  mentorConfig?: MentorConfig;
  numAnswersComplete: number;
  subjects: Subject[];
  keywords: string[];
  topics: Topic[];
  answers: Answer[];
  orphanedCompleteAnswers: Answer[];
  questions: SubjectQuestion[];
  hasVirtualBackground: boolean;
  virtualBackgroundUrl: string;
}

export interface Keyword {
  _id: string;
  name: string;
  type: string;
}

export enum SubjectTypes {
  SUBJECT = "SUBJECT",
  UTTERANCES = "UTTERANCES",
}

export interface Subject {
  _id: string;
  name: string;
  type: SubjectTypes;
  description: string;
  isRequired: boolean;
  isArchived: false;
  categories: Category[];
  topics: Topic[];
  questions: SubjectQuestion[];
}

export enum UseDefaultTopics {
  TRUE = "TRUE",
  FALSE = "FALSE",
  DEFAULT = "DEFAULT",
}

export interface SubjectQuestion {
  question: Question;
  category?: Category;
  topics: Topic[];
  useDefaultTopics: UseDefaultTopics;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  defaultTopics: string[];
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  categoryParent?: string;
}

export interface Question {
  _id: string;
  question: string;
  type: QuestionType;
  name: string;
  clientId: string;
  paraphrases: string[];
  mentor?: string;
  mentorType?: string;
  minVideoLength?: number;
}

export interface Media {
  type: string;
  tag: string;
  url: string;
  vttText: string;
}

export enum MediaType {
  VIDEO = "video",
}

export interface PreviousAnswerVersion {
  transcript: string;
  webVideoHash: string;
  vttText: string;
  videoDuration: number;
  dateVersioned: string;
}

export interface Answer {
  _id: string;
  question: Question;
  transcript: string;
  hasEditedTranscript?: boolean;
  markdownTranscript?: string;
  status: Status;
  media?: Media[];
  webMedia?: Media;
  mobileMedia?: Media;
  vttMedia?: Media;
  previousVersions: PreviousAnswerVersion[];
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

export enum MentorType {
  VIDEO = "VIDEO",
  CHAT = "CHAT",
}

export enum Status {
  NONE = "NONE",
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
  PROFANITY = "_PROFANITY_",
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
  IN_PROGRESS = "IN_PROGRESS",
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
