/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import React, { useState, useEffect } from "react";
import { List, ListItem, ListItemText } from "@material-ui/core";
import { Card, Button, Checkbox } from "@material-ui/core";
import { copyAndSet } from "helpers";

function FollowUpQuestionsWidget(props: {
  //insert expected props here
  questions: string[];
  setRecordFollowUpQs: (b: boolean)=>void;
}): JSX.Element {
  const [seeAll, setSeeAll] = useState(false);
  const [questionList, setQuestionList] = useState<question[]>([]);
  const {questions, setRecordFollowUpQs} = props;

  useEffect(()=>{
    for(let i = 0; i < questionList.length; i++){
      if(questionList[i].checked){
        setRecordFollowUpQs(true);
        return;
      }
    }
    setRecordFollowUpQs(false);
  }, [questionList])

  interface question{
    question: string;
    checked: boolean;
  }

  function toggleQuestionCheck(i: number){
    setQuestionList(copyAndSet(questionList, i, {question: questionList[i].question, checked: !questionList[i].checked}))
  }

  if(questionList.length !== questions.length){
    const tempQuestionList = questions.map(question =>{
      return {question: question, checked: false}
    })
    setQuestionList(tempQuestionList);
  }
  const renderAmount = !seeAll ? 6 : questionList.length > 20 ? 20 : questionList.length
  return (
    <Card data-cy="follow-up-q-widget" style={{width:"100%",height:"100%"}}>
      <h3>
        Follow Up Questions
      </h3>
      <div> Pick 2-10 follow up questions that you&apos;d like to answer to improve your mentor. </div>
      <List style={{
        maxHeight:  seeAll ? "450px" : "160px",
        overflow: "scroll",
        overflowX: "hidden"}}>
            {questionList.slice(0,renderAmount).map((question, i)=>{
              return(
                <div key={i}>
                  <ListItem divider={true} dense={true} alignItems={"center"}>
                    <Checkbox onClick={()=>{toggleQuestionCheck(i)}} checked={question.checked}/>
                    <ListItemText primary={question.question} />
                  </ListItem>
                </div>
              )
            })} 
      </List>
      <Button 
        onClick={()=>{!seeAll ? setSeeAll(true) : setSeeAll(false)}}
        style={{textTransform: "none"}}>
          {!seeAll ? "See All" : "See Less"}
      </Button>
    </Card>
  );
}

export default FollowUpQuestionsWidget;
