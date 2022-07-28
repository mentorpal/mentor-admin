/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

export class WeightedObj {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  obj: any;
  weight: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(obj: any, weight: number) {
    this.obj = obj;
    this.weight = weight;
  }
}

/**************
 PRIORITY QUEUE
 **************/

export class PriorityQueue {
  priorityQueue: WeightedObj[];

  constructor() {
    this.priorityQueue = [];
  }

  //adds to queue depending on the weight
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public enqueue(obj: any, weight: number) {
    const adding = new WeightedObj(obj, weight);
    let stop = false;

    for (let i = 0; i < this.priorityQueue.length; i++) {
      if (this.priorityQueue[i].weight < weight) {
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

  //returns the queue
  public getQueue(): WeightedObj[] {
    return this.priorityQueue;
  }
}
