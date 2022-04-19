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
  Grid,
} from "@material-ui/core";
import ClearOutlinedIcon from "@material-ui/icons/ClearOutlined";
import {
  QuestionType,
  Topic,
  MentorType,
  UtteranceName,
  SubjectTypes,
} from "types";
import ParaphraseList from "components/author/question-paraphrase-list";
import TopicsList from "components/author/question-topics-list";
import { SubjectQuestionGQL } from "types-gql";

export function QuestionEditCard(props: {
  subjectType: SubjectTypes;
  classes: Record<string, string>;
  question?: SubjectQuestionGQL;
  topics: Topic[];
  updateQuestion: (val: SubjectQuestionGQL) => void;
  onDeselect: () => void;
}): JSX.Element {
  const { classes, question, subjectType } = props;
  if (!question) {
    return <div />;
  }
  const isUtteranceSubject = subjectType === SubjectTypes.UTTERANCES;
  return (
    <div data-cy="edit-question" style={{ padding: 20 }}>
      <CardHeader
        action={
          <Button onClick={props.onDeselect} startIcon={<ClearOutlinedIcon />}>
            Close Details
          </Button>
        }
      />
      <Grid container spacing={3}>
        <Grid
          item
          xs={question.question.type === QuestionType.UTTERANCE ? 6 : 12}
        >
          <FormControl variant="outlined" fullWidth>
            <InputLabel>Question Type</InputLabel>
            <Select
              disabled={isUtteranceSubject}
              data-cy="select-type"
              label="Question Type"
              value={question.question.type}
              cy-value={question.question.type}
              onChange={(
                event: React.ChangeEvent<{ value: unknown; name?: unknown }>
              ) =>
                props.updateQuestion({
                  ...question,
                  question: {
                    ...question.question,
                    type: event.target.value as QuestionType,
                  },
                })
              }
            >
              <MenuItem data-cy="question-type" value={QuestionType.QUESTION}>
                Question
              </MenuItem>
              <MenuItem data-cy="utterance-type" value={QuestionType.UTTERANCE}>
                Utterance
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>
        {question.question.type === QuestionType.UTTERANCE ? (
          <Grid item xs={6}>
            <FormControl variant="outlined" fullWidth>
              <InputLabel>Utterance Type</InputLabel>
              <Select
                data-cy="select-name"
                label="Utterance Type"
                value={question.question.name}
                cy-value={question.question.name}
                onChange={(
                  event: React.ChangeEvent<{ value: unknown; name?: unknown }>
                ) =>
                  props.updateQuestion({
                    ...question,
                    question: {
                      ...question.question,
                      name: event.target.value as UtteranceName,
                    },
                  })
                }
              >
                <MenuItem data-cy="none" value={undefined}>
                  Not specified
                </MenuItem>
                {Object.entries(UtteranceName).map((kv) => (
                  <MenuItem data-cy={`${kv[0]}-name`} value={kv[1]} key={kv[0]}>
                    {kv[0]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        ) : undefined}
      </Grid>
      <Grid container spacing={3}>
        <Grid
          item
          xs={question.question.mentorType === MentorType.VIDEO ? 6 : 12}
        >
          <FormControl variant="outlined" fullWidth>
            <InputLabel>Mentor Type</InputLabel>
            <Select
              data-cy="select-mentor-type"
              label="Mentor Type"
              value={question.question.mentorType}
              cy-value={question.question.mentorType}
              onChange={(
                event: React.ChangeEvent<{ value: unknown; name?: unknown }>
              ) =>
                props.updateQuestion({
                  ...question,
                  question: {
                    ...question.question,
                    mentorType: event.target.value as MentorType,
                  },
                })
              }
            >
              <MenuItem data-cy="none-mentor-type" value={undefined}>
                Not specified
              </MenuItem>
              <MenuItem data-cy="chat-mentor-type" value={MentorType.CHAT}>
                Chat only
              </MenuItem>
              <MenuItem data-cy="video-mentor-type" value={MentorType.VIDEO}>
                Video only
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>
        {question.question.mentorType === MentorType.VIDEO ? (
          <Grid item xs={6}>
            <TextField
              data-cy="video-length"
              label="Min Video Length"
              type="number"
              variant="outlined"
              fullWidth
              disabled={question.question.mentorType !== MentorType.VIDEO}
              value={question.question.minVideoLength}
              onChange={(e) => {
                props.updateQuestion({
                  ...question,
                  question: {
                    ...question.question,
                    minVideoLength: parseInt(e.target.value),
                  },
                });
              }}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
        ) : undefined}
      </Grid>
      {!isUtteranceSubject ? (
        <TopicsList
          classes={classes}
          allTopics={props.topics}
          questionTopics={question.topics.filter((t) =>
            props.topics.map((t) => t.id).includes(t.id)
          )}
          updateTopics={(t: Topic[]) =>
            props.updateQuestion({ ...question, topics: t })
          }
        />
      ) : undefined}
      <ParaphraseList
        classes={classes}
        paraphrases={question.question.paraphrases}
        updateParaphrases={(p: string[]) =>
          props.updateQuestion({
            ...question,
            question: { ...question.question, paraphrases: p },
          })
        }
      />
    </div>
  );
}

export default QuestionEditCard;
