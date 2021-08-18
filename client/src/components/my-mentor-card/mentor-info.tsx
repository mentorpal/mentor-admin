/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { Mentor, MentorType } from "types";
interface Stage {
  name: string;
  index: number;
  description: string;
  floor: number;
  max: number;
  percent: number;
  next: {
    name: string;
    index: number;
    description: string;
    floor: number;
    max: number;
  };
}

interface MentorInfo {
  mentorId: string;
  name: string;
  type: MentorType;
  title: string;
  lastTrainedAt: string;
  value: number;
  currentStage: Stage;
}
export const defaultMentorInfo: MentorInfo = {
  mentorId: "",
  name: "",
  type: MentorType.CHAT,
  title: "",
  lastTrainedAt: "",
  value: 0,
  currentStage: {
    name: "Incomplete",
    index: 0,
    description: "This Mentor can't be built yet.",
    floor: 0,
    max: 5,
    percent: 0,
    next: {
      name: "Incomplete",
      index: 0,
      description: "This Mentor can't be built yet.",
      floor: 0,
      max: 5,
    },
  },
};

function StageSelect(value: number): Stage {
  const stages = [
    {
      name: "Incomplete",
      index: 0,
      description: "This Mentor can't be built yet.",
      floor: 0,
      max: 5,
    },
    {
      name: "Scripted",
      index: 1,
      description: "This Mentor can select questions from a list",
      floor: 5,
      max: 20,
    },
    {
      name: "Interactive",
      index: 2,
      description: "This Mentor can respond to simple questions.",
      floor: 20,
      max: 50,
    },
    {
      name: "Specialist",
      index: 3,
      description: "This mentor can answer questions within a specific topic.",
      floor: 50,
      max: 150,
    },
    {
      name: "Conversational",
      index: 4,
      description: "This mentor can respond to questions with some nuance.",
      floor: 150,
      max: 250,
    },
    {
      name: "Full-Subject",
      index: 5,
      description:
        "Your mentor is equipped to answer questions within a broad subject.",
      floor: 250,
      max: 1000,
    },
    {
      name: "Life-Story",
      index: 6,
      description:
        "Your mentor can hold a natural conversation. Congratulations!",
      floor: 1000,
      max: value + 1,
    },
    {
      name: "None",
      index: 7,
      description: "you've reached the final stage",
      floor: value,
      max: value,
    },
  ];
  const currentStage = stages.find((stage) => {
    return stage.max - 1 >= value;
  });
  if (!currentStage) return { ...stages[0], next: stages[1], percent: 0 };
  return {
    ...currentStage,
    ...{
      next: stages[currentStage.index + 1],
      percent: Math.round((value / currentStage.max) * 100),
    },
  };
}

export default function parseMentor(mentor: Mentor): MentorInfo {
  const value =
    mentor?.answers.filter((a) => a.status === "COMPLETE").length || 0;
  return {
    mentorId: mentor?._id || "",
    name: mentor?.name || "Unnamed",
    type: mentor?.mentorType,
    title: mentor?.title || "none",
    lastTrainedAt: mentor?.lastTrainedAt || "never",
    value: value,
    currentStage: StageSelect(value),
  };
}
