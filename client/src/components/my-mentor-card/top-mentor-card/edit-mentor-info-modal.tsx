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
} from "@material-ui/core";
import { onTextInputChanged } from "helpers";
import React from "react";
import { Mentor, MentorType } from "types";

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

function EditMentorInfoModal(props: {
  handleClose: () => void;
  editMentor: (edits: Partial<Mentor>) => void;
  editedMentor: Mentor;
  open: boolean;
}): JSX.Element {
  const { handleClose, editMentor, editedMentor, open } = props;
  const classes = useStyles();

  return (
    <div>
      <div>
        <div className="modal-wrapper">
          <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            className={classes.modal}
            open={open}
            onClose={handleClose}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
              timeout: 500,
            }}
            data-cy="edit-mentor-data-modal"
          >
            <Fade in={open}>
              <div className={classes.paper}>
                <Grid item alignItems="center" xs={12} md={12}>
                  <TextField
                    data-cy="mentor-name"
                    label="Full Name"
                    value={editedMentor.name}
                    onChange={(e) =>
                      onTextInputChanged(e, () => {
                        editMentor({ name: e.target.value });
                      })
                    }
                    className={classes.inputField}
                  />
                  <TextField
                    data-cy="mentor-job-title"
                    label="Job Title"
                    value={editedMentor.title}
                    onChange={(e) =>
                      onTextInputChanged(e, () => {
                        editMentor({ title: e.target.value });
                      })
                    }
                    className={classes.inputField}
                  />
                  <TextField
                    data-cy="mentor-first-name"
                    label="First Name"
                    value={editedMentor.firstName}
                    onChange={(e) =>
                      onTextInputChanged(e, () => {
                        editMentor({ firstName: e.target.value });
                      })
                    }
                    className={classes.inputField}
                  />
                  <TextField
                    data-cy="mentor-email"
                    label="Email"
                    type="email"
                    value={editedMentor.email}
                    onChange={(e) => editMentor({ email: e.target.value })}
                    className={classes.inputField}
                  />
                  <FormControlLabel
                    data-cy="allow-contact-btn"
                    control={
                      <Checkbox
                        checked={editedMentor.allowContact}
                        onChange={() =>
                          editMentor({
                            allowContact: !editedMentor.allowContact,
                          })
                        }
                        color="secondary"
                      />
                    }
                    label="Allow people to contact me"
                    style={{ width: "100%", marginLeft: 10, marginRight: 10 }}
                  />
                  <div
                    className={classes.inputField}
                    style={{ textAlign: "left" }}
                  >
                    <FormControl>
                      <InputLabel>Mentor Type</InputLabel>
                      <Select
                        data-cy="select-chat-type"
                        label="Mentor Type"
                        value={editedMentor.mentorType}
                        style={{ width: 200 }}
                        onChange={(
                          event: React.ChangeEvent<{
                            name?: string | undefined;
                            value: unknown;
                          }>
                        ) => {
                          editMentor({
                            mentorType: event.target.value as MentorType,
                          });
                        }}
                      >
                        <MenuItem data-cy="chat" value={MentorType.CHAT}>
                          Chat
                        </MenuItem>
                        <MenuItem data-cy="video" value={MentorType.VIDEO}>
                          Video
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </div>
                </Grid>
                <Button
                  onClick={handleClose}
                  data-cy="close-modal"
                  variant="contained"
                  color="primary"
                  component="span"
                >
                  Close
                </Button>
              </div>
            </Fade>
          </Modal>
        </div>
      </div>
    </div>
  );
}

export default EditMentorInfoModal;
