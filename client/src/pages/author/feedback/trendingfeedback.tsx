import { BinCollection, Edge, UserQuestion, UserQuestionBin } from "/types";

// Took first 3 functions from:
// https://github.com/thatsKevinJain/string-cosine-similarity
// altered it so functions don't compare just 2 string
// instead, it compares a string with the embedding in bins

// Split the string that contains any character
// other then alpha-numeric characters
// Convert string into array (Tokenize, toLowerCase)
function getTokens(question: string) {
  return question
    .split(/[^A-Za-z0-9]+/)
    .filter((a) => {
      if (!Number.isNaN(a)) {
        return false;
      } else {
        return true;
      }
    })
    .map((word) => {
      return word.toLowerCase();
    });
}

// Find Common words Frequency
function computeFrequency(question: string, userQuestionBin: UserQuestionBin) {
  const arr1 = getTokens(question);
  const commonWords = getTokens(userQuestionBin.userQuestions[0].question);
  // ^ perhaps make a bin attribute set to the first (or any?) userquestion that was put in bin???

  return commonWords.map((word) => {
    return arr1.reduce((f, element) => {
      if (element == word) {
        return (f += 1);
      } else {
        return (f += 0);
      }
    }, 0);
  });
}

function cosineSimilarity(question: string, userQuestionBin: UserQuestionBin) {
  // Word Frequency as Vector
  const v1 = computeFrequency(question, userQuestionBin);

  // Calculate Vector A.B (dot product v1.embedding)
  const dotProduct = v1.reduce((sum, f, index) => {
    return (sum += f * userQuestionBin.averageEmbedding[index]);
  }, 0);

  // Calculate ||a|| and ||b|| (absolute value of v1 & embedding)
  const absV1 = Math.sqrt(
    v1.reduce((sum, f) => {
      return (sum += f * f);
    }, 0)
  );
  const absEmbedding = Math.sqrt(
    userQuestionBin.averageEmbedding.reduce((sum, f) => {
      return (sum += f * f);
    }, 0)
  );

  // Cosine Similarity
  return dotProduct / (absV1 * absEmbedding);
}

// Find highest cosine similarity out of all bins
function findBestMatchBin(question: string, binCollection: BinCollection) {
  // iterate through all bins
  // calculate cosine similarity
  // keep track of the value closest to 1
  let bestMatchIndex = 0;
  let highestSimilarity = 0;
  for (let i = 0; i < binCollection.bins.length; i++) {
    if (highestSimilarity < cosineSimilarity(question, binCollection.bins[i])) {
      highestSimilarity = cosineSimilarity(question, binCollection.bins[i]);
      bestMatchIndex = i;
    }
  }
  // return cosine similarity closest to 1
  return binCollection.bins[bestMatchIndex];
}

function sortByTrending(
  filteredFeedback: Edge<UserQuestion>[],
  binCollection: BinCollection
) {
  if (!binCollection.bins) {
    /*function for first time creating bins*/
  } else {
    // FILTER: old userQue from bins before doing anything
    binCollection.bins.forEach((a) => {
      // if it has graderasnwer (has been manually mapped)
      a.userQuestions.forEach((b) => {
        if (b.graderAnswer) {
          // remove it from bin
          a.userQuestions.splice(a.userQuestions.indexOf(b));
          //reclac average embedding of bin
          /*create function that goes here*/
        }
      });
    });

    // UPDATE: check for any newer userQue
    filteredFeedback.map((row, i) => {
      // add to bins
      if (row.node.createdAt > binCollection.lastUpdated) {
        // update date
        binCollection.lastUpdated = row.node.createdAt;

        // calculate cosine similarity of userQue
        const bestMatchBin = findBestMatchBin(row.node.question, binCollection);
        const cosSimilarity = cosineSimilarity(row.node.question, bestMatchBin);
        // if above threshold add to existing bin
        if (cosSimilarity > 0.9) {
          bestMatchBin.userQuestions.push(row.node);
          //reclac average embedding of bin
          /*create function that goes here*/
        } else {
          // create new bin for it
          /*function for first time creating bins*/
        }
      }
    });
  }

  // return
  // 1 question from each bin?
  // sort them based on:
  // weighted avg of: 0.8*f(# in the bin) and 0.2*(1-e*(-c*1 + # days since asked))
}
