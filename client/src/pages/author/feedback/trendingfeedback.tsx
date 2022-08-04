
import { BinCollection, Edge, UserQuestion, UserQuestionBin } from "types";





function sortByTrending (
  filteredFeedback: Edge<UserQuestion>[],
  binCollection: BinCollection
) {

  // FILTER old userQue from bins
  binCollection.bins.forEach((a) => {
    // if it has graderasnwer or has been used to create question?
    a.userQuestions.forEach((b) => {
      if (b.graderAnswer){
        // remove it from bin
        a.userQuestions.splice(a.userQuestions.indexOf(b));
        //reclac average embedding of bin
 
      }
    });
  });

  // take each userQuestion
  filteredFeedback.map((row, i) => {
    // if created more recently than bins' lastupdated => add to bins
    if (row.node.createdAt > binCollection.lastUpdated) {
        // update date 
        binCollection.lastUpdated = row.node.createdAt;



        // add userQue: 
        // calculate cosine similarity 
        const similarity = ;
        if (similarity > 0.9) {
          // add to bin & recalc
          

        }
        else {

        }



        
    }
  });

  function findMatchingBin(bins: UserQuestionBin[]){
    
    

    // return a bin
  }

  // output
  






  // Create array of "bins" 
  // in state 
    // create an interface in Types? 
    // each bin contains: 
      //array of userQuestions
      //average embedding
  // For every new UserQuestion: 
    // check if cosine similarity is above threshold 
    // if its the firt userQue, what am I comparing to exactly
    // true : add to bin & recalcuate average embedding
    // false : add to a new bin 
    // do I need to store the cosine similarity for each user question in order to recalc 
  // Return 
    // take 1 UserQuestion from each bin 
    // sort them based on a weighted function


    // Questions:
    // Best way to feed in UserQuestions? 
    // Avoid: process of creation of bins OR filtering the bins
}