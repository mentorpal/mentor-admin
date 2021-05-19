/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect, useState } from "react";
import { MentorType, Status, User, UtteranceName } from "types";
import { useWithMentor } from "./use-with-mentor";

import { Slide, SlideType } from "components/setup/slide";
import { WelcomeSlide } from "components/setup/welcome-slide";
import { MentorInfoSlide } from "components/setup/mentor-info-slide";
import { MentorTypeSlide } from "components/setup/mentor-type-slide";
import { IntroductionSlide } from "components/setup/introduction-slide";
import { SelectSubjectsSlide } from "components/setup/select-subjects-slide";
import { RecordIdleSlide } from "components/setup/record-idle-slide";
import { RecordSubjectSlide } from "components/setup/record-subject-slide";
import { BuildMentorSlide } from "components/setup/build-mentor-slide";
import { useWithTraining } from "hooks/task/use-with-train";

export enum SetupStatus {
  LOADING = "LOADING",
  INCOMPLETE = "INCOMPLETE",
  COMPLETE = "COMPLETE",
}

export function useWithSetup(
  accessToken: string,
  uiProps?: {
    classes: Record<string, string>;
    user: User;
  }
) {
  const [slides, setSlides] = useState<SlideType[]>([]);
  const [setupStatus, setSetupStatus] = useState<SetupStatus>(
    SetupStatus.LOADING
  );
  const {
    mentor,
    editedMentor,
    isMentorEdited,
    isMentorLoading,
    isMentorSaving,
    editMentor,
    saveMentor,
  } = useWithMentor(accessToken);
  const { isTraining, trainStatus, startTraining } = useWithTraining();

  useEffect(() => {
    if (!mentor || !editedMentor || isMentorSaving || isMentorLoading) {
      return;
    }
    const mentorSlideDone = Boolean(
      mentor.name && mentor.firstName && mentor.title
    );
    const mentorTypeDone = Boolean(mentor.mentorType);
    const slides = uiProps
      ? [
          Slide(
            true,
            <WelcomeSlide
              key="welcome"
              classes={uiProps.classes}
              userName={uiProps.user.name}
            />
          ),
          Slide(
            mentorSlideDone,
            <MentorInfoSlide
              key="mentor-info"
              classes={uiProps.classes}
              mentor={editedMentor}
              isMentorEdited={isMentorEdited}
              isMentorLoading={isMentorLoading || isMentorSaving}
              editMentor={editMentor}
              saveMentor={saveMentor}
            />
          ),
          Slide(
            mentorTypeDone,
            <MentorTypeSlide
              key="chat-type"
              classes={uiProps.classes}
              mentor={editedMentor}
              isMentorEdited={isMentorEdited}
              isMentorLoading={isMentorLoading || isMentorSaving}
              editMentor={editMentor}
              saveMentor={saveMentor}
            />
          ),
          Slide(
            true,
            <IntroductionSlide key="introduction" classes={uiProps.classes} />
          ),
          Slide(true, <SelectSubjectsSlide classes={uiProps.classes} i={4} />),
        ]
      : [];
    let mentorIdleDone = true;
    if (mentor.mentorType === MentorType.VIDEO) {
      const idle = mentor.answers.find(
        (a) => a.question.name === UtteranceName.IDLE
      );
      if (idle) {
        mentorIdleDone = idle.status === Status.COMPLETE;
        if (uiProps) {
          slides.push(
            Slide(
              mentorIdleDone,
              <RecordIdleSlide
                key="idle"
                classes={uiProps.classes}
                idle={idle}
                i={slides.length}
              />
            )
          );
        }
      }
    }
    let requiredSubjectsDone = true;
    mentor.subjects
      .filter((s) => s.isRequired)
      .forEach((s) => {
        const answers = mentor.answers.filter((a) =>
          s.questions.map((q) => q.question._id).includes(a.question._id)
        );
        const subjectDone = answers.every((a) => a.status === Status.COMPLETE);
        requiredSubjectsDone = requiredSubjectsDone && subjectDone;
        if (uiProps) {
          slides.push(
            Slide(
              subjectDone,
              <RecordSubjectSlide
                key={`${s.name}`}
                classes={uiProps.classes}
                subject={s}
                questions={answers}
                i={slides.length}
              />
            )
          );
        }
      });
    const trainingDone = Boolean(mentor.lastTrainedAt);
    const isBuildable =
      mentorSlideDone &&
      mentorTypeDone &&
      mentorIdleDone &&
      requiredSubjectsDone;
    const isSetupComplete = isBuildable && trainingDone;
    if (uiProps) {
      slides.push(
        Slide(
          isBuildable && trainingDone,
          <BuildMentorSlide
            key="build"
            classes={uiProps.classes}
            mentor={editedMentor}
            isMentorLoading={isMentorLoading || isMentorSaving}
            isSetupComplete={isBuildable}
            isTraining={isTraining}
            trainStatus={trainStatus}
            startTraining={() => startTraining(mentor._id)}
          />
        )
      );
    }
    setSlides(slides);
    setSetupStatus(
      isSetupComplete ? SetupStatus.COMPLETE : SetupStatus.INCOMPLETE
    );
  }, [editedMentor, mentor]);

  return {
    mentor: editedMentor,
    slides,
    setupStatus,
    isSetupComplete: setupStatus === SetupStatus.COMPLETE,
    isSetupLoading: isMentorLoading,
    isSetupSaving: isMentorSaving,
  };
}
