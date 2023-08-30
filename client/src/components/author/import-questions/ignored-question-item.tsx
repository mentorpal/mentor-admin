/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { IgnoredImportedQuestion } from "../questions-list";

export function IgnoredQuestionItem(props: {
  classes: Record<string, string>;
  question: IgnoredImportedQuestion;
}): JSX.Element {
  const { question } = props;

  return (
    <Card
      elevation={0}
      style={{
        width: "100%",
      }}
    >
      <CardContent
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-around",
        }}
      >
        <Typography style={{ alignSelf: "center", margin: "10px" }}>
          <span style={{ fontWeight: "bold" }}>Reason: </span>
          <span style={{ color: "red", fontWeight: "bold" }}>
            {question.question === question.existingQuestion.question.question
              ? "Question already exists"
              : "Paraphrase Match"}
          </span>
        </Typography>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-around",
          }}
        >
          <div
            data-cy="ignored-imported-question"
            style={{
              display: "flex",
              flexDirection: "column",
              width: "40%",
              border: "1px solid #ccc",
              borderRadius: 10,
              padding: "10px",
              height: "fit-content",
            }}
          >
            <Typography style={{ alignSelf: "center", marginBottom: "10px" }}>
              <span style={{ fontWeight: "bold" }}>Imported Question</span>
            </Typography>
            <Typography>
              <span style={{ fontWeight: "bold" }}>Question: </span>
              {question.question}
            </Typography>
            {question.paraphrases.length > 0 && (
              <Typography>
                <span style={{ fontWeight: "bold" }}>Paraphrases: </span>
                <ul>
                  {question.paraphrases.map((p) => {
                    return <li key={p}>{p}</li>;
                  })}
                </ul>
              </Typography>
            )}
          </div>

          <div
            data-cy="existing-question"
            style={{
              display: "flex",
              flexDirection: "column",
              width: "40%",
              border: "1px solid #ccc",
              borderRadius: 10,
              padding: "10px",
              height: "fit-content",
            }}
          >
            <Typography style={{ alignSelf: "center", marginBottom: "10px" }}>
              <span style={{ fontWeight: "bold" }}>Existing Question</span>
            </Typography>
            <Typography>
              <span style={{ fontWeight: "bold" }}>Question: </span>
              {question.existingQuestion.question.question}
            </Typography>
            {question.existingQuestion.question.paraphrases.length > 0 && (
              <Typography>
                <span style={{ fontWeight: "bold" }}>Paraphrases: </span>
                <ul>
                  {question.existingQuestion.question.paraphrases.map((p) => {
                    return <li key={p}>{p}</li>;
                  })}
                </ul>
              </Typography>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default IgnoredQuestionItem;
