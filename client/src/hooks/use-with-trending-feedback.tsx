/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { fetchTrendingFeedback } from "api";
import { useEffect, useState } from "react";
import {
  localStorageClear,
  localStorageGet,
  localStorageStore,
} from "store/local-storage";
import useActiveMentor from "store/slices/mentor/useActiveMentor";
import {
  BinCollection,
  ClassifierAnswerType,
  Feedback,
  TrendingUserQuestion,
  UserQuestionBin,
  WeightedTrendingUserQuestion,
} from "types";
import { validate, ValidationError } from "jsonschema";
// import similarity from 'string-cosine-similarity'
import { cosine } from "string-comparison";

const binCollectionSchema = {
  type: "object",
  properties: {
    bins: {
      type: "array",
      items: {
        type: "object",
        properties: {
          userQuestions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                _id: {
                  type: "string",
                },
                question: {
                  type: "string",
                },
                feedback: {
                  type: "string",
                },
                confidence: {
                  type: "number",
                },
                classifierAnswerType: {
                  type: "string",
                },
                dismissed: {
                  type: "boolean",
                },
                updatedAt: {
                  type: "string",
                },
                createdAt: {
                  type: "string",
                },
                weight: {
                  type: "number",
                },
              },
              required: [
                "_id",
                "question",
                "confidence",
                "classifierAnswerType",
                "dismissed",
                "updatedAt",
                "createdAt",
                "weight",
              ],
            },
          },
          binWeight: {
            type: "number",
          },
          mentor: {
            type: "string",
          },
        },
        required: ["userQuestions", "binWeight", "mentor"],
      },
    },
    lastUpdated: {
      type: "string",
    },
  },
  required: ["bins", "lastUpdated"],
};

export interface UseWithTrendingFeedback {
  trendingUserQuestionIds: string[];
  error: string;
}

export function useWithTrendingFeedback(): UseWithTrendingFeedback {
  const { getData } = useActiveMentor();
  const mentorId = getData((state) => state.data?._id) || "";
  const emptyBinCollection = { bins: [], lastUpdated: 0, mentor: mentorId };
  const [binCollection, setBinCollection] =
    useState<BinCollection>(emptyBinCollection);
  const [trendingUserQuestionIds, setTrendingUserQuestionIds] = useState<
    string[]
  >([]);
  const [error, setError] = useState<string>("");
  const similarityThreshold = 0.9;

  useEffect(() => {
    console.log("in here", binCollection);
    if (!binCollection.lastUpdated) {
      //0 when nothing is loaded yet
      return;
    }
    const bestRepresentatives = getBinRepresentatives(binCollection);
    setTrendingUserQuestionIds(bestRepresentatives.map((userQ) => userQ._id));
  }, [binCollection.lastUpdated]);

  function calculateBinWeight(bin: UserQuestionBin) {
    // TODO: Needs to be updated to involve recency
    const newBinTotalWeight = bin.userQuestions.reduce((sum, f) => {
      return (sum += f.weight);
    }, 0);
    return newBinTotalWeight / bin.userQuestions.length;
  }

  function getBinRepresentatives(
    bin: BinCollection
  ): WeightedTrendingUserQuestion[] {
    // TODO: Implement algorithm to get actual best representatives, not just first questions
    return bin.bins.map((b) => b.userQuestions[0]);
  }

  // The question should already be determined to belong to this bin
  function addQuestionToBin(
    weightedQuestion: WeightedTrendingUserQuestion,
    bin: UserQuestionBin
  ): UserQuestionBin {
    // TODO: need to also calculate binAverageEmbedding here
    if (!bin.userQuestions.length) {
      return {
        userQuestions: [weightedQuestion],
        binWeight: weightedQuestion.weight,
      };
    } else {
      bin.userQuestions.push(weightedQuestion);
      return {
        userQuestions: bin.userQuestions,
        binWeight: calculateBinWeight(bin),
      };
    }
  }

  function getLocalStorageBins(): BinCollection {
    const localStorageBins = localStorageGet("userQuestionBins");
    if (!localStorageBins) {
      return emptyBinCollection;
    }
    try {
      const storedBinCollection: BinCollection = JSON.parse(localStorageBins);
      validate(storedBinCollection, binCollectionSchema);

      if (storedBinCollection.mentor !== mentorId) {
        localStorageClear("userQuestionBins");
        return emptyBinCollection;
      }
      return storedBinCollection;
    } catch (err) {
      console.error(
        "Failed to validate locally stored bin collection schema, clearing it out of local storage",
        err
      );
      localStorageClear("userQuestionBins");
      return emptyBinCollection;
    }
  }

  function addQuestionToBestBin(
    weightedQuestion: WeightedTrendingUserQuestion,
    binCollection: BinCollection
  ): BinCollection {
    binCollection.lastUpdated = Date.now();
    if (!binCollection.bins.length) {
      const newUserQuestionBin: UserQuestionBin = {
        userQuestions: [weightedQuestion],
        binWeight: weightedQuestion.weight,
      };
      binCollection.bins = [newUserQuestionBin];
    }
    // Determining best bin
    let bestBinIndex = -1;
    let bestSimilarity = -1;
    for (let i = 0; i < binCollection.bins.length; i++) {
      const binsUserQuestions = binCollection.bins[i].userQuestions;
      if (!binsUserQuestions.length) {
        continue;
      }
      const firstItemInBin = binsUserQuestions[0];
      const similarityToBin = cosine.similarity(
        firstItemInBin.question,
        weightedQuestion.question
      );
      // console.log(`${firstItemInBin.question} : ${weightedQuestion.question} = ${similarityToBin}`)
      if (similarityToBin > bestSimilarity) {
        bestSimilarity = similarityToBin;
        bestBinIndex = i;
      }
    }

    if (bestBinIndex === -1 || bestSimilarity < similarityThreshold) {
      // no good matched bins found, creating its own
      const newUserQuestionBin: UserQuestionBin = {
        userQuestions: [weightedQuestion],
        binWeight: weightedQuestion.weight,
      };
      binCollection.bins.push(newUserQuestionBin);
    } else {
      // best bin index has a similarity >= similarityThreshold
      binCollection.bins[bestBinIndex] = addQuestionToBin(
        weightedQuestion,
        binCollection.bins[bestBinIndex]
      );
    }
    return binCollection;
  }

  function removeNonTrendingAnswersFromBins(
    trendingUserQuestions: TrendingUserQuestion[],
    bins: UserQuestionBin[]
  ): UserQuestionBin[] {
    const trendingFeedbackIds = trendingUserQuestions.map((userQ) => userQ._id);
    console.log("in removeing", bins.length);
    for (let i = 0; i < bins.length; i++) {
      console.log(bins[i].userQuestions.length);
      bins[i].userQuestions = bins[i].userQuestions.filter((userQuestion) =>
        trendingFeedbackIds.find(
          (trendingFeedbackId) => trendingFeedbackId == userQuestion._id
        )
      );
      console.log(bins[i].userQuestions.length);
    }
    // since we removed some questions, make sure we have no empty bins
    bins = bins.filter((bin) => bin.userQuestions.length > 0);

    // TODO: Recalculate the average embedding of each bin since we may have removed some questions
    return bins;
  }

  useEffect(() => {
    if (!mentorId) {
      return;
    }
    const localStorageBins = getLocalStorageBins();
    fetchTrendingFeedback({
      limit: 1000,
      sortBy: "createdAt",
      sortAscending: false,
      cursor: "",
      filter: {
        $and: [
          {
            $or: [
              { classifierAnswerType: ClassifierAnswerType.OFF_TOPIC },
              { feedback: Feedback.BAD },
              { confidence: { $lt: -0.45 } },
            ],
          },
          { graderAnswer: null },
          { mentor: mentorId },
          { $or: [{ dismissed: false }, { dismissed: { $exists: false } }] },
        ],
      },
    })
      .then((data) => {
        const trendingFeedback = data.edges.map((edge) => edge.node);
        let newBins = localStorageBins;
        newBins.bins = removeNonTrendingAnswersFromBins(
          trendingFeedback,
          newBins.bins
        );
        const binsLastUpdated = localStorageBins.lastUpdated;
        const newTrendingFeedback = trendingFeedback.filter((feedback) => {
          return Date.parse(feedback.createdAt) > binsLastUpdated;
        });
        console.log(newTrendingFeedback);
        const newWeightedTrendingFeedback: WeightedTrendingUserQuestion[] =
          newTrendingFeedback.map((feedback) => {
            const feedbackWeight = feedback.feedback === Feedback.BAD ? 3 : 0;
            const offTopicWeight =
              feedback.classifierAnswerType === ClassifierAnswerType.OFF_TOPIC
                ? 2
                : 0;
            const lowConfidenceWeight = feedback.confidence < -0.45 ? 1 : 0;
            return {
              ...feedback,
              weight: feedbackWeight + offTopicWeight + lowConfidenceWeight,
            };
          });
        newWeightedTrendingFeedback.forEach((feedback) => {
          newBins = addQuestionToBestBin(feedback, newBins);
        });
        setBinCollection(newBins);
        localStorageStore("userQuestionBins", JSON.stringify(newBins));
      })
      .catch((err) => {
        console.error("failed to fetch trending feedback", err);
        setError(JSON.stringify(err));
      });
  }, [mentorId]);

  return {
    trendingUserQuestionIds,
    error,
  };
}
