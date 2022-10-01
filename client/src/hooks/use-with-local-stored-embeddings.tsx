/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { string } from "@tensorflow/tfjs";
import { useEffect, useState } from "react";
import {
  localStorageClear,
  localStorageGet,
  localStorageStore,
} from "store/local-storage";
import { validate } from "jsonschema";
import { v4 as uuid } from "uuid";

const storedEmbeddingsSchema = {
  type: "object",
  properties: {
    encoded: {
      type: "array",
      items: {
        type: "number",
      },
    },
    original: {
      type: "string",
    },
  },
  required: ["encoded", "original"],
};

export interface UseWithLocalStoredEmbeddings {
  getSavedEmbeddings: () => Record<string, number[]>;
  saveNewEmbeddings: (embeddings: Record<string, number[]>) => void;
}

export function useWithLocalStoredEmbeddings(): UseWithLocalStoredEmbeddings {
  const LOCAL_STORAGE_NAME = "sentence_embeddings";
  // Record that maps each local storage key to the record storage mappings
  const [embeddingsRecords, setEmbeddingsRecords] = useState<
    Record<string, Record<string, number[]>>
  >({});

  function checkForAlreadyStoredEmbeddings() {
    const localStorageKeys = Object.keys(localStorage);
    const embeddingLocalStorageKeys = localStorageKeys.filter((key) =>
      key.startsWith(LOCAL_STORAGE_NAME)
    );

    if (!embeddingLocalStorageKeys.length) {
      const newLocalStorageKey = `${LOCAL_STORAGE_NAME}_${uuid()}`;
      const newEmbeddingsRecords: Record<string, Record<string, number[]>> = {};
      newEmbeddingsRecords[newLocalStorageKey] = {};
      setEmbeddingsRecords(newEmbeddingsRecords);
      localStorageStore(newLocalStorageKey, JSON.stringify({}));
      return;
    }

    embeddingLocalStorageKeys.forEach((key) => {
      const storedEmbeddings = localStorageGet(key);
      if (!storedEmbeddings) {
        localStorageClear(key);
        return;
      }
      try {
        const storedEmbeddingsData: Record<string, number[]> =
          JSON.parse(storedEmbeddings);
        validate(storedEmbeddingsData, storedEmbeddingsSchema);
        setEmbeddingsRecords((prevValue) => {
          prevValue[key] = storedEmbeddingsData;
          return prevValue;
        });
      } catch (err) {
        console.error(
          `Incorrectly stored embeddings for key ${key}, clearing out`,
          err,
          storedEmbeddings
        );
        localStorageClear(key);
      }
    });
  }

  useEffect(() => {
    checkForAlreadyStoredEmbeddings();
  }, []);

  function saveNewEmbeddings(embeddings: Record<string, number[]>) {
    // TODO: add to any record in the state that does not have > 300 embeddings stored in it
    // Whatever record gets updated, make sure to also store data back into local storage so it's all up to date
    const alreadySavedEmbeddings = getSavedEmbeddings();
    const alreadySavedEmbeddingsQuestionKeys = Object.keys(
      alreadySavedEmbeddings
    );
    // Note: There should always be atleast one local storage key since the onCreate useEffect creates 1 if 1 does not exist

    // Filter out already saved embeddings
    const embeddingsToSave = Object.keys(embeddings).reduce(
      (finalRecord: Record<string, number[]>, key) => {
        if (!(key in alreadySavedEmbeddingsQuestionKeys)) {
          finalRecord[key] = embeddings[key];
        }
        return finalRecord;
      },
      {}
    );
    const questionKeysToSave = Object.keys(embeddingsToSave);

    // Find proper storage to put the embeddings in
    const copiedEmbeddingRecords: Record<
      string,
      Record<string, number[]>
    > = JSON.parse(JSON.stringify(embeddingsRecords));
    const locallyStoredEmbeddingKeys = Object.keys(copiedEmbeddingRecords);

    questionKeysToSave.forEach((keyToSave) => {
      const valueToSave = embeddingsToSave[keyToSave];
      let saved = false;
      for (let i = 0; i < locallyStoredEmbeddingKeys.length; i++) {
        const savedEmbeddingRecordKey = locallyStoredEmbeddingKeys[i];
        const savedEmbeddingRecord =
          copiedEmbeddingRecords[savedEmbeddingRecordKey];
        const numberOfStoredEmbeddings =
          Object.keys(savedEmbeddingRecord).length;
        if (numberOfStoredEmbeddings < 300) {
          saved = true;
          copiedEmbeddingRecords[savedEmbeddingRecordKey][keyToSave] =
            valueToSave;
        }
      }
      if (!saved) {
        copiedEmbeddingRecords[`${LOCAL_STORAGE_NAME}_${uuid()}`] = {
          keyToSave: valueToSave,
        };
      }
    });

    setEmbeddingsRecords(copiedEmbeddingRecords);
    saveAllRecordsToLocalStorage(copiedEmbeddingRecords);
  }

  function saveAllRecordsToLocalStorage(
    records: Record<string, Record<string, number[]>>
  ) {
    const recordKeys = Object.keys(records);
    recordKeys.forEach((key) => {
      localStorageStore(key, JSON.stringify(records[key]));
    });
  }

  function getSavedEmbeddings() {
    const mergedRecords: Record<string, number[]> = Object.keys(
      embeddingsRecords
    ).reduce((finalRecord: Record<string, number[]>, key) => {
      const curRecord = embeddingsRecords[key];
      Object.keys(curRecord).forEach((curRecordKey) => {
        finalRecord[curRecordKey] = curRecord[curRecordKey];
      });
      return finalRecord;
    }, {});

    return mergedRecords;
  }

  return {
    getSavedEmbeddings,
    saveNewEmbeddings,
  };
}
