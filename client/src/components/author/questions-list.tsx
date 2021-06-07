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
import {
  List,
  ListItem,
  Button,
  Card,
  CardContent,
  Grid,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import { Category, SubjectQuestion, Topic } from "types";
import CategoryListItem from "./category-list-item";
import QuestionListItem from "./question-list-item";
import QuestionEditCard from "./question-edit";

export function QuestionsList(props: {
  classes: Record<string, string>;
  categories: Category[];
  topics: Topic[];
  questions: SubjectQuestion[];
  addCategory: () => void;
  editCategory: (val: Category) => void;
  removeCategory: (val: Category) => void;
  addQuestion: () => void;
  editQuestion: (val: SubjectQuestion) => void;
  removeQuestion: (val: SubjectQuestion) => void;
  moveQuestion: (
    toMove: string,
    moveTo: string | undefined,
    category: string | undefined
  ) => void;
}): JSX.Element {
  const { classes, questions } = props;
  const [selectedQuestion, setSelectedQuestion] = useState<string>();
  const uncategorizedQuestions = questions.filter((q) => !q.category) || [];

  function selectQuestion(val?: SubjectQuestion) {
    setSelectedQuestion(val?.question._id || undefined);
  }

  function onDragEnd(result: DropResult) {
    if (!result.destination) {
      return;
    }
    const questionId = result.draggableId
      .replace("category-", "")
      .replace("question-", "");
    const categoryId = result.destination.droppableId.startsWith("category")
      ? result.destination!.droppableId.replace("category-", "")
      : undefined;

    // re-ordering questions in question list
    if (
      result.draggableId.startsWith("question") &&
      result.destination.droppableId === "questions"
    ) {
      props.moveQuestion(
        questionId,
        uncategorizedQuestions[result.destination!.index].question._id,
        categoryId
      );
    }
    // removed question from category list to question list
    if (
      result.draggableId.startsWith("category-question") &&
      result.destination.droppableId === "questions"
    ) {
      props.moveQuestion(questionId, undefined, categoryId);
    }
    // added question in questions list to a category
    if (
      result.draggableId.startsWith("question") &&
      result.destination.droppableId.startsWith("category")
    ) {
      props.moveQuestion(questionId, undefined, categoryId);
    }
    // moved question in category list to another category
    if (
      result.draggableId.startsWith("category-question") &&
      result.destination.droppableId.startsWith("category")
    ) {
      props.moveQuestion(questionId, undefined, categoryId);
    }
  }

  return (
    <Card
      elevation={0}
      className={classes.flexChild}
      style={{ textAlign: "left" }}
    >
      <CardContent style={{ padding: 0 }}>
        <Grid
          container
          style={{
            display: "flex",
            flexDirection: "row",
          }}
        >
          <Grid item xs={selectedQuestion ? 6 : 12}>
            <DragDropContext onDragEnd={onDragEnd}>
              <List data-cy="categories" className={classes.list}>
                {props.categories.map((category, i) => (
                  <ListItem data-cy={`category-${i}`} key={category.id}>
                    <CategoryListItem
                      category={category}
                      questions={questions.filter(
                        (q) => q.category?.id === category.id
                      )}
                      selectedQuestion={selectedQuestion}
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
            <Grid item xs={6}>
              <QuestionEditCard
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
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Button
            data-cy="add-question"
            color="primary"
            variant="outlined"
            startIcon={<AddIcon />}
            className={classes.button}
            onClick={props.addQuestion}
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
      </CardContent>
    </Card>
  );
}

export default QuestionsList;
