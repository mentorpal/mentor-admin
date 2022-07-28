/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { Recommendation } from "./recommender";

class WeightedRecommendation {
  rec: Recommendation;
  weight: number;

  constructor(rec: Recommendation, weight: number) {
    this.rec = rec;
    this.weight = weight;
  }
}

/**************
 PRIORITY QUEUE
 **************/

export class PriorityQueue {
  priorityQueue: WeightedRecommendation[];

  constructor() {
    this.priorityQueue = [];
  }

  //adds to queue depending on the weight
  public enqueue(rec: Recommendation, weight: number) {
    const adding = new WeightedRecommendation(rec, weight);
    let stop = false;

    for (let i = 0; i < this.priorityQueue.length; i++) {
      if (this.priorityQueue[i].weight > weight) {
        this.priorityQueue.splice(i, 0, adding);
        stop = true;
        break;
      }
    }

    if (!stop) {
      this.priorityQueue.push(adding);
    }
  }

  //deletes from the front of the queue
  public dequeue() {
    if (this.priorityQueue.length != 0) {
      this.priorityQueue.shift();
    }
  }

  //returns first recommendation of priority queue
  public getFirstRec() {
    if (this.priorityQueue.length != 0) {
      return this.priorityQueue[0];
    }
  }

  public getQueue(): WeightedRecommendation[] {
    return this.priorityQueue;
  }
}
