/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useState } from "react";
import {
  Button,
  CircularProgress,
  List,
  ListItem,
  Theme,
  Typography,
} from "@mui/material";
import { makeStyles } from "tss-react/mui";

import NavBar from "components/nav-bar";
import { v4 as uuid } from "uuid";
import UploadIcon from "@mui/icons-material/Upload";
import withLocation from "wrap-with-location";
import withAuthorizationOnly from "hooks/wrap-with-authorization-only";
import { useActiveMentor } from "store/slices/mentor/useActiveMentor";
import { useWithSubject } from "hooks/graphql/use-with-subject";
import { ErrorDialog, LoadingDialog, TwoOptionDialog } from "components/dialog";
import { useWithWindowSize } from "hooks/use-with-window-size";
import {
  Category,
  QuestionType,
  SubjectTypes,
  Topic,
  UtteranceName,
} from "types";
import { navigate } from "gatsby";
import { SubjectGQL, SubjectQuestionGQL } from "types-gql";
import ImportedQuestionItem from "components/author/import-questions/imported-question-item";
import IgnoredQuestionItem from "components/author/import-questions/ignored-question-item";
import Papa from "papaparse";

const useStyles = makeStyles({ name: { ImportQuestionsPage } })(
  (theme: Theme) => ({
    root: {
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      margin: 0,
    },
    row: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
    },
    tab: {
      width: "95%",
    },
    button: {
      width: 200,
      margin: theme.spacing(2),
    },
    list: {
      background: "#F5F5F5",
    },
  })
);

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
      <div style={{ textAlign: "left", width: "50%", padding: "20px" }}>
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
        data-cy="upload-questions-csv"
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
  addQuestions: (qs: SubjectQuestionGQL[]) => void;
  editQuestion: (val: SubjectQuestionGQL) => void;
  removeQuestion: (val: SubjectQuestionGQL) => void;
  classes: Record<string, string>;
  windowHeight: number;
}): JSX.Element {
  const {
    classes,
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
          height: windowHeight - 200,
          flexGrow: 1,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "center",
          overflow: "auto",
          margin: "20px",
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
    </>
  );
}

export function ImportQuestionsPage(props: {
  accessToken: string;
  search: { id?: string };
}): JSX.Element {
  const { classes } = useStyles();
  const { getData, isLoading: isMentorLoading } = useActiveMentor();
  const mentorId = getData((state) => state.data?._id);
  const {
    editedData: editedSubject,
    error: subjectError,
    isEdited: isSubjectEdited,
    isLoading: isSubjectLoading,
    isSaving: isSubjectSaving,
    saveSubject,
    addQuestions,
    updateQuestion,
    removeQuestion,
  } = useWithSubject(props.search.id || "", props.accessToken);
  const { height: windowHeight } = useWithWindowSize();
  const [cancelImportDialogue, setCancelImportDialogue] =
    useState<boolean>(false);

  if (!mentorId || !editedSubject) {
    return (
      <div>
        <NavBar title="Import Questions" />
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <NavBar
        title={`Importing Questions: ${editedSubject.name}}`}
        mentorId={mentorId}
      />

      <ImportQuestionsDisplay
        editQuestion={updateQuestion}
        addQuestions={addQuestions}
        subject={editedSubject}
        classes={classes}
        windowHeight={windowHeight}
        removeQuestion={removeQuestion}
      />
      <TwoOptionDialog
        title="Are you sure you want to cancel this import?"
        open={cancelImportDialogue}
        option1={{
          display: "No",
          onClick: () => setCancelImportDialogue(false),
        }}
        option2={{
          display: "Yes",
          onClick: () => {
            setCancelImportDialogue(false);
            navigate(`/author/subject/?id=${editedSubject._id}`);
          },
        }}
      />

      <div>
        <Button
          data-cy="save-button"
          variant="contained"
          color="primary"
          className={classes.button}
          disabled={!isSubjectEdited}
          onClick={() => {
            saveSubject().then(() => {
              navigate(`/author/subject/?id=${editedSubject._id}`);
            });
          }}
        >
          Save
        </Button>
        <Button
          style={{
            margin: 0,
          }}
          data-cy="cancel-import-questions"
          variant="outlined"
          className={classes.button}
          onClick={() => {
            setCancelImportDialogue(true);
          }}
        >
          Cancel
        </Button>
      </div>
      <LoadingDialog
        title={
          isMentorLoading || isSubjectLoading
            ? "Loading"
            : isSubjectSaving
            ? "Saving"
            : ""
        }
      />
      <TwoOptionDialog
        title="Are you sure you want to cancel this import?"
        open={cancelImportDialogue}
        option1={{
          display: "No",
          onClick: () => setCancelImportDialogue(false),
        }}
        option2={{
          display: "Yes",
          onClick: () => {
            setCancelImportDialogue(false);
            navigate(`/author/subject/?id=${editedSubject._id}`);
          },
        }}
      />
      <ErrorDialog error={subjectError} />
    </div>
  );
}

export default withAuthorizationOnly(withLocation(ImportQuestionsPage));
