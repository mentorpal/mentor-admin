/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
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
import UploadIcon from "@mui/icons-material/Upload";
import { Autocomplete } from "@mui/material";
import Papa from "papaparse";
import {
  Category,
  Question,
  QuestionType,
  SubjectTypes,
  Topic,
  UtteranceName,
} from "types";
import CategoryListItem from "./category-list-item";
import QuestionListItem from "./question-list-item";
import QuestionEditCard from "./question-edit";
import { SubjectGQL, SubjectQuestionGQL } from "types-gql";
import { useWithQuestions } from "hooks/graphql/use-with-questions";
import { NewQuestionArgs } from "hooks/graphql/use-with-subject";
import { useWithWindowSize } from "hooks/use-with-window-size";
import { SearchParams } from "hooks/graphql/use-with-data-connection";
import ImportedQuestionItem from "./import-questions/imported-question-item";
import IgnoredQuestionItem from "./import-questions/ignored-question-item";

function ImportedQuestionsDisplay(props: {
  categories: Category[];
  topics: Topic[];
  editQuestion: (val: SubjectQuestionGQL) => void;
  removeQuestion: (val: SubjectQuestionGQL) => void;
  questionsAdded: SubjectQuestionGQL[];
  questionsIgnored: IgnoredImportedQuestion[];
  classes: Record<string, string>;
}): JSX.Element {
  const { classes, questionsAdded, questionsIgnored, categories, topics } =
    props;
  return (
    <>
      {questionsAdded.length > 0 ? (
        <>
          <Typography variant="h5" style={{ color: "green" }}>
            Successfully Imported Questions
          </Typography>
          <List
            data-cy="questions-added"
            className={classes.list}
            style={{ width: "100%" }}
          >
            {questionsAdded.map((q, i) => (
              <ListItem data-cy={`question-${i}`} key={q.question._id}>
                <ImportedQuestionItem
                  categories={categories}
                  classes={classes}
                  topics={topics}
                  question={q}
                  editQuestion={props.editQuestion}
                  removeQuestion={props.removeQuestion}
                />
              </ListItem>
            ))}
          </List>
        </>
      ) : undefined}

      {questionsIgnored.length > 0 ? (
        <>
          <Typography variant="h5" style={{ color: "red", marginTop: "50px" }}>
            Un-successful Imports
          </Typography>
          <List
            data-cy="questions-ignored"
            className={classes.list}
            style={{ width: "100%" }}
          >
            {questionsIgnored.map((q, i) => (
              <ListItem data-cy={`question-${i}`} key={q.question}>
                <IgnoredQuestionItem classes={classes} question={q} />
              </ListItem>
            ))}
          </List>
        </>
      ) : undefined}
    </>
  );
}

function ImportQuestionsInstructions(props: {
  onQuestionsFileUploaded: (csvFile: File) => void;
}): JSX.Element {
  const { onQuestionsFileUploaded } = props;
  return (
    <>
      <Typography variant="h5">Import Questions</Typography>
      <div style={{ textAlign: "left", width: "50%" }}>
        <Typography variant="body1">
          Upload a CSV file with the following columns: question, topic,
          category, paraphrase1, paraphrase2, ...
        </Typography>
        <ul>
          <li>
            <Typography variant="body1">
              The first row of the CSV file should be the column names.
            </Typography>
          </li>
          <li>
            <Typography variant="body1">
              The question column is required and should be a single question.
            </Typography>
          </li>
          <li>
            <Typography variant="body1">
              The topic and category columns are required, but you are not
              required to enter values into these columns. If you provide a
              value, it must exactly match the name of an existing
              topic/category, or you will be asked to select from existing
              topics and categories.
            </Typography>
          </li>
          <li>
            <Typography variant="body1">
              There should be a new column for every paraphrase added.
            </Typography>
          </li>
        </ul>
      </div>

      <Button
        data-cy="upload-questions"
        variant="outlined"
        startIcon={<UploadIcon />}
        style={{ marginTop: 10 }}
        component="label"
      >
        Upload
        <input
          data-cy="upload-mentor"
          type="file"
          accept=".csv"
          hidden
          key={new Date().getTime()}
          onChange={(e) => {
            e.target.files instanceof FileList
              ? onQuestionsFileUploaded(e.target.files[0])
              : undefined;
          }}
        />
      </Button>
    </>
  );
}

export interface ImportedQuestions {
  question: string;
  topic: string;
  category: string;
  paraphrases: string[];
}

export interface IgnoredImportedQuestion extends ImportedQuestions {
  existingQuestion: SubjectQuestionGQL;
}

function ImportQuestionsDisplay(props: {
  subject: SubjectGQL;
  returnAction: () => void;
  addQuestions: (qs: SubjectQuestionGQL[]) => void;
  editQuestion: (val: SubjectQuestionGQL) => void;
  removeQuestion: (val: SubjectQuestionGQL) => void;
  classes: Record<string, string>;
  windowHeight: number;
}): JSX.Element {
  const {
    classes,
    returnAction,
    addQuestions,
    editQuestion,
    removeQuestion,
    windowHeight,
    subject,
  } = props;
  const [_questionsAdded, setQuestionsAdded] = useState<SubjectQuestionGQL[]>(
    []
  );
  const [questionsIgnored, setQuestionsIgnored] = useState<
    IgnoredImportedQuestion[]
  >([]);
  const questionsAdded = subject.questions.filter((q) =>
    _questionsAdded.find((qa) => qa.question._id === q.question._id)
  );
  const categories = subject.categories || [];
  const topics = subject.topics || [];

  function addQuestionsToSubject(importedQuestions: ImportedQuestions[]) {
    const newQuestionsToAdd: SubjectQuestionGQL[] = [];
    const questionsIgnored: IgnoredImportedQuestion[] = [];

    importedQuestions.forEach((importedQuestion) => {
      const {
        question: importedQuestionText,
        topic,
        category,
        paraphrases: importedParaphrases,
      } = importedQuestion;
      const questionAlreadyExists = subject.questions.find((subjQ) => {
        return (
          subjQ.question.question === importedQuestionText ||
          subjQ.question.paraphrases.includes(importedQuestionText) ||
          importedParaphrases.some((p) => {
            return (
              subjQ.question.question === p ||
              subjQ.question.paraphrases.includes(p)
            );
          })
        );
      });

      if (questionAlreadyExists) {
        questionsIgnored.push({
          ...importedQuestion,
          existingQuestion: questionAlreadyExists,
        });
        return;
      }
      const existingTopic = subject.topics.find((t) => {
        return t.name.toLowerCase() === topic.toLowerCase();
      });
      const existingCategory = subject.categories.find((c) => {
        return c.name.toLowerCase() === category.toLowerCase();
      });

      const newQuestion: SubjectQuestionGQL = {
        question: {
          _id: uuid(),
          clientId: uuid(),
          question: importedQuestionText,
          paraphrases: importedParaphrases,
          type:
            subject.type === SubjectTypes.UTTERANCES
              ? QuestionType.UTTERANCE
              : QuestionType.QUESTION,
          name: UtteranceName.NONE,
        },
        category: existingCategory,
        topics: existingTopic ? [existingTopic] : [],
      };
      newQuestionsToAdd.push(newQuestion);
    });
    setQuestionsAdded(newQuestionsToAdd);
    setQuestionsIgnored(questionsIgnored);
    addQuestions(newQuestionsToAdd);
  }

  function processCsvQuestions(csvContent: string) {
    Papa.parse<string[]>(csvContent, {
      complete: (result) => {
        const importedQuestions: ImportedQuestions[] = [];
        if (result.data.length > 1) {
          const rows = result.data.slice(1); // Skip the first row
          rows.forEach((row: string[]) => {
            const question = row[0];
            const topic = row[1];
            const category = row[2];
            const paraphrases = row.slice(3).filter((p) => p);
            if (!question) {
              return;
            }
            importedQuestions.push({ question, topic, category, paraphrases });
          });
          addQuestionsToSubject(importedQuestions);
        }
      },
      header: false,
    });
  }

  function onQuestionsFileUploaded(csvFile: File) {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        processCsvQuestions(event.target.result as string);
      }
    };
    reader.readAsText(csvFile);
  }

  return (
    <>
      <div
        style={{
          height: windowHeight - 300,
          flexGrow: 1,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "center",
          overflow: "auto",
          border: "1px solid lightgrey",
          borderRadius: "5px",
        }}
      >
        {questionsAdded.length > 0 || questionsIgnored.length > 0 ? (
          <ImportedQuestionsDisplay
            categories={categories}
            topics={topics}
            classes={classes}
            questionsAdded={questionsAdded}
            questionsIgnored={questionsIgnored}
            editQuestion={editQuestion}
            removeQuestion={removeQuestion}
          />
        ) : (
          <ImportQuestionsInstructions
            onQuestionsFileUploaded={onQuestionsFileUploaded}
          />
        )}
      </div>
      <Button
        style={{
          position: "absolute",
          bottom: 80,
          left: "50%",
          transform: "translate(-50%, -50%)",
          margin: 0,
        }}
        data-cy="cancel-import-questions"
        variant="outlined"
        className={classes.button}
        onClick={returnAction}
      >
        Cancel
      </Button>
    </>
  );
}

export function QuestionsList(props: {
  saveCounter: number;
  subject: SubjectGQL;
  subjectType: SubjectTypes;
  classes: Record<string, string>;
  categories: Category[];
  topics: Topic[];
  questions: SubjectQuestionGQL[];
  addCategory: () => void;
  editCategory: (val: Category) => void;
  removeCategory: (val: Category) => void;
  addQuestion: (args?: NewQuestionArgs) => void;
  addQuestions: (qs: SubjectQuestionGQL[]) => void;
  editQuestion: (val: SubjectQuestionGQL) => void;
  removeQuestion: (val: SubjectQuestionGQL) => void;
  moveQuestion: (toMove: string, moveTo: number, category?: string) => void;
}): JSX.Element {
  const {
    classes,
    questions,
    subjectType,
    subject,
    addQuestions,
    editQuestion,
    saveCounter,
  } = props;
  const [searchInput, setSearchInput] = useState<Question>();
  const [selectedQuestion, setSelectedQuestion] = useState<string>();
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [importQuestionsDisplay, setImportQuestionsDisplay] =
    useState<boolean>(false);

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
    if (saveCounter > 0) {
      setImportQuestionsDisplay(false);
    }
  }, [saveCounter]);

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
      {importQuestionsDisplay ? (
        <ImportQuestionsDisplay
          editQuestion={editQuestion}
          addQuestions={addQuestions}
          subject={subject}
          returnAction={() => {
            setImportQuestionsDisplay(false);
          }}
          classes={classes}
          windowHeight={windowHeight}
          removeQuestion={props.removeQuestion}
        />
      ) : (
        <>
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
                          if (
                            element.getAttribute("data-cy") !== "add-question"
                          ) {
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
                                deselectQuestion={() =>
                                  selectQuestion(undefined)
                                }
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
              <Typography {...props} align="left" key={`${option._id}`}>
                {option.question}
              </Typography>
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
          <Button
            data-cy="import-questions"
            variant="outlined"
            className={classes.button}
            onClick={() => setImportQuestionsDisplay(true)}
          >
            Import CSV
          </Button>
        </>
      )}
    </div>
  );
}

export default QuestionsList;
