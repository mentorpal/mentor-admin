/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import {
  Button,
  TextField,
  Select,
  MenuItem,
  CardHeader,
  FormControl,
  InputLabel,
} from "@material-ui/core";
import ClearOutlinedIcon from "@material-ui/icons/ClearOutlined";
import { QuestionType, Topic, SubjectQuestion } from "types";
import ParaphraseList from "components/author/question-paraphrase-list";
import TopicsList from "components/author/question-topics-list";

export default function QuestionEditCard(props: {
  classes: Record<string, string>;
  question: SubjectQuestion | undefined;
  topics: Topic[];
  updateQuestion: (val: SubjectQuestion) => void;
  onDeselect: () => void;
}): JSX.Element {
  const { classes, question, topics, onDeselect, updateQuestion } = props;
  if (!question) {
    return <div />;
  }
  const topicIds = topics.map((t) => t.id);
  return (
    <div data-cy="edit-question" style={{ padding: 20 }}>
      <CardHeader
        action={
          <Button onClick={onDeselect} startIcon={<ClearOutlinedIcon />}>
            Close Details
          </Button>
        }
      />
      <FormControl style={{ width: "100%" }}>
        <InputLabel>Question Type</InputLabel>
        <Select
          data-cy="select-type"
          value={question.question.type}
          onChange={(
            event: React.ChangeEvent<{ value: unknown; name?: unknown }>
          ) => {
            updateQuestion({
              ...question,
              question: {
                ...question.question,
                type: event.target.value as QuestionType,
              },
            });
          }}
        >
          <MenuItem data-cy="question-type" value={QuestionType.QUESTION}>
            {QuestionType.QUESTION}
          </MenuItem>
          <MenuItem data-cy="utterance" value={QuestionType.UTTERANCE}>
            {QuestionType.UTTERANCE}
          </MenuItem>
        </Select>
      </FormControl>
      <TextField
        data-cy="question-name"
        label="Tag"
        placeholder="Additional tag for question, e.g. _IDLE_"
        variant="outlined"
        value={question.question.name}
        onChange={(e) =>
          updateQuestion({
            ...question,
            question: { ...question.question, name: e.target.value },
          })
        }
        InputLabelProps={{
          shrink: true,
        }}
        style={{ marginTop: 25 }}
        fullWidth
      />
      <TopicsList
        classes={classes}
        allTopics={topics}
        questionTopics={question.topics.filter((t) => topicIds.includes(t.id))}
        updateTopics={(t: Topic[]) =>
          updateQuestion({ ...question, topics: t })
        }
      />
      <ParaphraseList
        classes={classes}
        paraphrases={question.question.paraphrases}
        updateParaphrases={(p: string[]) =>
          updateQuestion({
            ...question,
            question: { ...question.question, paraphrases: p },
          })
        }
      />
    </div>
  );
}
