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
  Status,
  Subject,
  UtteranceName,
} from "types";
import { LoadingError } from "./loading-reducer";
import { useWithConfig } from "store/slices/config/useWithConfig";
import { getValueIfKeyExists, urlBuild } from "helpers";
import { useMentorEdits } from "store/slices/mentor/useMentorEdits";
import useActiveMentor from "store/slices/mentor/useActiveMentor";
import useQuestions, {
  isQuestionsLoading,
} from "store/slices/questions/useQuestions";

export enum SetupStepType {
  WELCOME = 0,
  MENTOR_INFO = 1,
  MENTOR_TYPE = 2,
  INTRODUCTION = 3,
  SELECT_SUBJECTS = 4,
  IDLE_TIPS = 5,
  IDLE = 6,
  REQUIRED_SUBJECT = 7,
  FINISH_SETUP = 8,
}

interface SetupStep {
  type: SetupStepType;
  complete: boolean;
}

interface SetupStatus {
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

interface UseWithSetup {
  setupStatus?: SetupStatus;
  setupStep: number;
  setupSteps: SetupStep[];
  idleTipsVideoUrl: string;
  classifierLambdaEndpoint: string;
  uploadLambdaEndpoint: string;
  mentor?: Mentor;
  isEdited: boolean;
  isLoading: boolean;
  isSaving: boolean;
  readyToDisplay: boolean;
  error?: LoadingError;
  editMentor: (d: Partial<Mentor>) => void;
  saveMentor: () => void;
  nextStep: () => void;
  prevStep: () => void;
  toStep: (i: number) => void;
  clearError: () => void;
  navigateToMissingSetup: () => void;
}

export function useWithSetup(search?: { i?: string }): UseWithSetup {
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

  const mentor = getData((state) => state.data);
  const mentorQuestions = useQuestions(
    (state) => state.questions,
    mentor?.answers?.map((a: Answer) => a.question)
  );
  const questionsLoading = isQuestionsLoading(
    mentor?.answers?.map((a: Answer) => a.question)
  );
  const { editedMentor, isMentorEdited, editMentor, saveMentorDetails } =
    useMentorEdits();
  const { state: configState, isConfigLoaded } = useWithConfig();

  useEffect(() => {
    if (
      !mentor ||
      isMentorSaving ||
      isMentorLoading ||
      questionsLoading ||
      !isConfigLoaded()
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
        ? { idle: idleAnswer, complete: idleAnswer.status === Status.COMPLETE }
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
          complete: answers.every((a: Answer) => a.status === Status.COMPLETE),
        };
      });
    const isSetupComplete =
      isMentorInfoDone &&
      isMentorTypeChosen &&
      (!idle || idle.complete) &&
      requiredSubjects.every(
        (s: { subject: Subject; answers: Answer[]; complete: boolean }) =>
          s.complete
      );
    setStatus({
      isMentorInfoDone,
      isMentorTypeChosen,
      idle,
      requiredSubjects,
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
    setSteps(status);
  }, [mentor, questionsLoading, configState.config]);

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

  function nextStep(): void {
    if (!status) {
      return;
    }
    if (isMentorEdited) {
      saveMentorDetails();
    }
    addToIdx(1);
  }

  function prevStep(): void {
    if (!status) {
      return;
    }
    if (isMentorEdited) {
      saveMentorDetails();
    }
    addToIdx(-1);
  }

  function toStep(i: number): void {
    if (!status || i < 0 || i >= steps.length) {
      return;
    }
    if (isMentorEdited) {
      saveMentorDetails();
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
    if (!status.isMentorInfoDone) {
      navigate(urlBuild("/setup", { i: String(SetupStepType.MENTOR_INFO) }));
    } else if (!status.isMentorTypeChosen) {
      navigate(urlBuild("/setup", { i: String(SetupStepType.MENTOR_TYPE) }));
    } else if (status.idle && !status.idle.complete) {
      navigate(urlBuild("/setup", { i: String(SetupStepType.IDLE) }));
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
    setupStep: idx,
    setupSteps: steps,
    idleTipsVideoUrl: configState.config?.urlVideoIdleTips || "",
    classifierLambdaEndpoint:
      configState.config?.classifierLambdaEndpoint || "",
    uploadLambdaEndpoint: configState.config?.uploadLambdaEndpoint || "",
    mentor: editedMentor,
    isEdited: isMentorEdited,
    isLoading: isMentorLoading,
    isSaving: isMentorSaving,
    readyToDisplay:
      isConfigLoaded() && !isMentorLoading && mentor && !questionsLoading,
    error: mentorError,
    editMentor,
    saveMentor: saveMentorDetails,
    nextStep,
    prevStep,
    toStep,
    clearError,
    navigateToMissingSetup,
  };
}
