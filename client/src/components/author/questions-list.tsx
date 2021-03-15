/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useState } from "react";
import {
  Typography,
  List,
  ListItem,
  Button,
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  Grid,
  CardActions,
  IconButton,
  CardHeader,
  FormControl,
  InputLabel,
} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import AddIcon from "@material-ui/icons/Add";
import ClearOutlinedIcon from "@material-ui/icons/ClearOutlined";
import DeleteIcon from "@material-ui/icons/Delete";

import { Question, QuestionType, Topic } from "types";
import ParaphraseList from "components/author/paraphrase-list";
import TopicsList from "components/author/topics-list";
import { fetchQuestions } from "api";

export function QuestionListItem(props: {
  question: Question;
  isSelected: boolean;
  editQuestion: (val: Question) => void;
  removeQuestion: () => void;
  selectQuestion: () => void;
  deselectQuestion: () => void;
}) {
  const {
    question,
    isSelected,
    editQuestion,
    removeQuestion,
    selectQuestion,
    deselectQuestion,
  } = props;
  return (
    <Card
      style={{
        width: "100%",
        backgroundColor: isSelected ? "#FFF8CD" : undefined,
      }}
    >
      <CardContent style={{ display: "flex", flexDirection: "row" }}>
        <TextField
          id="edit-question"
          label="Question"
          variant="outlined"
          fullWidth
          multiline
          value={question.question || ""}
          onChange={(e) =>
            editQuestion({ ...question, question: e.target.value })
          }
          onFocus={selectQuestion}
        />
        <CardActions>
          <IconButton id="delete" size="small" onClick={removeQuestion}>
            <DeleteIcon />
          </IconButton>
          {isSelected ? (
            <IconButton id="close" size="small" onClick={deselectQuestion}>
              <ClearOutlinedIcon />
            </IconButton>
          ) : undefined}
        </CardActions>
      </CardContent>
    </Card>
  );
}

export function QuestionEditCard(props: {
  classes: any;
  question: Question | null;
  editQuestion: (val: Question) => void;
  onDeselect: () => void;
}) {
  const { classes, question, editQuestion, onDeselect } = props;

  if (!question) {
    return <div></div>;
  }
  return (
    <div style={{ padding: 20 }}>
      <CardHeader
        action={
          <Button onClick={onDeselect} startIcon={<ClearOutlinedIcon />}>
            Close Details
          </Button>
        }
      />
      <div style={{ display: "flex", flexDirection: "row" }}>
        <FormControl style={{ width: 250, marginRight: 20 }}>
          <InputLabel>Question Type</InputLabel>
          <Select
            id="select-type"
            value={question?.type}
            style={{ flexGrow: 1, marginLeft: 10 }}
            onChange={(
              event: React.ChangeEvent<{ value: unknown; name?: unknown }>
            ) => {
              editQuestion({
                ...question,
                type: event.target.value as QuestionType,
              });
            }}
          >
            <MenuItem id="question" value={QuestionType.QUESTION}>
              {QuestionType.QUESTION}
            </MenuItem>
            <MenuItem id="utterance" value={QuestionType.UTTERANCE}>
              {QuestionType.UTTERANCE}
            </MenuItem>
          </Select>
        </FormControl>
        <TextField
          id="edit-name"
          label="Tag"
          placeholder="Additional tag for question, e.g. _IDLE_"
          variant="outlined"
          fullWidth
          value={question?.name || ""}
          onChange={(e) => editQuestion({ ...question, name: e.target.value })}
          style={{ flexGrow: 1 }}
        />
      </div>
      <TopicsList
        classes={classes}
        topics={question?.topics}
        updateTopics={(t: Topic[]) => editQuestion({ ...question, topics: t })}
      />
      <ParaphraseList
        classes={classes}
        paraphrases={question?.paraphrases}
        updateParaphrases={(p: string[]) =>
          editQuestion({ ...question, paraphrases: p })
        }
      />
    </div>
  );
}

export function QuestionsList(props: {
  classes: any;
  questions: Question[];
  updateQuestions: (val: Question[]) => void;
}): JSX.Element {
  const { classes, questions, updateQuestions } = props;
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [questionSearch, setQuestionSearch] = useState<Question>();
  const [selectedQuestion, setSelectedQuestion] = useState<number>(-1);

  React.useEffect(() => {
    fetchQuestions().then((q) => setAllQuestions(q.edges.map((e) => e.node)));
  }, []);

  function replaceItem<T>(a: Array<T>, index: number, item: T): Array<T> {
    const newArr = [...a];
    newArr[index] = item;
    return newArr;
  }

  function updateQuestion(val: Question, idx: number) {
    updateQuestions(
      replaceItem(questions, idx, {
        ...questions[idx],
        ...val,
      })
    );
  }

  function addQuestion(val?: Question) {
    updateQuestions([
      ...questions,
      {
        _id: val?._id || "",
        question: val?.question || "",
        topics: val?.topics || [],
        paraphrases: val?.paraphrases || [],
        type: val?.type || QuestionType.QUESTION,
        name: val?.name || "",
      },
    ]);
  }

  function removeQuestion(idx: number) {
    questions.splice(idx, 1);
    updateQuestions([...questions]);
  }

  function selectQuestion(idx: number) {
    setSelectedQuestion(idx);
  }

  const question = selectedQuestion !== -1 ? questions[selectedQuestion] : null;

  return (
    <Card
      elevation={0}
      className={classes.flexExpandChild}
      style={{ textAlign: "left" }}
    >
      <Typography variant="body2" style={{ flexShrink: 0, padding: 15 }}>
        Questions
      </Typography>
      <Grid
        container
        style={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "0",
        }}
      >
        <Grid
          item
          xs={question ? 5 : 12}
          style={{ flexGrow: 1, overflow: "auto", minHeight: "100%" }}
        >
          <List id="questions" className={classes.list}>
            {questions.map((q, i) => (
              <ListItem key={`question-${i}`} id={`question-${i}`}>
                <QuestionListItem
                  question={q}
                  isSelected={selectedQuestion === i}
                  editQuestion={(val: Question) => {
                    updateQuestion(val, i);
                  }}
                  removeQuestion={() => {
                    removeQuestion(i);
                  }}
                  selectQuestion={() => {
                    selectQuestion(i);
                  }}
                  deselectQuestion={() => {
                    selectQuestion(-1);
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Grid>
        {question ? (
          <Grid
            item
            xs={7}
            style={{ flexGrow: 1, overflow: "auto", minHeight: "0" }}
          >
            <QuestionEditCard
              classes={classes}
              question={question}
              editQuestion={(val: Question) => {
                updateQuestion(val, selectedQuestion!);
              }}
              onDeselect={() => {
                selectQuestion(-1);
              }}
            />
          </Grid>
        ) : undefined}
      </Grid>
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Autocomplete
          id="question-input"
          options={allQuestions}
          getOptionLabel={(option: Question) => option.question}
          onChange={(e, v) => {
            setQuestionSearch(v || undefined);
          }}
          style={{ width: "100%" }}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              placeholder="Choose an existing question to add?"
            />
          )}
        />
        <Button
          id="add-question"
          startIcon={<AddIcon />}
          className={classes.button}
          onClick={() => addQuestion(questionSearch)}
        >
          {questionSearch ? "Add Question" : "New Question"}
        </Button>
      </div>
    </Card>
  );
}

export default QuestionsList;
