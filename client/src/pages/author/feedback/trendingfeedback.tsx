import { Connection, UserQuestion } from "types";





function sortByTrending (props: {
  feedback: Connection<UserQuestion>
}) {
  // Create array of "bins" 
    // create an interface in Types? 
    // each bin contains: 
      //array of userQuestions
      //average embedding
  // For every new UserQuestion: 
    // check if cosine similarity is above threshold 
    // true : add to bin & recalcuate average embedding
    // false : add to a new bin 
  // Return 
    // take 1 UserQuestion from each bin 
    // sort them based on a weighted function




    // Questions:
    // Best way to feed in UserQuestions? 
    // Avoid: process of creation of bins OR filtering the bins
}