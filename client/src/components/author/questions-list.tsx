/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useState } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "react-beautiful-dnd";
import { v4 as uuid } from "uuid";
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
  Collapse,
  ListSubheader,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import ClearOutlinedIcon from "@material-ui/icons/ClearOutlined";
import DeleteIcon from "@material-ui/icons/Delete";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

import { QuestionType, Subject, Category, Topic, SubjectQuestion } from "types";
import ParaphraseList from "components/author/paraphrase-list";
import TopicsList from "components/author/question-topics-list";

export function QuestionEditCard(props: {
  classes: any;
  subject: Subject;
  question: SubjectQuestion | undefined;
  updateQuestion: (val: SubjectQuestion) => void;
  onDeselect: () => void;
}) {
  const { classes, subject, question, updateQuestion, onDeselect } = props;
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
      <FormControl style={{ width: "100%" }}>
        <InputLabel>Question Type</InputLabel>
        <Select
          id="select-type"
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
          <MenuItem id="question" value={QuestionType.QUESTION}>
            {QuestionType.QUESTION}
          </MenuItem>
          <MenuItem id="utterance" value={QuestionType.UTTERANCE}>
            {QuestionType.UTTERANCE}
          </MenuItem>
        </Select>
      </FormControl>
      <TextField
        label="Tag"
        placeholder="Additional tag for question, e.g. _IDLE_"
        variant="outlined"
        fullWidth
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
      />
      <TopicsList
        classes={classes}
        subject={subject}
        topics={question.topics}
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

export function QuestionListItem(props: {
  isSelected: boolean;
  question: SubjectQuestion;
  updateQuestion: (newVal: SubjectQuestion) => void;
  removeQuestion: (val: SubjectQuestion) => void;
  selectQuestion: (val: SubjectQuestion) => void;
  deselectQuestion: () => void;
}) {
  const {
    question,
    isSelected,
    updateQuestion,
    removeQuestion,
    selectQuestion,
    deselectQuestion,
  } = props;
  return (
    <Card
      elevation={0}
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
          value={question.question.question}
          onChange={(e) =>
            updateQuestion({
              ...question,
              question: { ...question.question, question: e.target.value },
            })
          }
          onFocus={() => selectQuestion(question)}
        />
        <CardActions>
          <IconButton
            id="delete"
            size="small"
            onClick={() => removeQuestion(question)}
          >
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

export function CategoryListItem(props: {
  subject: Subject;
  category: Category;
  selectedQuestion: string | undefined;
  removeCategory: (val: Category) => void;
  updateCategory: (newVal: Category) => void;
  updateQuestion: (newVal: SubjectQuestion) => void;
  removeQuestion: (val: SubjectQuestion) => void;
  selectQuestion: (val: SubjectQuestion) => void;
  deselectQuestion: () => void;
}): JSX.Element {
  const {
    subject,
    category,
    selectedQuestion,
    removeCategory,
    updateCategory,
    updateQuestion,
    removeQuestion,
    selectQuestion,
    deselectQuestion,
  } = props;
  const [expanded, setExpanded] = useState(true);
  const questions = subject.questions.filter(
    (q) => q.category?.id === category.id
  );

  return (
    <Card style={{ width: "100%" }}>
      <CardContent>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <TextField
            fullWidth
            variant="outlined"
            label="Category"
            placeholder="New category"
            value={category.name}
            onChange={(e) =>
              updateCategory({ ...category, name: e.target.value })
            }
            InputLabelProps={{
              shrink: true,
            }}
          />
          <CardActions>
            <IconButton
              size="small"
              color="secondary"
              onClick={() => setExpanded(!expanded)}
            >
              {questions.length}
              <ExpandMoreIcon
                style={{
                  transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => removeCategory(category)}
              style={{ padding: 0, marginLeft: 10 }}
            >
              <DeleteIcon />
            </IconButton>
          </CardActions>
        </div>
        <Collapse
          in={expanded}
          timeout="auto"
          unmountOnExit
          style={{ marginTop: 25 }}
        >
          <TextField
            fullWidth
            variant="outlined"
            label="Description"
            value={category.description}
            onChange={(e) =>
              updateCategory({ ...category, description: e.target.value })
            }
            InputLabelProps={{
              shrink: true,
            }}
          />
          <Droppable droppableId={`category-${category.id}`}>
            {(provided, snapshot) => (
              <List {...provided.droppableProps} ref={provided.innerRef}>
                <ListSubheader>Questions</ListSubheader>
                {questions.map((question, j) => (
                  <Draggable
                    key={`category-question-${question.question._id}`}
                    draggableId={`category-question-${question.question._id}`}
                    index={j}
                  >
                    {(provided, snapshot) => (
                      <ListItem
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <QuestionListItem
                          question={question}
                          isSelected={
                            selectedQuestion === question.question._id
                          }
                          updateQuestion={updateQuestion}
                          removeQuestion={removeQuestion}
                          selectQuestion={selectQuestion}
                          deselectQuestion={deselectQuestion}
                        />
                      </ListItem>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </List>
            )}
          </Droppable>
        </Collapse>
      </CardContent>
    </Card>
  );
}

export function QuestionsList(props: {
  classes: any;
  subject: Subject;
  maxHeight: number;
  expanded: boolean;
  toggleExpanded: () => void;
  updateQuestions: (val: SubjectQuestion[]) => void;
  updateCategories: (val: Category[]) => void;
}): JSX.Element {
  const {
    classes,
    subject,
    maxHeight,
    expanded,
    toggleExpanded,
    updateQuestions,
    updateCategories,
  } = props;
  const [selectedQuestion, setSelectedQuestion] = useState<string>();
  const categories = subject.categories || [];
  const questions = subject.questions || [];
  const uncategorizedQuestions =
    subject.questions.filter((q) => !q.category) || [];

  function addCategory() {
    updateCategories([
      ...categories,
      {
        id: uuid(),
        name: "",
        description: "",
      },
    ]);
  }

  function updateCategory(val: Category) {
    const idx = categories.findIndex((c) => c.id === val.id);
    if (idx !== -1) {
      categories[idx] = val;
      updateCategories([...categories]);
    }
  }

  function removeCategory(val: Category) {
    const idx = categories.findIndex((c) => c.id === val.id);
    if (idx !== -1) {
      categories.splice(idx, 1);
      updateCategories([...categories]);
    }
    updateQuestions([
      ...questions.map((q) => {
        if (q.category?.id === val.id) {
          return {
            ...q,
            category: undefined,
          };
        }
        return q;
      }),
    ]);
  }

  function addQuestion() {
    updateQuestions([
      ...questions,
      {
        question: {
          _id: uuid(),
          question: "",
          paraphrases: [],
          type: QuestionType.QUESTION,
          name: "",
        },
        category: undefined,
        topics: [],
      },
    ]);
  }

  function updateQuestion(val: SubjectQuestion) {
    const idx = questions.findIndex((q) => q.question._id === val.question._id);
    if (idx !== -1) {
      questions[idx] = val;
      updateQuestions([...questions]);
    }
  }

  function removeQuestion(toRemove: SubjectQuestion) {
    const idx = questions.findIndex(
      (q) => q.question._id === toRemove.question._id
    );
    if (idx !== -1) {
      questions.splice(idx, 1);
      updateQuestions([...questions]);
    }
  }

  function selectQuestion(val?: SubjectQuestion) {
    setSelectedQuestion(val?.question._id || undefined);
  }

  function onDragEnd(result: DropResult) {
    if (!result.destination) {
      return;
    }
    // re-ordering questions in question list
    if (
      result.draggableId.startsWith("question") &&
      result.destination.droppableId === "questions"
    ) {
      const qIdx1 = questions.findIndex(
        (q) => q.question._id === result.draggableId.replace("question-", "")
      );
      const qIdx2 = questions.findIndex(
        (q) =>
          q.question._id ===
          uncategorizedQuestions[result.destination!.index].question._id
      );
      const [removed] = questions.splice(qIdx1, 1);
      questions.splice(qIdx2, 0, removed);
      updateQuestions([...questions]);
    }
    // added question in questions list to a category
    if (
      result.draggableId.startsWith("question") &&
      result.destination.droppableId.startsWith("category")
    ) {
      const questionIdx = questions.findIndex(
        (q) => q.question._id === result.draggableId.replace("question-", "")
      );
      const categoryIdx = categories.findIndex(
        (c) => c.id === result.destination!.droppableId.replace("category-", "")
      );
      questions[questionIdx].category = categories[categoryIdx];
      updateQuestions([...questions]);
    }
    // removed question from category list to question list
    if (
      result.draggableId.startsWith("category-question") &&
      result.destination.droppableId === "questions"
    ) {
      const questionIdx = questions.findIndex(
        (q) =>
          q.question._id ===
          result.draggableId.replace("category-question-", "")
      );
      questions[questionIdx].category = undefined;
      updateQuestions([...questions]);
    }
    // moved question in category list to another category
    if (
      result.draggableId.startsWith("category-question") &&
      result.destination.droppableId.startsWith("category")
    ) {
      const questionIdx = questions.findIndex(
        (q) =>
          q.question._id ===
          result.draggableId.replace("category-question-", "")
      );
      const categoryIdx = categories.findIndex(
        (c) => c.id === result.destination!.droppableId.replace("category-", "")
      );
      questions[questionIdx].category = categories[categoryIdx];
      updateQuestions([...questions]);
    }
  }

  return (
    <Card
      elevation={0}
      className={classes.flexChild}
      style={{ textAlign: "left" }}
    >
      <div
        style={{ display: "flex", flexDirection: "row", alignItems: "center" }}
      >
        <IconButton
          id="expand"
          size="small"
          aria-expanded={expanded}
          onClick={toggleExpanded}
        >
          <ExpandMoreIcon
            style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        </IconButton>
        <Typography variant="body2">Questions</Typography>
      </div>
      <CardContent style={{ padding: 0 }}>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Grid
            container
            style={{
              display: "flex",
              flexDirection: "row",
            }}
          >
            <Grid
              item
              xs={selectedQuestion ? 6 : 12}
              style={{
                maxHeight: maxHeight - 70,
                overflow: "auto",
              }}
            >
              <DragDropContext onDragEnd={onDragEnd}>
                <List id="categories" className={classes.list}>
                  {categories.map((category, i) => (
                    <ListItem>
                      <CategoryListItem
                        subject={subject}
                        category={category}
                        selectedQuestion={selectedQuestion}
                        removeCategory={removeCategory}
                        updateCategory={updateCategory}
                        updateQuestion={updateQuestion}
                        removeQuestion={removeQuestion}
                        selectQuestion={selectQuestion}
                        deselectQuestion={() => {
                          selectQuestion(undefined);
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
                <Droppable droppableId="questions">
                  {(provided, snapshot) => (
                    <List
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={classes.list}
                    >
                      {uncategorizedQuestions.map((q, i) => (
                        <Draggable
                          key={`question-${q.question._id}`}
                          draggableId={`question-${q.question._id}`}
                          index={i}
                        >
                          {(provided, snapshot) => (
                            <ListItem
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <QuestionListItem
                                question={q}
                                isSelected={selectedQuestion === q.question._id}
                                updateQuestion={updateQuestion}
                                removeQuestion={removeQuestion}
                                selectQuestion={selectQuestion}
                                deselectQuestion={() => {
                                  selectQuestion(undefined);
                                }}
                              />
                            </ListItem>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </List>
                  )}
                </Droppable>
              </DragDropContext>
            </Grid>
            {selectedQuestion ? (
              <Grid
                item
                xs={6}
                style={{
                  overflow: "auto",
                  maxHeight: maxHeight - 70,
                }}
              >
                <QuestionEditCard
                  classes={classes}
                  subject={subject}
                  question={questions.find(
                    (q) => q.question._id === selectedQuestion
                  )}
                  updateQuestion={updateQuestion}
                  onDeselect={() => {
                    selectQuestion(undefined);
                  }}
                />
              </Grid>
            ) : undefined}
          </Grid>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Button
              id="add-question"
              color="primary"
              variant="outlined"
              startIcon={<AddIcon />}
              className={classes.button}
              onClick={addQuestion}
            >
              Add Question
            </Button>
            <Button
              id="add-category"
              variant="outlined"
              startIcon={<AddIcon />}
              className={classes.button}
              onClick={addCategory}
            >
              Add Category
            </Button>
          </div>
        </Collapse>
      </CardContent>
    </Card>
  );
}

export default QuestionsList;
