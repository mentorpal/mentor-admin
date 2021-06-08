/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import React, { useState, useRef } from "react";
import { RecordingState } from "hooks/graphql/recording-reducer";
import { CurAnswerState } from "hooks/graphql/use-with-record-state";
import { useWithWindowSize } from "hooks/use-with-window-size";
import { NoEncryption } from "@material-ui/icons";
import ListItem from "./uploading-list-item";
import { Answer} from "types";

function UploadingView(props: {
  classes: Record<string, string>;
  curAnswer: CurAnswerState;
  answers: Answer[];
  recordState: RecordingState;
  disabled: boolean;
}): JSX.Element {
  const { width: windowWidth, height: windowHeight } = useWithWindowSize();
  const {
    classes,
    curAnswer,
    answers,
    recordState,
    disabled
  } = props;
  const [uploadCount, setUploadCount] = useState(0);

  function updateUploadCount(amount: number){
    if(uploadCount!=amount)
      setUploadCount(amount);
  }

  function produceList(){
    //When Answers has uploadStatusUrl available, the existence of this variable tells us that an
    //upload is in progress, so add it to the list.

    //When the 
    const uploadingItems = [];
    uploadingItems.push(<ListItem
      classes={classes}
      curAnswer={curAnswer}
      recordState={recordState}
      />);
    return(
      <ul style={{
        listStyleType: "none",
        padding: 0,
        margin: 0
      }}>
        {uploadingItems}
      </ul>
    )
  }

  const height = 150;
  const width = 300;
  return(
    <div
      data-cy="uploading-widget"
      style={{
      visibility: disabled ? "hidden" : "visible",
      position: "absolute",
      right:50,
      marginTop: 200,
      boxShadow: "1px 1px 1px 1px",
      width: width,
      height: height}}>
        <div 
        data-cy="uploading-widget-title"
        style={{
          width:"100%",
          height:height*.20,
          backgroundColor:"#303030",
          color:"white"}}>
            <div style={{paddingTop:height*.03}}>
          {recordState.isUploading ? "Uploading 1 item..." : "Uploading Complete"}
          </div>
        </div>
    {produceList()}
    </div>
  )
}

export default UploadingView;