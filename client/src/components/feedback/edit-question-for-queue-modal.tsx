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
  makeStyles,
  Modal,
  Select,
  TextField,
  Theme,
  Typography,
} from "@material-ui/core";
import React, { useState } from "react";
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
import { Autocomplete } from "@material-ui/lab";
import { addOrUpdateSubjectQuestions, addQuestionToRecordQueue } from "api";
import { SubjectQuestionGQL } from "types-gql";

const useStyles = makeStyles((theme: Theme) => ({
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
}));

function editQuestionForQueueModal(props: {
  open?: boolean;
  mentor: Mentor;
  userQuestion?: string;
  accessToken: string
}): JSX.Element {
  const {
    open,
    userQuestion,
    mentor,
    accessToken,
  } = props;
  const classes = useStyles();
  const mentorSubjects = mentor.subjects;
  const [selectedSubject, setSelectedSubject] = React.useState<Subject>();
  const [selectedCategory, setSelectedCategory] = React.useState<Category>();
  const [selectedTopic, setSelectedTopic] = React.useState<Topic>();
  const [customQuestion, setCustomQuestion] = React.useState<string>();

  function okButtonClicked(customQuestion: string) {
    // create new question
    const newQuestion: Question = {
    _id: uuid(),
    question: customQuestion,
    type: QuestionType.QUESTION,
    name: UtteranceName.NONE,
    clientId: uuid(),
    paraphrases: [],
    mentor: mentor._id,
    }
    // create newSubjectQuestion : to add to db
    const emptyTopic: Topic = {id: "",
      name: "",
      description: ""}
    const newSubjectQuestion: SubjectQuestionGQL = {
      question: newQuestion,
      topics: (selectedTopic!=undefined ? [selectedTopic] : [emptyTopic]),
      category: selectedCategory //can be null
     }

    // add to DB
    addOrUpdateSubjectQuestions(
      selectedSubject?._id || "", 
      [newSubjectQuestion],
      accessToken
    );
    // add to record queue
    addQuestionToRecordQueue(newQuestion._id, accessToken);
  }

  function handleClose(){
  }

  return (
    <div>
      <div>
        <div className="modal-wrapper">
          <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            className={classes.modal}
            open={open}
            onClose={okButtonClicked}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
              timeout: 500,
            }}
          >
            <Fade in={open}>
              <div className={classes.paper}>
                <Grid item alignItems="center" xs={12} md={12}>
                  <TextField
                    // user-asked question (editable)
                    label="Edit Question:"
                    value={userQuestion} // fill in with OG user question
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
                      <InputLabel>Subject</InputLabel>
                      <Select
                        // a dropdown for the subject
                        label="Subject"
                        value={mentorSubjects} // all the subjects
                        style={{ width: 200 }}
                        onChange={(
                          event: React.ChangeEvent<{ value: unknown }>
                        ) => {
                          setSelectedSubject(event.target.value as Subject);
                        }}
                      >
                        <option value="null" selected disabled>
                          Select Subject
                        </option>
                        {mentorSubjects.map((subject) => (
                          <option
                            key={subject.name}
                            value={subject._id}
                          ></option>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl>
                      <InputLabel>Category</InputLabel>
                      <Select
                        // a dropdown for the category
                        label="Category"
                        value={selectedSubject?.categories} // all the subject's categories
                        style={{ width: 200 }}
                        onChange={(
                          event: React.ChangeEvent<{ value: unknown }>
                        ) => {
                          setSelectedCategory(event.target.value as Category);
                        }}
                      >
                        <option value="null" selected disabled>
                          Select Category
                        </option>
                        {selectedSubject?.categories.map((category) => (
                          <option
                            key={category.name}
                            value={category.id}
                          ></option>
                        ))}
                      </Select>
                    </FormControl>
                  </div>
                  <div
                    className={classes.inputField}
                    style={{ textAlign: "left" }}
                  >
                    <Autocomplete
                      // an autocomplete kwd-style area for "topics"
                      data-cy="topic-selector"
                      options={selectedSubject?.topics || []}
                      getOptionLabel={(option) => option.name}

                      onChange={(e, v) => {
                        setSelectedTopic(v || undefined);
                      }} // FIX THIS 

                      style={{ minWidth: 300 }}
                      renderOption={(option) => (
                        <Typography align="left">{option.name}</Typography>
                      )}
                      renderInput={(params) => (
                        <TextField {...params} variant="outlined" />
                      )}
                    ></Autocomplete>
                  </div>
                </Grid>
                <Button
                  onClick={() => handleClose}
                  data-cy="close-modal"
                  variant="contained"
                  color="primary"
                  component="span"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => okButtonClicked(customQuestion || "")}
                  data-cy="close-modal"
                  variant="contained"
                  color="primary"
                  component="span"
                >
                  OK
                </Button>
              </div>
            </Fade>
          </Modal>
        </div>
      </div>
    </div>
  );
}
export default editQuestionForQueueModal;
