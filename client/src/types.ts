/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { CancelTokenSource } from "axios";
import {
  AnswerGQL,
  MentorConfig,
  PreviousAnswerVersion,
  SubjectGQL,
  UserQuestionGQL,
} from "types-gql";
import { QuestionState } from "store/slices/questions";
import { LoadingError } from "hooks/graphql/loading-reducer";

export enum SetupScreen {
  Welcome = 0,
  Tell_Us_About_Yourself = 1,
  Pick_Mentor_Type = 2,
  My_Goal = 3,
  Experiences_Identities = 4,
  Select_Subjects = 5,
  Start_Recordin = 6,
  Idle_Video_Tips = 7,
  Idle_And_Initial_Recordings = 8,
  Build_Mentor = 9,
}

export enum QuestionSortOrder {
  Default = "",
  Alphabetical = "Alphabetical",
  ReverseAlphabetical = "Reverse-Alphabetical",
}

export enum DisplaySurveyPopupCondition {
  ALWAYS = "ALWAYS",
  USER_ID = "USER_ID",
  USER_ID_AND_EMAIL = "USER_ID_AND_EMAIL",
  NEVER = "NEVER",
}

export interface Config {
  classifierLambdaEndpoint: string;
  uploadLambdaEndpoint: string;
  subjectRecordPriority: string[];
  videoRecorderMaxLength: number;
  googleClientId: string;
  virtualBackgroundUrls: string[];
  defaultVirtualBackground: string;
  urlDocSetup: string;
  urlVideoIdleTips: string;
  // style settings
  styleHeaderTitle: string;
  styleHeaderText: string;
  styleHeaderColor: string;
  styleHeaderTextColor: string;
  styleHeaderLogo: string;
  styleHeaderLogoUrl: string;
  styleHeaderLogoOffset: number;
  styleHeaderLogoHeight: number;
  styleHeaderLogoWidth: number;
  homeFooterColor: string;
  homeFooterTextColor: string;
  homeFooterImages: string[];
  homeFooterLinks: string[];
  homeBannerColor: string;
  homeBannerButtonColor: string;
  homeCarouselColor: string;
  // popup settings
  walkthroughDisabled: boolean;
  walkthroughTitle: string;
  urlVideoMentorpalWalkthrough: string;
  disclaimerDisabled: boolean;
  disclaimerTitle: string;
  disclaimerText: string;
  termsOfServiceDisabled: boolean;
  termsOfServiceText: string;
  displayGuestPrompt: boolean;
  displaySurveyPopupCondition: DisplaySurveyPopupCondition;
  guestPromptTitle: string;
  guestPromptText: string;
  guestPromptInputType: string;
  // client settings
  questionSortOrder: QuestionSortOrder;
  postSurveyLink: string;
  postSurveyTimer: number;
  postSurveyUserIdEnabled: boolean;
  postSurveyReferrerEnabled: boolean;
  minTopicQuestionSize: number;
  // home settings
  activeMentors: string[];
  activeMentorPanels: string[];
  featuredMentors: string[];
  featuredMentorPanels: string[];
  featuredSubjects: string[];
  featuredKeywordTypes: string[];
  defaultSubject: string;
}

export interface SbertEncodedSentence {
  original: string;
  encoded: number[];
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

export interface MentorTrainStatusById {
  _id: string;
  lastTrainStatus: JobState;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  userRole: UserRole;
  defaultMentor: Mentor;
  firstTimeTracking: FirstTimeTracking;
  isDisabled: boolean;
}

export interface Organization {
  _id: string;
  uuid: string;
  name: string;
  subdomain: string;
  isPrivate: boolean;
  accessCodes: string[];
  members: OrgMember[];
  config: Config;
}

export interface OrgMember {
  user: User;
  role: string;
}

export interface MentorPanel {
  _id: string;
  org: string;
  subject: string;
  mentors: string[];
  title: string;
  subtitle: string;
}

export enum MentorDirtyReason {
  ANSWERS_REMOVED = "ANSWERS_REMOVED",
  ANSWERS_ADDED = "ANSWERS_ADDED",
  NONE = "NONE",
}

export interface Mentor {
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
  isDirty: boolean;
  lastTrainStatus: JobState;
  dirtyReason: MentorDirtyReason;
  isPublicApproved: boolean;
  isPrivate: boolean;
  isArchived: boolean;
  isAdvanced: boolean;
  mentorConfig?: MentorConfig;
  orgPermissions: OrgPermission[];
  defaultSubject?: Subject;
  subjects: Subject[];
  keywords: string[];
  topics: Topic[];
  answers: Answer[];
  orphanedCompleteAnswers: Answer[];
  hasVirtualBackground: boolean;
  virtualBackgroundUrl: string;
  updatedAt: string;
  createdAt: string;
  numAnswersComplete: number;
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

export interface OrgPermission {
  orgId: string;
  orgName: string;
  viewPermission: OrgViewPermissionType;
  editPermission: OrgEditPermissionType;
}

export interface Keyword {
  _id: string;
  type: string;
  keywords: string[];
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
  isArchived: boolean;
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
  hash: string;
  duration: number;
  vttText: string;
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
  graderAnswer?: Answer;
  dismissed: boolean;
  updatedAt: string;
  createdAt: string;
}

export interface TrendingUserQuestion {
  _id: string;
  question: string;
  confidence: number;
  feedback: Feedback;
  classifierAnswerType: ClassifierAnswerType;
  dismissed: boolean;
  updatedAt: string;
  createdAt: string;
}

export interface WeightedTrendingUserQuestion extends TrendingUserQuestion {
  weight: number;
  embedding: number[];
}

export interface UserQuestionBin {
  userQuestions: WeightedTrendingUserQuestion[];
  binWeight: number; //based on average weight of each userQuestion in this bin
  binAverageEmbedding: number[];
  bestRepresentativeId: string;
}

export interface BinCollection {
  bins: UserQuestionBin[];
  lastUpdated: number; // epoch
  mentor: string;
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
  IN_PROGRESS = "IN_PROGRESS",
  PENDING = "PENDING",
  STARTED = "STARTED",
}

export enum UserRole {
  ADMIN = "ADMIN",
  CONTENT_MANAGER = "CONTENT_MANAGER",
  USER = "USER",
  SUPER_CONTENT_MANAGER = "SUPER_CONTENT_MANAGER",
  SUPER_ADMIN = "SUPER_ADMIN",
}

export enum MentorType {
  VIDEO = "VIDEO",
  CHAT = "CHAT",
}

export enum Status {
  NONE = "NONE",
  INCOMPLETE = "INCOMPLETE",
  COMPLETE = "COMPLETE",
  SKIP = "SKIP",
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
  VTT = "subtitles",
}

export enum MediaTag {
  WEB = "web",
  MOBILE = "mobile",
  VTT = "en",
}

export enum ImportTaskStatus {
  QUEUED = "QUEUED",
  IN_PROGRESS = "IN_PROGRESS",
  FAILED = "FAILED",
  DONE = "DONE",
}

export interface RegenVttResponse {
  regen_vtt: boolean;
  new_vtt_text: string;
  new_vtt_url: string;
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
  isUpdatingUrl: boolean;
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
  saveAnswer: (customEditedAnswer?: Answer) => Promise<void>;
  removeCompletedOrFailedTask: (tasks: UploadTask) => void;
  rerecord: () => void;
  startRecording: () => void;
  stopRecording: (video: File) => void;
  uploadVideo: (trim?: { start: number; end: number }) => void;
  downloadCurAnswerVideo: () => void;
  downloadVideoFromUpload: (upload: UploadTask) => void;
  setMinVideoLength: (length: number) => void;
  clearError: () => void;
  downloadVideoBlobUrl: (url: string, qid: string) => void;
  updateUrl: (
    webUrl: string | undefined,
    mobileUrl: string | undefined,
    webTransUrl: string | undefined,
    mobileTransUrl: string | undefined
  ) => void;
  filesUploading: Record<string, string>;
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
  isMentorGoalDone: boolean;
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
