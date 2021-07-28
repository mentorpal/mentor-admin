/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useEffect, useState } from "react";
import {
  Answer,
  JobState,
  Mentor,
  MentorType,
  Status,
  Subject,
  UtteranceName,
} from "types";
import { useWithTraining } from "hooks/task/use-with-train";
import { useWithMentor } from "./use-with-mentor";
import { LoadingError } from "./loading-reducer";
import { useWithConfig } from "store/slices/config/useWithConfig";

export enum SetupStepType {
  WELCOME,
  MENTOR_INFO,
  MENTOR_TYPE,
  INTRODUCTION,
  SELECT_SUBJECTS,
  IDLE_TIPS,
  IDLE,
  REQUIRED_SUBJECT,
  BUILD,
}

interface SetupStep {
  type: SetupStepType;
  complete: boolean;
}

interface SetupStatus {
  isMentorInfoDone: boolean;
  isMentorTypeChosen: boolean;
  idle:
    | {
        idle: Answer;
        complete: boolean;
      }
    | undefined;
  requiredSubjects: {
    subject: Subject;
    answers: Answer[];
    complete: boolean;
  }[];
  isBuildable: boolean;
  isBuilt: boolean;
  isSetupComplete: boolean;
}

interface UseWithSetup {
  setupStatus: SetupStatus | undefined;
  setupStep: number;
  setupSteps: SetupStep[];
  idleTipsVideoUrl: string;
  mentor: Mentor | undefined;
  isEdited: boolean;
  isLoading: boolean;
  isSaving: boolean;
  isTraining: boolean;
  error: LoadingError | undefined;
  editMentor: (d: Partial<Mentor>) => void;
  saveMentor: () => void;
  startTraining: () => void;
  nextStep: () => void;
  prevStep: () => void;
  toStep: (i: number) => void;
  clearError: () => void;
}

export function useWithSetup(
  accessToken: string,
  search?: { i?: string }
): UseWithSetup {
  const [idx, setIdx] = useState<number>(search?.i ? parseInt(search.i) : 0);
  const [steps, setSteps] = useState<SetupStep[]>([]);
  const [status, setStatus] = useState<SetupStatus>();
  const [error, setError] = useState<LoadingError>();
  const {
    data: mentor,
    error: mentorError,
    editedData: editedMentor,
    isEdited: isMentorEdited,
    isLoading: isMentorLoading,
    isSaving: isMentorSaving,
    editData: editMentor,
    reloadData: reloadMentor,
    saveMentorDetails,
  } = useWithMentor(accessToken);
  const {
    isPolling: isTraining,
    error: trainError,
    status: trainStatus,
    startTask: startTraining,
    clearError: clearTrainingError,
  } = useWithTraining();
  const config = useWithConfig();

  useEffect(() => {
    if (!mentor || isMentorSaving || isMentorLoading) {
      return;
    }
    const isMentorInfoDone = Boolean(
      mentor.name && mentor.firstName && mentor.title
    );
    const isMentorTypeChosen = Boolean(mentor.mentorType);
    const idleAnswer = mentor.answers.find(
      (a) => a.question.name === UtteranceName.IDLE
    );
    const idle =
      mentor.mentorType === MentorType.VIDEO && idleAnswer
        ? { idle: idleAnswer, complete: idleAnswer.status === Status.COMPLETE }
        : undefined;
    const requiredSubjects = mentor.subjects
      .filter((s) => s.isRequired)
      .map((s) => {
        const answers = mentor.answers.filter(
          (a) =>
            (!a.question?.mentorType ||
              a.question?.mentorType == mentor.mentorType) &&
            s.questions.map((q) => q.question._id).includes(a.question._id)
        );
        return {
          subject: s,
          answers: answers,
          complete: answers.every((a) => a.status === Status.COMPLETE),
        };
      });
    const isBuildable =
      isMentorInfoDone &&
      isMentorTypeChosen &&
      (!idle || idle.complete) &&
      requiredSubjects.every((s) => s.complete);
    const isBuilt = Boolean(mentor.lastTrainedAt);
    const isSetupComplete = isBuildable && isBuilt;
    setStatus({
      isMentorInfoDone,
      isMentorTypeChosen,
      idle,
      requiredSubjects,
      isBuildable,
      isBuilt,
      isSetupComplete,
    });

    const status: SetupStep[] = [
      { type: SetupStepType.WELCOME, complete: true },
      { type: SetupStepType.MENTOR_INFO, complete: isMentorInfoDone },
      { type: SetupStepType.MENTOR_TYPE, complete: isMentorTypeChosen },
      { type: SetupStepType.SELECT_SUBJECTS, complete: true },
      { type: SetupStepType.INTRODUCTION, complete: true },
    ];
    if (idle) {
      status.push({ type: SetupStepType.IDLE_TIPS, complete: true });
      status.push({ type: SetupStepType.IDLE, complete: idle.complete });
    }
    requiredSubjects.forEach((s) => {
      status.push({
        type: SetupStepType.REQUIRED_SUBJECT,
        complete: s.complete,
      });
    });
    status.push({ type: SetupStepType.BUILD, complete: isSetupComplete });
    setSteps(status);
  }, [mentor]);

  useEffect(() => {
    if (mentorError) {
      setError(mentorError);
    }
  }, [mentorError]);

  useEffect(() => {
    if (trainStatus?.state === JobState.SUCCESS) {
      reloadMentor();
    }
  }, [trainStatus]);

  useEffect(() => {
    if (trainError) {
      setError({
        message: "Oops, training failed. Please try again.",
        error: trainError.error,
      });
      clearTrainingError();
    }
  }, [trainError]);

  function addToIdx(delta = 1): void {
    // we have to add steps.length below because stupid js
    // returns negative mods, e.g.
    //    (0 - 1) % 10 == -1 // should be 9
    setIdx(
      !isNaN(Number(idx))
        ? Number(idx) + ((delta + steps.length) % steps.length)
        : 0
    );
  }

  function nextStep() {
    if (!status) {
      return;
    }
    if (isMentorEdited) {
      saveMentorDetails();
    }
    addToIdx(1);
  }

  function prevStep() {
    if (!status) {
      return;
    }
    if (isMentorEdited) {
      saveMentorDetails();
    }
    addToIdx(-1);
  }

  function toStep(i: number) {
    if (!status || i < 0 || i >= steps.length) {
      return;
    }
    if (isMentorEdited) {
      saveMentorDetails();
    }
    setIdx(i);
  }

  function train() {
    if (
      !mentor ||
      isTraining ||
      isMentorLoading ||
      isMentorSaving ||
      !status ||
      !status.isBuildable
    ) {
      return;
    }
    startTraining(mentor._id);
  }

  function clearError() {
    setError(undefined);
  }

  return {
    setupStatus: status,
    setupStep: idx,
    setupSteps: steps,
    idleTipsVideoUrl: config.state.config
      ? config.state.config.urlVideoIdleTips
      : "",
    mentor: editedMentor,
    isEdited: isMentorEdited,
    isLoading: isMentorLoading,
    isSaving: isMentorSaving,
    isTraining,
    error,
    editMentor,
    saveMentor: saveMentorDetails,
    startTraining: train,
    nextStep,
    prevStep,
    toStep,
    clearError,
  };
}
