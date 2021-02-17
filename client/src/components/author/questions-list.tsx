import clsx from "clsx";
import React, { useState } from "react";
import {
  Paper,
  Typography,
  List,
  ListItem,
  Button,
  Card,
  CardActions,
  CardContent,
  Collapse,
  IconButton,
  TextField,
  Select,
  MenuItem,
  Grid,
} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import AddIcon from "@material-ui/icons/Add";
import ClearOutlinedIcon from "@material-ui/icons/ClearOutlined";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

import { Question, QuestionType, Topic } from "types";
import ParaphraseList from "components/author/paraphrase-list";
import TopicsList from "components/author/topics-list";
import { fetchQuestions } from "api";

export function QuestionCard(props: {
  classes: any;
  question: Question;
  editQuestion: (val: Question) => void;
  removeQuestion: () => void;
}) {
  const { classes, question, editQuestion, removeQuestion } = props;
  const [expanded, setExpanded] = React.useState(false);

  return (
    <Card style={{ width: "100%" }}>
      <CardContent>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <TextField
            id="edit-question"
            label="Question"
            variant="outlined"
            fullWidth
            value={question.question || ""}
            onChange={(e) =>
              editQuestion({ ...question, question: e.target.value })
            }
          />
          <CardActions>
            <IconButton id="delete" size="small" onClick={removeQuestion}>
              <ClearOutlinedIcon />
            </IconButton>
            <IconButton
              id="expand"
              size="small"
              aria-expanded={expanded}
              className={clsx(classes.expand, {
                [classes.expandOpen]: expanded,
              })}
              onClick={() => setExpanded(!expanded)}
            >
              <ExpandMoreIcon />
            </IconButton>
          </CardActions>
        </div>
        <Collapse
          in={expanded}
          timeout="auto"
          unmountOnExit
          style={{ padding: 25, paddingRight: 25 }}
        >
          <Grid container spacing={3}>
            <Grid
              item
              xs={6}
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Typography>Question Type:</Typography>
              <Select
                id="select-type"
                value={question.type}
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
            </Grid>
            <Grid item xs={6}>
              <TextField
                id="edit-name"
                label="Tag"
                placeholder="Additional tag for question, e.g. _IDLE_"
                variant="outlined"
                fullWidth
                value={question.name || ""}
                onChange={(e) =>
                  editQuestion({ ...question, name: e.target.value })
                }
              />
            </Grid>
          </Grid>
          <TopicsList
            classes={classes}
            topics={question.topics}
            updateTopics={(t: Topic[]) =>
              editQuestion({ ...question, topics: t })
            }
          />
          <ParaphraseList
            classes={classes}
            paraphrases={question.paraphrases}
            updateParaphrases={(p: string[]) =>
              editQuestion({ ...question, paraphrases: p })
            }
          />
        </Collapse>
      </CardContent>
    </Card>
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

  const removeQuestion = (idx: number) => {
    questions.splice(idx, 1);
    updateQuestions([...questions]);
  };

  return (
    <Paper elevation={0} style={{ textAlign: "left" }}>
      <Typography variant="body2" style={{ padding: 15 }}>
        Questions
      </Typography>
      <List id="questions" className={classes.list}>
        {questions.map((q, i) => (
          <ListItem id={`question-${i}`}>
            <QuestionCard
              classes={classes}
              question={q}
              editQuestion={(val: Question) => {
                updateQuestion(val, i);
              }}
              removeQuestion={() => {
                removeQuestion(i);
              }}
            />
          </ListItem>
        ))}
      </List>
      <div style={{ display: "flex", flexDirection: "row" }}>
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
    </Paper>
  );
}

export default QuestionsList;
