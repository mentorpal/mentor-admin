/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  Backdrop,
  Button,
  Fade,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  SelectChangeEvent,
  TextField,
  Theme,
  Typography,
} from "@mui/material";
import { makeStyles } from "tss-react/mui";
import React, { useEffect, useState } from "react";
import {
  Category,
  Mentor,
  Question,
  QuestionType,
  Subject,
  Topic,
  UtteranceName,
} from "types";
import { onTextInputChanged } from "helpers";
import { v4 as uuid } from "uuid";
import { Autocomplete } from "@mui/material";
import { addOrUpdateSubjectQuestions } from "api";
import { SubjectQuestionGQL } from "types-gql";
import { useQuestionActions } from "store/slices/questions/useQuestions";

const useStyles = makeStyles({ name: { EditQuestionForQueueModal } })(
  (theme: Theme) => ({
    homeThumbnail: {
      position: "relative",
      width: "78%",
      height: 180,
    },
    siteThumbnail: {
      width: 180,
      height: 135,
    },
    title: {
      fontWeight: "bold",
    },
    inputField: {
      width: "100%",
      margin: 10,
    },
    modal: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    paper: {
      backgroundColor: theme.palette.background.paper,
      border: "2px solid #000",
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 4, 3),
      maxWidth: "50%",
    },
  })
);

function EditQuestionForQueueModal(props: {
  handleClose: () => void;
  addQuestionToQueue: (questionId: string) => void;
  setFeedbackQuestionDocId: (questionId: string) => void;
  open: boolean;
  mentor: Mentor;
  userQuestion: string;
  accessToken: string;
}): JSX.Element {
  const {
    handleClose,
    open,
    userQuestion,
    mentor,
    accessToken,
    addQuestionToQueue,
    setFeedbackQuestionDocId,
  } = props;
  const { classes } = useStyles();
  const [selectedSubject, setSelectedSubject] = useState<Subject>();
  const [selectedCategory, setSelectedCategory] = useState<Category>();
  const [customQuestion, setCustomQuestion] = useState<string>(userQuestion);
  const [selectedTopics, setSelectedTopics] = useState<Topic[]>([]);
  const { loadQuestions } = useQuestionActions();

  async function okButtonClicked(
    customQuestion: string,
    selectedSubject: Subject
  ) {
    // create new question
    const newQuestion: Question = {
      _id: uuid(),
      question: customQuestion,
      type: QuestionType.QUESTION,
      name: UtteranceName.NONE,
      clientId: uuid(),
      paraphrases: [],
      mentor: mentor._id,
    };
    // create newSubjectQuestion : to add to db
    const newSubjectQuestion: SubjectQuestionGQL = {
      question: newQuestion,
      topics: selectedTopics,
      category: selectedCategory,
    };
    // add to DB
    const subjectQuestionsReturned = await addOrUpdateSubjectQuestions(
      selectedSubject._id,
      [newSubjectQuestion],
      accessToken
    );
    const newQuestionId = subjectQuestionsReturned[0].question;
    setFeedbackQuestionDocId(newQuestionId);
    // add to record queue
    addQuestionToQueue(newQuestionId);
    await loadQuestions([newQuestionId]);
    // close modal & reset
    setSelectedSubject(undefined);
    handleClose();
  }

  useEffect(() => {
    setCustomQuestion(userQuestion);
  }, [userQuestion]);

  return (
    <div>
      <div>
        <div className="modal-wrapper">
          <Modal
            aria-labelledby="transition-modal-title"
            data-cy="create-question-modal"
            aria-describedby="transition-modal-description"
            className={classes.modal}
            open={open}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
              timeout: 500,
            }}
          >
            <Fade in={open}>
              <div className={classes.paper}>
                <Grid item xs={12} md={12}>
                  <TextField
                    // user-asked question (editable)
                    label="Create new question:"
                    required={true}
                    value={customQuestion} // fill in with OG user question
                    // create a new question for mentor with (un)edited string
                    onChange={(e) =>
                      onTextInputChanged(e, () => {
                        setCustomQuestion(e.target.value);
                      })
                    }
                    className={classes.inputField}
                  />
                  <div
                    className={classes.inputField}
                    style={{ textAlign: "left" }}
                  >
                    <FormControl>
                      <InputLabel>Subject*</InputLabel>
                      <Select
                        // a dropdown for the subject
                        required={true}
                        data-cy="subject-drop-down"
                        style={{ width: 200 }}
                        defaultValue={""}
                        onChange={(event: SelectChangeEvent<string>) => {
                          setSelectedSubject(
                            mentor.subjects.find((a) => {
                              return a._id === event.target.value;
                            })
                          );
                        }}
                      >
                        <MenuItem disabled>--Select a subject--</MenuItem>
                        {mentor.subjects.map((subject) => (
                          <MenuItem
                            data-cy={`Subject-option-${subject._id}`}
                            key={subject.name}
                            value={subject._id}
                          >
                            {subject.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {selectedSubject ? (
                      <FormControl>
                        <InputLabel>Category*</InputLabel>
                        <Select
                          // a dropdown for the category
                          data-cy="category-drop-down"
                          style={{ width: 200 }}
                          required={true}
                          defaultValue={""}
                          onChange={(event: SelectChangeEvent<string>) => {
                            const category = selectedSubject.categories.find(
                              ({ id }) => id === event.target.value
                            );
                            setSelectedCategory(category);
                          }}
                        >
                          <MenuItem disabled>--Select a category--</MenuItem>
                          {selectedSubject.categories.map((category) => (
                            <MenuItem
                              data-cy={`Category-option-${category.id}`}
                              key={category.name}
                              value={category.id}
                            >
                              {category.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : undefined}
                  </div>

                  {selectedSubject ? (
                    <div
                      className={classes.inputField}
                      style={{ textAlign: "left" }}
                    >
                      <Autocomplete
                        // an autocomplete kwd-style area for "topics"
                        data-cy="topic-selector"
                        multiple
                        options={selectedSubject.topics || []}
                        getOptionLabel={(option) => option.name}
                        onChange={(e, v) => {
                          setSelectedTopics(v);
                        }}
                        style={{ minWidth: 300 }}
                        renderOption={(props, option) => (
                          <Typography
                            {...props}
                            align="left"
                            data-cy={`Topic-option-${option.id}`}
                            key={option.id}
                          >
                            {option.name}
                          </Typography>
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="outlined"
                            label="Select topic(s)"
                          />
                        )}
                      ></Autocomplete>
                    </div>
                  ) : undefined}
                </Grid>
                <Button
                  onClick={() => {
                    setCustomQuestion(userQuestion);
                    handleClose();
                  }}
                  data-cy="modal-close-btn"
                  variant="contained"
                  color="primary"
                  component="span"
                >
                  Cancel
                </Button>
                {selectedSubject ? (
                  <Button
                    onClick={() =>
                      okButtonClicked(customQuestion, selectedSubject)
                    }
                    data-cy="modal-OK-btn"
                    variant="contained"
                    color="primary"
                    component="span"
                    disabled={!selectedCategory || !customQuestion}
                  >
                    OK
                  </Button>
                ) : undefined}
              </div>
            </Fade>
          </Modal>
        </div>
      </div>
    </div>
  );
}
export default EditQuestionForQueueModal;
