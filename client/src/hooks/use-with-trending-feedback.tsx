/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { fetchTrendingFeedback, sbertEncodeSentences } from "api";
import { useEffect, useReducer } from "react";
import {
  localStorageClear,
  localStorageGet,
  localStorageStore,
} from "store/local-storage";
import useActiveMentor from "store/slices/mentor/useActiveMentor";
import {
  BinCollection,
  ClassifierAnswerType,
  Connection,
  Feedback,
  TrendingUserQuestion,
  UserQuestionBin,
  WeightedTrendingUserQuestion,
} from "types";
import { validate } from "jsonschema";
import { cosine } from "string-comparison";
import {
  LoadingStatusType,
  LoadingReducer,
  LoadingState,
  LoadingActionType,
} from "./graphql/generic-loading-reducer";
import {
  cosinesim,
  extractErrorMessageFromError,
  getDaysSinceDate,
} from "helpers";
import { useWithLocalStoredEmbeddings } from "./use-with-local-stored-embeddings";
import { useWithRecordQueue } from "./graphql/use-with-record-queue";

export const binCollectionSchema = {
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

const initialState: LoadingState<string[]> = {
  status: LoadingStatusType.LOADING,
  data: [],
  error: undefined,
};

export interface UseWithTrendingFeedback {
  loadingStatus: LoadingStatusType;
  bestRepIds: string[];
  removeQuestionFromQueue: (questionId: string) => void;
  addQuestionToQueue: (questionId: string) => void;
  recordQueue: string[];
}

export function _fetchTrendingFeedback(
  questionsInQueue: string[],
  mentorId: string,
  limit?: number
): Promise<Connection<TrendingUserQuestion>> {
  return fetchTrendingFeedback({
    limit: limit || 1000,
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
        { question: { $nin: questionsInQueue } },
      ],
    },
  });
}

export function useWithTrendingFeedback(
  accessToken: string
): UseWithTrendingFeedback {
  const { getData } = useActiveMentor();
  const mentorId = getData((state) => state.data?._id) || "";
  const emptyBinCollection = { bins: [], lastUpdated: 0, mentor: mentorId };
  const {
    getSavedEmbeddings,
    saveNewEmbeddings: saveEmbeddingsToLocalStorage,
  } = useWithLocalStoredEmbeddings();
  const {
    recordQueue,
    questionDocsInQueue,
    loadingStatus: recordQueueLoadStatus,
    removeQuestionFromQueue,
    addQuestionToQueue,
  } = useWithRecordQueue(accessToken);
  const [state, dispatch] = useReducer(LoadingReducer<string[]>, initialState);
  const similarityThreshold = 0.9;

  function calculateBinWeight(userQuestions: WeightedTrendingUserQuestion[]) {
    const itemScoreSum = userQuestions.reduce((sum, f) => {
      return (sum += f.weight);
    }, 0);
    const mostRecentAsked = userQuestions.reduce((prev, cur) => {
      if (cur.createdAt > prev.createdAt) {
        prev = cur;
      }
      return prev;
    });
    const daysSinceMostRecentAsked = getDaysSinceDate(
      mostRecentAsked.createdAt
    );
    const binWeightConstant = 0.5;
    return (
      itemScoreSum *
      Math.exp(binWeightConstant * -1 * (1 + daysSinceMostRecentAsked))
    );
  }

  function getBinRepresentatives(
    bin: BinCollection
  ): WeightedTrendingUserQuestion[] {
    const bins = bin.bins;
    const bestRepresentatives = bins.reduce(
      (reps: WeightedTrendingUserQuestion[], bin) => {
        const binsBestRep = bin.userQuestions.reduce((prev, cur) => {
          if (
            cosinesim(cur.embedding, bin.binAverageEmbedding) >
            cosinesim(prev.embedding, bin.binAverageEmbedding)
          ) {
            return cur;
          }
          return prev;
        });
        reps.push(binsBestRep);
        return reps;
      },
      []
    );
    return bestRepresentatives;
  }

  // The question should already be determined to belong to this bin
  function addQuestionToBin(
    weightedQuestion: WeightedTrendingUserQuestion,
    bin: UserQuestionBin
  ): UserQuestionBin {
    // TODO: need to also calculate binAverageEmbedding here
    bin.userQuestions.push(weightedQuestion);
    bin.binWeight = calculateBinWeight(bin.userQuestions);
    return bin;
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

  function createNewUserQuestionBin(
    weightedQuestion: WeightedTrendingUserQuestion
  ): UserQuestionBin {
    return {
      userQuestions: [weightedQuestion],
      binWeight: calculateBinWeight([weightedQuestion]),
      binAverageEmbedding: [],
      bestRepresentativeId: weightedQuestion._id,
    };
  }

  function addQuestionToBestBin(
    weightedQuestion: WeightedTrendingUserQuestion,
    binCollection: BinCollection
  ): BinCollection {
    binCollection.lastUpdated = Date.now();
    if (!binCollection.bins.length) {
      binCollection.bins.push(createNewUserQuestionBin(weightedQuestion));
      return binCollection;
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
      if (similarityToBin > bestSimilarity) {
        bestSimilarity = similarityToBin;
        bestBinIndex = i;
      }
    }

    // Adding to best found bin
    if (bestBinIndex === -1 || bestSimilarity < similarityThreshold) {
      // no good matched bins found, creating its own
      binCollection.bins.push(createNewUserQuestionBin(weightedQuestion));
    } else {
      // best bin index has a similarity >= similarityThreshold
      binCollection.bins[bestBinIndex] = addQuestionToBin(
        weightedQuestion,
        binCollection.bins[bestBinIndex]
      );
    }
    return binCollection;
  }

  async function removeNonTrendingAnswersFromBins(
    trendingUserQuestions: TrendingUserQuestion[],
    bins: UserQuestionBin[]
  ): Promise<UserQuestionBin[]> {
    const trendingFeedbackIds = trendingUserQuestions.map((userQ) => userQ._id);
    for (let i = 0; i < bins.length; i++) {
      bins[i].userQuestions = bins[i].userQuestions.filter((userQuestion) =>
        trendingFeedbackIds.find(
          (trendingFeedbackId) => trendingFeedbackId == userQuestion._id
        )
      );
    }
    // since we removed some questions, make sure we have no empty bins
    bins = bins.filter((bin) => bin.userQuestions.length > 0);

    // Recalculate the average embedding of the bins since we may have removed some questions
    bins = await fetchAndSetBinEmbeddings(bins);
    return bins;
  }

  function averageEmbedding(embeddings: number[][]): number[] {
    if (embeddings.length == 0) {
      return [];
    }
    const expectedEmbeddingsLength = embeddings[0].length; //It is expected that all embeddings are equal length, else issue occured
    for (let i = 0; i < embeddings.length; i++) {
      if (embeddings[i].length !== expectedEmbeddingsLength) {
        throw new Error("Not all embeddings are equal length");
      }
    }
    const summedColumns = [];
    for (let i = 0; i < expectedEmbeddingsLength; i++) {
      let columnValue = 0;
      embeddings.forEach((embedding) => {
        columnValue += embedding[i];
      });
      summedColumns.push(columnValue);
    }
    const averageEmbedding = summedColumns.map(
      (columnV) => columnV / embeddings.length
    );
    return averageEmbedding;
  }

  /**
   * Updates the average embedding of every bin
   */
  async function fetchAndSetBinEmbeddings(
    bins: UserQuestionBin[]
  ): Promise<UserQuestionBin[]> {
    const sentences: string[] = bins.reduce(
      (acc: string[], bin: UserQuestionBin) => {
        acc.push(...bin.userQuestions.map((userQ) => userQ.question));
        return acc;
      },
      [] as string[]
    );
    const sentencesSet = Array.from(new Set(sentences)); //Remove any duplicates
    // First check locally saved embeddings
    const locallySavedEmbeddings = await getSavedEmbeddings();
    const finalEmbeddings = sentencesSet.reduce(
      (record: Record<string, number[]>, sentence) => {
        if (sentence in locallySavedEmbeddings) {
          record[sentence] = locallySavedEmbeddings[sentence];
        }
        return record;
      },
      {}
    );
    const sentencesNeedingEmbeddings = sentencesSet.filter(
      (sentence) =>
        !Object.keys(finalEmbeddings).find(
          (savedSentenceKey) => savedSentenceKey == sentence
        )
    );
    // Any leftover sentences needing embeddings are then fetched from sbert
    const embeddedSentences = sentencesNeedingEmbeddings.length
      ? await sbertEncodeSentences(sentencesNeedingEmbeddings, accessToken)
      : [];
    embeddedSentences.forEach((embeddedSentence) => {
      finalEmbeddings[embeddedSentence.original] = embeddedSentence.encoded;
    });
    // Save up to date embeddings to local storage
    await saveEmbeddingsToLocalStorage(finalEmbeddings);
    for (let i = 0; i < bins.length; i++) {
      const userQuestions = bins[i].userQuestions;
      const userQuestionEmbeddings = userQuestions.map(
        (userQuestion) => finalEmbeddings[userQuestion.question]
      );

      // If we wanted to add the embeddings to each question, but this is too much for local storage
      bins[i].userQuestions = userQuestions.map((userQuestion) => {
        return {
          ...userQuestion,
          embedding: finalEmbeddings[userQuestion.question],
        };
      });

      bins[i].binAverageEmbedding = averageEmbedding(userQuestionEmbeddings);
    }
    return bins;
  }

  function convertFeedbackQuestionToWeighted(
    userQuestion: TrendingUserQuestion
  ): WeightedTrendingUserQuestion {
    const feedbackWeight = userQuestion.feedback === Feedback.BAD ? 3 : 0;
    const offTopicWeight =
      userQuestion.classifierAnswerType === ClassifierAnswerType.OFF_TOPIC
        ? 2
        : 0;
    const lowConfidenceWeight = userQuestion.confidence < -0.45 ? 1 : 0;
    return {
      ...userQuestion,
      weight: feedbackWeight + offTopicWeight + lowConfidenceWeight,
      embedding: [],
    };
  }

  function storeBinsInLocalStorage(binCollection: BinCollection) {
    // Clean embeddings before storing in localStorage
    const binsToStore: BinCollection = {
      ...binCollection,
      bins: binCollection.bins.map((bin) => {
        return {
          ...bin,
          binAverageEmbedding: [] as number[],
          userQuestions: bin.userQuestions.map((userQ) => {
            return {
              ...userQ,
              embedding: [] as number[],
            };
          }),
        };
      }),
    };
    localStorageStore("userQuestionBins", JSON.stringify(binsToStore));
  }

  useEffect(() => {
    if (!mentorId || recordQueueLoadStatus !== LoadingStatusType.SUCCESS) {
      return;
    }
    dispatch({ type: LoadingActionType.LOADING_STARTED });
    const localStorageBins = getLocalStorageBins();
    const questionsInQueue = questionDocsInQueue.map(
      (questionDoc) => questionDoc.question
    );
    const setupTrendingFeedback = async () => {
      _fetchTrendingFeedback(questionsInQueue, mentorId)
        .then(async (data) => {
          try {
            const trendingFeedback = data.edges.map((edge) => edge.node);
            let newBins = localStorageBins;
            newBins.bins = await removeNonTrendingAnswersFromBins(
              trendingFeedback,
              newBins.bins
            );
            const binsLastUpdated = localStorageBins.lastUpdated;
            const newTrendingFeedback = trendingFeedback.filter((feedback) => {
              return Date.parse(feedback.createdAt) > binsLastUpdated;
            });
            const newWeightedTrendingFeedback: WeightedTrendingUserQuestion[] =
              newTrendingFeedback.map((feedback) =>
                convertFeedbackQuestionToWeighted(feedback)
              );
            newWeightedTrendingFeedback.forEach((feedback) => {
              newBins = addQuestionToBestBin(feedback, newBins);
            });
            // Set bin embeddings
            newBins.bins = await fetchAndSetBinEmbeddings(newBins.bins);
            // Sort bins by bin weight
            newBins.bins = newBins.bins.sort((a, b) =>
              a.binWeight < b.binWeight ? 1 : -1
            );
            // Take 60 most important bins only
            newBins.bins = newBins.bins.slice(0, 60);
            const bestRepresentatives = getBinRepresentatives(newBins);
            const bestRepIds = bestRepresentatives.map((userQ) => userQ._id);
            dispatch({
              type: LoadingActionType.LOADING_SUCCEEDED,
              dataPayload: bestRepIds,
            });
            storeBinsInLocalStorage(newBins);
          } catch (err) {
            // Fallback to not using bins since something failed.
            const userQuestionsIds = data.edges.map((edge) => edge.node._id);
            dispatch({
              type: LoadingActionType.LOADING_SUCCEEDED,
              dataPayload: userQuestionsIds,
            });
          }
        })
        .catch((err) => {
          dispatch({
            type: LoadingActionType.LOADING_FAILED,
            errorPayload: {
              message: "Failed to fetch trending feedback",
              error: extractErrorMessageFromError(err),
            },
          });
        });
    };
    setupTrendingFeedback();
  }, [mentorId, recordQueueLoadStatus]);

  return {
    loadingStatus: state.status,
    bestRepIds: state.data || [],
    removeQuestionFromQueue,
    addQuestionToQueue,
    recordQueue,
  };
}
