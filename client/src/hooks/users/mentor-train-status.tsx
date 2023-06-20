/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { mentorTrainStatusById } from "api";
import useInterval from "hooks/task/use-interval";
import { useEffect, useState } from "react";
import { JobState, Mentor } from "types";

export interface UseWithMentorTrainStatus {
  addMentorToPoll: (m: Mentor) => void;
  mentorTrainStatusDict: Record<string, JobState>;
}

export function useWithMentorTrainStatus(props: {
  mentors?: Mentor[];
}): UseWithMentorTrainStatus {
  const { mentors } = props;
  const [mentorTrainStatusDict, setMentorTrainStatusDict] = useState<
    Record<string, JobState>
  >({});
  const [mentorsToPoll, setMentorsToPoll] = useState<string[]>([]);
  const [mentorsInitialSet, setMentorsInitialSet] = useState(false);

  useEffect(() => {
    if (!mentors || mentorsInitialSet) {
      return;
    }
    setMentorsInitialSet(true);
    mentors.forEach((mentor) => {
      setMentorTrainStatusDict((prev) => {
        return {
          ...prev,
          [mentor._id]: mentor.lastTrainStatus,
        };
      });
    });

    const _mentorsToPoll = mentors.filter((mentor) => {
      mentor.lastTrainStatus === JobState.PENDING;
    });

    setMentorsToPoll(_mentorsToPoll.map((mentor) => mentor._id));
  }, [mentors, mentorsInitialSet]);

  useInterval(
    (isCancelled) => {
      if (isCancelled()) {
        return;
      }
      mentorTrainStatusById(mentorsToPoll).then((mentorTrainStatuses) => {
        setMentorTrainStatusDict((prevValue) => {
          const newTrainStatusDict: Record<string, JobState> = {};
          mentorTrainStatuses.forEach((n) => {
            newTrainStatusDict[n._id] = n.lastTrainStatus;
          });
          return {
            ...prevValue,
            ...newTrainStatusDict,
          };
        });

        const completeMentors = mentorTrainStatuses.filter(
          (trainStatus) =>
            trainStatus.lastTrainStatus === JobState.FAILURE ||
            trainStatus.lastTrainStatus === JobState.SUCCESS
        );
        setMentorsToPoll((prevValue) => {
          return prevValue.filter(
            (mentorId) =>
              !completeMentors.find(
                (completeMentor) => completeMentor._id === mentorId
              )
          );
        });
      });
    },
    mentorsToPoll.length ? 3000 : null
  );

  function addMentorToPoll(mentor: Mentor) {
    setMentorsToPoll((prev) => {
      return [...prev, mentor._id];
    });
    setMentorTrainStatusDict((prevValue) => {
      return {
        ...prevValue,
        [mentor._id]: JobState.PENDING,
      };
    });
  }

  return {
    addMentorToPoll,
    mentorTrainStatusDict,
  };
}
