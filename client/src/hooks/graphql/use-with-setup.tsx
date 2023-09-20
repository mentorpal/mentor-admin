/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { navigate } from "gatsby";
import { useEffect, useState } from "react";
import {
  Answer,
  Mentor,
  MentorType,
  SetupStatus,
  Subject,
  UtteranceName,
} from "types";
import { LoadingError } from "./loading-reducer";
import { useWithConfig } from "store/slices/config/useWithConfig";
import { getValueIfKeyExists, isAnswerComplete, urlBuild } from "helpers";
import { useMentorEdits } from "store/slices/mentor/useMentorEdits";
import useActiveMentor from "store/slices/mentor/useActiveMentor";
import useQuestions from "store/slices/questions/useQuestions";
import { LoadingStatus } from "./generic-loading-reducer";
import { useAppSelector } from "store/hooks";

//order of the slides
export enum SetupStepType {
  WELCOME = 0,
  MENTOR_INFO = 1,
  MENTOR_TYPE = 2,
  MENTOR_PRIVACY = 3,
  MENTOR_GOAL = 4,
  SELECT_KEYWORDS = 5,
  SELECT_SUBJECTS = 6,
  INTRODUCTION = 7,
  IDLE_TIPS = 8,
  REQUIRED_SUBJECT = 9,
  FINISH_SETUP = 10,
}

export interface SetupStep {
  type: SetupStepType;
  complete: boolean;
}

interface UseWithSetup {
  setupStatus?: SetupStatus;
  curSetupStep: number;
  initialSetupStep: number;
  setupSteps: SetupStep[];
  docSetupUrl: string;
  idleTipsVideoUrl: string;
  classifierLambdaEndpoint: string;
  uploadLambdaEndpoint: string;
  virtualBackgroundUrls: string[];
  defaultVirtualBackground: string;
  mentor?: Mentor;
  isEdited: boolean;
  isLoading: boolean;
  isSaving: boolean;
  readyToDisplay: boolean;
  error?: LoadingError;
  editMentor: (d: Partial<Mentor>) => void;
  saveMentor: () => void;
  toStep: (i: number) => void;
  clearError: () => void;
  navigateToMissingSetup: () => void;
  onLeave: (cb: () => void) => void;
}

export function useWithSetup(search?: { i?: string }): UseWithSetup {
  const [initialSetupStep] = useState<number>(
    search?.i ? parseInt(search.i) : 0
  );
  const [idx, setIdx] = useState<number>(search?.i ? parseInt(search.i) : 0);
  const [steps, setSteps] = useState<SetupStep[]>([]);
  const [status, setStatus] = useState<SetupStatus>();
  const {
    getData,
    clearMentorError,
    isLoading: isMentorLoading,
    isSaving: isMentorSaving,
    error: mentorError,
  } = useActiveMentor();

  const mentor: Mentor = getData((state) => state.data);
  useQuestions(
    (state) => state.questions,
    mentor?.answers?.map((a: Answer) => a.question)
  );
  const questionsLoadingStatus = useAppSelector(
    (state) => state.questions.batchLoadStatus
  );
  const questionsFinishedLoading =
    questionsLoadingStatus === LoadingStatus.SUCCEEDED ||
    questionsLoadingStatus === LoadingStatus.FAILED;
  const mentorQuestions = useAppSelector((state) => state.questions.questions);
  const {
    editedMentor,
    isMentorEdited,
    editMentor,
    saveMentorDetails,
    saveMentorKeywords,
    saveMentorPrivacy,
  } = useMentorEdits();
  const { state: configState, isConfigLoaded } = useWithConfig();

  useEffect(() => {
    if (
      !mentor ||
      isMentorSaving ||
      isMentorLoading ||
      !isConfigLoaded() ||
      (!questionsFinishedLoading && mentor.answers.length > 0)
    ) {
      return;
    }
    const isMentorInfoDone = Boolean(
      mentor.name && mentor.firstName && mentor.title
    );
    const isMentorTypeChosen = Boolean(mentor.mentorType);
    const idleAnswer = mentor.answers.find(
      (a: Answer) =>
        getValueIfKeyExists(a.question, mentorQuestions)?.question?.name ===
        UtteranceName.IDLE
    );
    const idle =
      mentor.mentorType === MentorType.VIDEO && idleAnswer
        ? {
            idle: idleAnswer,
            complete: isAnswerComplete(
              idleAnswer,
              UtteranceName.IDLE,
              mentor.mentorType
            ),
          }
        : undefined;
    const requiredSubjects = mentor.subjects
      .filter((s: Subject) => s.isRequired)
      .map((s: Subject) => {
        const answers = mentor.answers.filter(
          (a: Answer) =>
            (!getValueIfKeyExists(a.question, mentorQuestions)?.question
              ?.mentorType ||
              getValueIfKeyExists(a.question, mentorQuestions)?.question
                ?.mentorType === mentor.mentorType) &&
            s.questions.map((q) => q.question).includes(a.question)
        );
        return {
          subject: s,
          answers: answers,
          complete: answers.every((a: Answer) =>
            isAnswerComplete(
              a,
              getValueIfKeyExists(a.question, mentorQuestions)?.question?.name,
              mentor.mentorType
            )
          ),
        };
      });
    const isSetupComplete =
      isMentorInfoDone &&
      Boolean(mentor.goal) &&
      isMentorTypeChosen &&
      (!idle || idle.complete) &&
      requiredSubjects.every(
        (s: { subject: Subject; answers: Answer[]; complete: boolean }) =>
          s.complete
      );
    setStatus({
      isMentorInfoDone,
      isMentorTypeChosen,
      isMentorGoalDone: Boolean(mentor.goal),
      idle,
      requiredSubjects,
      isSetupComplete,
    });
    const mentorSubjectsLocked = mentor.mentorConfig?.subjects.length;
    const mentorPrivacyLocked =
      mentor.mentorConfig?.publiclyVisible !== undefined ||
      mentor.mentorConfig?.orgPermissions.length;
    const mentorTypeLocked = mentor.mentorConfig?.mentorType;
    const status: SetupStep[] = [
      { type: SetupStepType.WELCOME, complete: true },
      { type: SetupStepType.MENTOR_INFO, complete: isMentorInfoDone },
      ...(mentorTypeLocked
        ? []
        : [{ type: SetupStepType.MENTOR_TYPE, complete: isMentorTypeChosen }]),
      ...(mentorPrivacyLocked
        ? []
        : [{ type: SetupStepType.MENTOR_PRIVACY, complete: true }]),
      { type: SetupStepType.MENTOR_GOAL, complete: Boolean(mentor.goal) },
      { type: SetupStepType.SELECT_KEYWORDS, complete: true },
      ...(mentorSubjectsLocked
        ? []
        : [{ type: SetupStepType.SELECT_SUBJECTS, complete: true }]),
      { type: SetupStepType.INTRODUCTION, complete: true },
    ];
    if (idle) {
      status.push({ type: SetupStepType.IDLE_TIPS, complete: true });
    }
    requiredSubjects.forEach(
      (s: { subject: Subject; answers: Answer[]; complete: boolean }) => {
        status.push({
          type: SetupStepType.REQUIRED_SUBJECT,
          complete: s.complete,
        });
      }
    );
    status.push({
      type: SetupStepType.FINISH_SETUP,
      complete: isSetupComplete,
    });
    console.log(status);
    console.log(status.length);
    setSteps(status);
  }, [mentor, configState.config, isMentorLoading, questionsLoadingStatus]);

  function onLeave(cb: () => void): void {
    if (isMentorEdited) {
      saveMentorDetails();
      saveMentorKeywords();
      saveMentorPrivacy();
    }
    cb();
  }

  function toStep(i: number): void {
    if (!status || i < 0 || i >= steps.length) {
      return;
    }
    if (isMentorEdited) {
      if (steps[idx].type === SetupStepType.SELECT_KEYWORDS) {
        saveMentorKeywords();
      } else if (steps[idx].type === SetupStepType.MENTOR_PRIVACY) {
        saveMentorPrivacy();
      } else {
        saveMentorDetails();
      }
    }
    setIdx(i);
  }

  function clearError() {
    clearMentorError();
  }

  function navigateToMissingSetup(): void {
    if (!status) {
      return;
    }
    if (mentor.mentorConfig?.configId) {
      // TODO: need to update the way we navigate setup via url, should not
      // be hardcoded carousel indexes, should instead be based off the SetupStepType
      navigate("/setup");
      return;
    }
    if (!status.isMentorInfoDone) {
      navigate(urlBuild("/setup", { i: String(SetupStepType.MENTOR_INFO) }));
    } else if (!status.isMentorTypeChosen) {
      navigate(urlBuild("/setup", { i: String(SetupStepType.MENTOR_TYPE) }));
    } else {
      for (const [i, s] of status.requiredSubjects.entries()) {
        if (!s.complete) {
          const idx = status.idle
            ? SetupStepType.REQUIRED_SUBJECT
            : SetupStepType.IDLE_TIPS;
          navigate(urlBuild("/setup", { i: String(idx + i) }));
          return;
        }
      }
      navigate("/setup");
    }
  }

  return {
    setupStatus: status,
    curSetupStep: idx,
    initialSetupStep,
    setupSteps: steps,
    docSetupUrl: configState.config?.urlDocSetup || "",
    idleTipsVideoUrl: configState.config?.urlVideoIdleTips || "",
    classifierLambdaEndpoint:
      configState.config?.classifierLambdaEndpoint || "",
    uploadLambdaEndpoint: configState.config?.uploadLambdaEndpoint || "",
    virtualBackgroundUrls: configState.config?.virtualBackgroundUrls || [],
    defaultVirtualBackground:
      configState.config?.defaultVirtualBackground || "",
    mentor: editedMentor,
    isEdited: isMentorEdited,
    isLoading: isMentorLoading,
    isSaving: isMentorSaving,
    readyToDisplay:
      isConfigLoaded() &&
      !isMentorLoading &&
      mentor &&
      questionsFinishedLoading &&
      Boolean(steps.length),
    error: mentorError,
    editMentor,
    saveMentor: saveMentorDetails,
    toStep,
    clearError,
    navigateToMissingSetup,
    onLeave,
  };
}
