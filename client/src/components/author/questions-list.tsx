/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect, useState } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "react-beautiful-dnd";
import {
  List,
  ListItem,
  Button,
  Grid,
  Typography,
  TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { Autocomplete } from "@mui/material";

import { Category, Question, SubjectTypes, Topic } from "types";
import CategoryListItem from "./category-list-item";
import QuestionListItem from "./question-list-item";
import QuestionEditCard from "./question-edit";
import { SubjectQuestionGQL } from "types-gql";
import { useWithQuestions } from "hooks/graphql/use-with-questions";
import { NewQuestionArgs } from "hooks/graphql/use-with-subject";
import { useWithWindowSize } from "hooks/use-with-window-size";
import { SearchParams } from "hooks/graphql/use-with-data-connection";

export function QuestionsList(props: {
  subjectType: SubjectTypes;
  classes: Record<string, string>;
  categories: Category[];
  topics: Topic[];
  questions: SubjectQuestionGQL[];
  addCategory: () => void;
  editCategory: (val: Category) => void;
  removeCategory: (val: Category) => void;
  addQuestion: (args?: NewQuestionArgs) => void;
  editQuestion: (val: SubjectQuestionGQL) => void;
  removeQuestion: (val: SubjectQuestionGQL) => void;
  moveQuestion: (toMove: string, moveTo: number, category?: string) => void;
}): JSX.Element {
  const { classes, questions, subjectType } = props;
  const [searchInput, setSearchInput] = useState<Question>();
  const [selectedQuestion, setSelectedQuestion] = useState<string>();
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);

  const uncategorizedQuestions = questions.filter((q) => !q.category) || [];
  const { height: windowHeight } = useWithWindowSize();
  const searchParams: SearchParams = {
    limit: 5000,
    cursor: "",
    sortBy: "",
    sortAscending: true,
    filter: {},
  };
  const { data, nextPage, isLoading } = useWithQuestions(searchParams);
  useEffect(() => {
    if (!data) {
      return;
    }
    const questionsFromCurPage = data.edges
      .map((e) => e.node)
      .filter((q) => !questions.map((sq) => sq.question._id).includes(q._id));
    if (questionsFromCurPage) {
      setAllQuestions(allQuestions.concat(questionsFromCurPage));
    }
    if (data.pageInfo.hasNextPage) {
      nextPage();
    }
  }, [data?.edges]);

  function selectQuestion(val?: SubjectQuestionGQL) {
    setSelectedQuestion(val?.question._id || undefined);
  }

  function onDragEnd(result: DropResult) {
    if (!result.destination) {
      return;
    }
    const questionId = result.draggableId
      .replace("category-", "")
      .replace("question-", "");
    const categoryId = result.destination.droppableId.startsWith("category-")
      ? result.destination.droppableId.replace("category-", "")
      : undefined;
    props.moveQuestion(questionId, result.destination.index, categoryId);
  }

  return (
    <div style={{ height: windowHeight - 250 }}>
      <Grid
        container
        style={{
          display: "flex",
          flexDirection: "row",
          height: windowHeight - 350,
          overflow: "auto",
        }}
      >
        <Grid item xs={selectedQuestion ? 6 : 12}>
          <DragDropContext onDragEnd={onDragEnd}>
            <List data-cy="categories" className={classes.list}>
              {props.categories.map((category, i) => (
                <ListItem
                  data-cy={`category-${i}`}
                  key={category.id}
                  onFocus={() => setSelectedCategory(category.id)}
                  onBlur={(e) => {
                    if (e.relatedTarget) {
                      const element = e.relatedTarget as Element;
                      if (element.getAttribute("data-cy") !== "add-question") {
                        setSelectedCategory(undefined);
                      }
                    } else {
                      setSelectedCategory(undefined);
                    }
                  }}
                >
                  <CategoryListItem
                    category={category}
                    questions={questions.filter(
                      (q) => q.category?.id === category.id
                    )}
                    selectedQuestion={selectedQuestion}
                    selectedCategory={selectedCategory}
                    removeCategory={props.removeCategory}
                    updateCategory={props.editCategory}
                    updateQuestion={props.editQuestion}
                    removeQuestion={props.removeQuestion}
                    selectQuestion={selectQuestion}
                    deselectQuestion={() => selectQuestion(undefined)}
                  />
                </ListItem>
              ))}
            </List>
            <Droppable droppableId="questions">
              {(provided) => (
                <List
                  data-cy="questions"
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
                      {(provided) => (
                        <ListItem
                          data-cy={`question-${i}`}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <QuestionListItem
                            question={q}
                            isSelected={selectedQuestion === q.question._id}
                            updateQuestion={props.editQuestion}
                            removeQuestion={props.removeQuestion}
                            selectQuestion={selectQuestion}
                            deselectQuestion={() => selectQuestion(undefined)}
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
            }}
          >
            <QuestionEditCard
              subjectType={subjectType}
              classes={classes}
              topics={props.topics}
              question={questions.find(
                (q) => q.question._id === selectedQuestion
              )}
              updateQuestion={props.editQuestion}
              onDeselect={() => selectQuestion(undefined)}
            />
          </Grid>
        ) : undefined}
      </Grid>
      <Autocomplete
        data-cy="select-question"
        options={allQuestions || []}
        disabled={isLoading}
        getOptionLabel={(option: Question) => option.question}
        onChange={(e, v) => {
          if (v) {
            setSearchInput(v);
          }
        }}
        style={{ minWidth: 300, flexGrow: 1, marginTop: 10 }}
        renderOption={(props, option) => (
          <Typography align="left">{option.question}</Typography>
        )}
        renderInput={(params) =>
          isLoading ? (
            <TextField {...params} label="Loading..." variant="outlined" />
          ) : (
            <TextField {...params} variant="outlined" />
          )
        }
      />
      <Button
        data-cy="add-question"
        color="primary"
        variant="outlined"
        startIcon={<AddIcon />}
        className={classes.button}
        onClick={() => {
          setSearchInput(undefined);
          props.addQuestion({
            question: searchInput,
            categoryId: selectedCategory,
          });
        }}
      >
        Add Question
      </Button>
      <Button
        data-cy="add-category"
        variant="outlined"
        startIcon={<AddIcon />}
        className={classes.button}
        onClick={props.addCategory}
      >
        Add Category
      </Button>
    </div>
  );
}

export default QuestionsList;
