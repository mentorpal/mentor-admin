/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
// Using IndexedDB

import { useEffect } from "react";
import setupIndexedDB, { useIndexedDBStore } from "use-indexeddb";

export interface UseWithLocalStoredEmbeddings {
  getSavedEmbeddings: () => Promise<Record<string, number[]>>;
  saveNewEmbeddings: (embeddings: Record<string, number[]>) => void;
}

// Database Configuration
const idbConfig = {
  databaseName: "embeddings-db",
  version: 1,
  stores: [
    {
      name: "embeddings",
      id: { keyPath: "question" },
      indices: [
        { name: "question", keyPath: "question", options: { unique: true } },
        { name: "embedding", keyPath: "embedding" },
        { name: "lastUsed", keyPath: "lastUsed" },
      ],
    },
  ],
};

interface DBEntry {
  question: string;
  embedding: number[];
  lastUsed: number;
}

const MAX_STORED_EMBEDDINGS = 2000;

export function useWithLocalStoredEmbeddings(): UseWithLocalStoredEmbeddings {
  const { add, getOneByKey, getAll, update, deleteByID } =
    useIndexedDBStore<DBEntry>("embeddings");

  const saveNewEmbeddings = async (embeddings: Record<string, number[]>) => {
    const epochNow = Date.now();
    const keys = Object.keys(embeddings);
    const _existingValues = await Promise.all(
      keys.map((key) => getOneByKey("question", key))
    );
    //remove undefined
    const existingValues = _existingValues.filter((val) => Boolean(val));

    // All found existing values get their lastUsed updated
    await Promise.all(
      existingValues.map((existingValue) => {
        update({ ...existingValue, lastUsed: epochNow });
      })
    );

    const keysToAdd = keys.filter((key) => {
      return !existingValues.find(
        (existingValue) => existingValue.question === key
      );
    });
    await Promise.all(
      keysToAdd.map((key) => {
        add({
          question: key,
          embedding: embeddings[key],
          lastUsed: epochNow,
        }).catch((err) => {
          console.error(
            `Failed to add question:embedding to db: ${key} : ${embeddings[key]}`,
            err
          );
        });
      })
    );
    removeLRUKeys();
  };

  const removeLRUKeys = async () => {
    const values = await getAll();
    if (values.length <= MAX_STORED_EMBEDDINGS) {
      return;
    }
    values.sort((v1, v2) => (v1.lastUsed > v2.lastUsed ? -1 : 1)); //put LRU at bottom
    const valuesToRemove = values.slice(2000);
    await Promise.all(
      valuesToRemove.map((value) => {
        deleteByID(value.question).catch((err) => {
          console.error(
            `Failed to do delete ${value.question} from indexedDB`,
            err
          );
        });
      })
    );
  };

  const getSavedEmbeddings = async (): Promise<Record<string, number[]>> => {
    const values = await getAll();
    const recordToReturn = values.reduce(
      (record: Record<string, number[]>, cur) => {
        record[cur.question] = cur.embedding;
        return record;
      },
      {}
    );
    return recordToReturn;
  };

  useEffect(() => {
    setupIndexedDB(idbConfig)
      .then(() => console.log("success"))
      .catch((err) => console.error("error/unsupported", err));
  }, []);

  return {
    saveNewEmbeddings,
    getSavedEmbeddings,
  };
}
