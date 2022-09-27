/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { CancelTokenSource } from "axios";
import { AnswerGQL, SubjectGQL, UserQuestionGQL } from "types-gql";
import { QuestionState } from "store/slices/questions";
import { LoadingError } from "hooks/graphql/loading-reducer";
import exp from "constants";

export interface Config {
  mentorsDefault: string[];
  featuredMentors: string[];
  featuredMentorPanels: string[];
  activeMentors: string[];
  subjectRecordPriority: string[];
  googleClientId: string;
  urlDocSetup: string;
  urlVideoIdleTips: string;
  videoRecorderMaxLength: number;
  classifierLambdaEndpoint: string;
  uploadLambdaEndpoint: string;
  styleHeaderLogo: string;
  styleHeaderColor: string;
  styleHeaderTextColor: string;
  displayGuestPrompt: boolean;
  disclaimerTitle: string;
  disclaimerText: string;
  disclaimerDisabled: boolean;
  virtualBackgroundUrls: string[];
  defaultVirtualBackground: string;
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

export interface UserAccessToken {
  user: User;
  accessToken: string;
  expirationDate: string;
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

export interface MentorPanel {
  _id: string;
  subject: string;
  mentors: string[];
  title: string;
  subtitle: string;
}

export interface Mentor {
  _id: string;
  name: string;
  firstName: string;
  title: string;
  email: string;
  allowContact: boolean;
  thumbnail: string;
  mentorType: MentorType;
  lastTrainedAt: string;
  isDirty: boolean;
  isPrivate: boolean;
  defaultSubject?: Subject;
  subjects: Subject[];
  topics: Topic[];
  answers: Answer[];
  hasVirtualBackground: boolean;
  virtualBackgroundUrl: string;
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
  categories: Category[];
  topics: Topic[];
  questions: SubjectQuestion[];
}

export interface SubjectQuestion {
  question: string;
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
  name: UtteranceName;
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
  transparentVideoUrl: string;
  needsTransfer: boolean;
}

export interface Answer {
  _id: string;
  question: string;
  questionClientId: string;
  hasEditedTranscript: boolean;
  transcript: string;
  markdownTranscript?: string;
  status: Status;
  hasUntransferredMedia: boolean;
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
  graderAnswer?: Answer;
  updatedAt: string;
  createdAt: string;
}

export interface UserQuestionBin {
  userQuestions: UserQuestion[];
  averageEmbedding: number[];
}

export interface BinCollection {
  bins: UserQuestionBin[];
  lastUpdated: string;
}

export interface MentorInfo {
  _id: string;
  name: string;
}

export interface FollowUpQuestion {
  question: string;
  entityType?: string;
}

export interface AsyncJob {
  id: string;
  statusUrl: string;
}

export interface UploadProcessAsyncJob {
  taskList: TaskInfo[];
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

interface ExportedMentorInfo {
  name: string;
  firstName: string;
  title: string;
  email: string;
  thumbnail: string;
  allowContact: boolean;
  defaultSubject: string;
  mentorType: string;
}

export enum MentorDataTypes {
  QUESTION = "QUESTION",
  ANSWER = "ANSWER",
  SUBJECT = "SUBJECT",
  TOPIC = "TOPIC",
  CATEGORY = "CATEGORY",
}

export interface ChangedMentorData<T> {
  editType: EditType;
  data: T;
}

export interface ReplacedMentorDataChanges {
  questionChanges: ChangedMentorData<Question>[];
  answerChanges: ChangedMentorData<AnswerGQL>[];
}

export interface MentorExportJson {
  id: string;
  mentorInfo: ExportedMentorInfo;
  subjects: SubjectGQL[];
  questions: Question[];
  answers: AnswerGQL[];
  userQuestions: UserQuestionGQL[];
}

export interface ImportPreview<T> {
  importData: T | undefined;
  curData: T | undefined;
  editType: EditType;
}

export interface MentorImportPreview {
  id: string;
  subjects: ImportPreview<SubjectGQL>[];
  questions: ImportPreview<Question>[];
  answers: ImportPreview<AnswerGQL>[];
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

export interface UploadTask {
  question: string;
  uploadProgress: number;
  taskList: TaskInfo[];
  errorMessage?: string;
  isCancelling?: boolean;
  tokenSource?: CancelTokenSource;
  transcript?: string;
  media?: Media[];
}

export enum EditType {
  NONE = "NONE",
  ADDED = "ADDED",
  REMOVED = "REMOVED",
  CREATED = "CREATED",
  OLD_FOLLOWUP = "OLD_FOLLOWUP",
  OLD_ANSWER = "OLD_ANSWER",
}

export enum LoginStatus {
  NONE = 0,
  IN_PROGRESS = 1,
  AUTHENTICATED = 2,
  FAILED = 3,
}

export enum JobState {
  NONE = "NONE",
  FAILURE = "FAILURE",
  SUCCESS = "SUCCESS",
  PENDING = "PENDING",
  STARTED = "STARTED",
}

export enum UserRole {
  ADMIN = "ADMIN",
  CONTENT_MANAGER = "CONTENT_MANAGER",
  USER = "USER",
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
  NONE = "",
  IDLE = "_IDLE_",
  INTRO = "_INTRO_",
  OFF_TOPIC = "_OFF_TOPIC_",
  PROMPT = "_PROMPT_",
  FEEDBACK = "_FEEDBACK_",
  REPEAT = "_REPEAT_",
  REPEAT_BUMP = "_REPEAT_BUMP_",
  PROFANITY = "_PROFANITY_",
}

export enum AnswerAttentionNeeded {
  NONE = "",
  NEEDS_TRANSCRIPT = "NEEDS_TRANSCRIPT",
}

export enum MediaType {
  VIDEO = "video",
}

export enum MediaTag {
  WEB = "web",
  MOBILE = "mobile",
}

export enum ImportTaskStatus {
  QUEUED = "QUEUED",
  IN_PROGRESS = "IN_PROGRESS",
  FAILED = "FAILED",
  DONE = "DONE",
}

export interface ImportGraphQLUpdate {
  status: ImportTaskStatus;
  errorMessage: string;
}

export interface ImportS3VideoMigrate {
  status: ImportTaskStatus;
  errorMessage: string;
}

export interface ImportTask {
  graphQLUpdate: ImportGraphQLUpdate;
  s3VideoMigrate: ImportS3VideoMigrate;
  migrationErrors: string[];
}

export interface PresignedUrlResponse {
  url: string;
  fields: PresignedUrlFields;
}

export interface PresignedUrlFields {
  key?: string;
  bucket?: string;
  "x-amz-algorithm"?: string;
  "x-amz-credential"?: string;
  "x-amz-date"?: string;
  "x-amz-security-token"?: string;
  "x-amz-signature"?: string;
  policy?: string;
  AWSAccessKeyId?: string;
  signature?: string;
}

export interface UseWithRecordState {
  mentorQuestions: Record<string, QuestionState>;
  mentorSubjects: Subject[];
  answers: AnswerState[];
  answerIdx: number;
  curAnswer?: CurAnswerState;
  uploads: UploadTask[];
  pollStatusCount: number;
  isUploading: boolean;
  isRecording: boolean;
  isSaving: boolean;
  error?: LoadingError;
  isDownloadingVideo: boolean;
  notifyDialogOpen: boolean;
  setNotifyDialogOpen: (open: boolean) => void;
  prevAnswer: () => void;
  reloadMentorData: () => void;
  nextAnswer: () => void;
  setAnswerIdx: (id: number) => void;
  editAnswer: (
    edits: Partial<Answer>,
    answerStateEdits?: Partial<AnswerState>
  ) => void;
  editQuestion: (edits: Partial<Question>) => void;
  saveAnswer: () => Promise<void>;
  removeCompletedOrFailedTask: (tasks: UploadTask) => void;
  rerecord: () => void;
  startRecording: () => void;
  stopRecording: (video: File) => void;
  uploadVideo: (trim?: { start: number; end: number }) => void;
  downloadCurAnswerVideo: () => void;
  downloadVideoFromUpload: (upload: UploadTask) => void;
  setMinVideoLength: (length: number) => void;
  clearError: () => void;
}

export interface AnswerState {
  answer: Answer;
  editedAnswer: Answer;
  editedQuestion: Question;
  attentionNeeded: AnswerAttentionNeeded;
  localTranscriptChanges: boolean;
  recordedVideo?: File;
  minVideoLength?: number;
}

export interface CurAnswerState extends AnswerState {
  isEdited: boolean;
  isValid: boolean;
  isUploading: boolean;
  videoSrc?: string;
}

export interface RecordStateError {
  message: string;
  error: string;
}

export interface SetupStatus {
  isMentorInfoDone: boolean;
  isMentorTypeChosen: boolean;
  idle?: {
    idle: Answer;
    complete: boolean;
  };
  requiredSubjects: {
    subject: Subject;
    answers: Answer[];
    complete: boolean;
  }[];
  isSetupComplete: boolean;
}
