/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useState } from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";
import {
  List,
  ListItem,
  Card,
  CardContent,
  TextField,
  CardActions,
  IconButton,
  Collapse,
  ListSubheader,
  Autocomplete,
  ListItemText,
  ListItemSecondaryAction,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Category, Topic } from "types";
import QuestionListItem from "./question-list-item";
import { SubjectQuestionGQL } from "types-gql";
import { onTextInputChanged } from "helpers";

export function CategoryListItem(props: {
  category: Category;
  topics: Topic[];
  questions: SubjectQuestionGQL[];
  selectedQuestion?: string;
  selectedCategory?: string;
  removeCategory: (val: Category) => void;
  updateCategory: (newVal: Category) => void;
  updateQuestion: (newVal: SubjectQuestionGQL) => void;
  removeQuestion: (val: SubjectQuestionGQL) => void;
  selectQuestion: (val: SubjectQuestionGQL) => void;
  deselectQuestion: () => void;
}): JSX.Element {
  const {
    category,
    topics,
    questions,
    selectedQuestion,
    selectedCategory,
    removeCategory,
    updateCategory,
    updateQuestion,
    removeQuestion,
    selectQuestion,
    deselectQuestion,
  } = props;
  const [expanded, setExpanded] = useState(true);

  return (
    <Card
      style={{
        width: "100%",
        backgroundColor:
          category.id === selectedCategory ? "#FFF8CD" : undefined,
      }}
    >
      <CardContent>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <TextField
            fullWidth
            data-cy="category-name"
            variant="outlined"
            label="Category"
            placeholder="New category"
            value={category.name}
            onChange={(e) =>
              onTextInputChanged(e, () => {
                updateCategory({ ...category, name: e.target.value });
              })
            }
            InputLabelProps={{
              shrink: true,
            }}
          />
          <CardActions>
            <IconButton
              data-cy="toggle-category"
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
              data-cy="delete-category"
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
            data-cy="category-description"
            label="Description"
            value={category.description}
            onChange={(e) =>
              onTextInputChanged(e, () => {
                updateCategory({ ...category, description: e.target.value });
              })
            }
            InputLabelProps={{
              shrink: true,
            }}
          />
          <ListSubheader>Default Topics</ListSubheader>
          <Autocomplete
            data-cy="default-topic-input"
            options={topics.filter(
              (t) =>
                !category.defaultTopics.find((id) => id === t.id) &&
                !t.categoryParent
            )}
            getOptionLabel={(option: Topic) => option.name}
            onChange={(e, v) => {
              if (!v?.id) {
                return;
              }
              updateCategory({
                ...category,
                defaultTopics: [...category.defaultTopics, v.id],
              });
            }}
            style={{ width: "100%" }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                placeholder="Add a default topic"
              />
            )}
          />
          <List data-cy="default-topics-list">
            {category.defaultTopics.map((t, i) => {
              const topic = topics.find((topic) => topic.id === t);
              if (!topic) {
                return null;
              }
              const topicName =
                topic.categoryParent === category.id
                  ? `${category.name}`
                  : topic.name || "";
              return (
                <ListItem key={`topic-${i}`} data-cy={`topic-${i}`}>
                  <div>
                    <ListItemText
                      data-cy="topic-name"
                      data-test={topicName}
                      primary={topicName}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        data-cy="delete-topic"
                        edge="end"
                        size="small"
                        onClick={() => {
                          updateCategory({
                            ...category,
                            defaultTopics: category.defaultTopics.filter(
                              (topicId) => topicId !== topic.id
                            ),
                          });
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </div>
                </ListItem>
              );
            })}
          </List>
          <Droppable droppableId={`category-${category.id}`}>
            {(provided) => (
              <List
                data-cy="category-questions"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                <ListSubheader>Questions</ListSubheader>
                {questions.map((question, j) => (
                  <Draggable
                    key={`category-question-${question.question._id}`}
                    draggableId={`category-question-${question.question._id}`}
                    index={j}
                  >
                    {(provided) => (
                      <ListItem
                        data-cy={`category-question-${j}`}
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

export default CategoryListItem;
