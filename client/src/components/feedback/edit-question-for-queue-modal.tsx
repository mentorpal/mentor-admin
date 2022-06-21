/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  Backdrop,
  Button,
  Checkbox,
  Fade,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  makeStyles,
  MenuItem,
  Modal,
  Select,
  TextField,
  Theme,
  Typography,
} from "@material-ui/core";
import React from "react";
import {
  Category,
  Mentor,
  Question,
  QuestionType,
  Subject,
  Topic,
  UserQuestion,
  UtteranceName,
} from "types";
import { getValueIfKeyExists, onTextInputChanged } from "helpers";
import { QuestionState } from "store/slices/questions";
import { v4 as uuid } from "uuid";
import { Autocomplete } from "@material-ui/lab";

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
  open: boolean;
  handleClose: () => void;
  UserQuestion: UserQuestion; //
  mentorQuestions: Record<string, QuestionState>;
  Mentor: Mentor;
  customQuestion: Question; // create new question
}): JSX.Element {
  const {
    handleClose,
    open,
    UserQuestion,
    mentorQuestions,
    Mentor,
    customQuestion,
  } = props;
  const classes = useStyles();
  const mentorSubjects = Mentor.subjects;
  const [openModal, setOpenModal] = React.useState<boolean>(false); // condition for modal
  const [selectedSubject, setSelectedSubject] = React.useState<Subject>();
  const [selectedCategory, setSelectedCategory] = React.useState<Category>();
  const [selectedTopic, setSelectedTopic] = React.useState<Category>();

  function okButtonClicked(customQuestion: Question) {
    //create the new question w/ attributes
    customQuestion.type = QuestionType.QUESTION; // default to question?
    (customQuestion._id = uuid()),
      (customQuestion.clientId = uuid()),
      (customQuestion.paraphrases = []),
      (customQuestion.name = UtteranceName.NONE),
      (customQuestion.mentor = Mentor._id);
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
                    value={UserQuestion.question} // fill in with OG user question
                    // create a new question for mentor with (un)edited string
                    onChange={(e) =>
                      onTextInputChanged(e, () => {
                        customQuestion.question = e.target.value;
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
                      onChange={} // FIX THIS
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
                  onClick={handleClose}
                  data-cy="close-modal"
                  variant="contained"
                  color="primary"
                  component="span"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => okButtonClicked(customQuestion)}
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
