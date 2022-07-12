/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/


class Recommender {

  // Ben's python pseudocode for the function
  // He said to treat x as a data token
  // class MyClass:
  //      _init_
  //           var1 = null
  //           var2 = null
  //        update(x)
  //            self.var1 = x['var1']
  //            self.var2 = x['var2']

  offTopicIncomplete: boolean;

  constructor(){
    this.offTopicIncomplete = true;
  }

  updateFromToken(x: Map<string, boolean>): void {
    this.offTopicIncomplete = x.get("offTopicIncomplete");
  }

}

class Phase {

  // check(s)
  // weights(s)

}

class ProductionRole {

}

