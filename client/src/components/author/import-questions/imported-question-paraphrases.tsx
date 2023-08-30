/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListSubheader,
  Paper,
  TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { onTextInputChanged } from "helpers";
import { ExpandMore, ExpandLess } from "@mui/icons-material";

export function ImportedQuestionParaphrases(props: {
  classes: Record<string, string>;
  paraphrases: string[];
  updateParaphrases: (val: string[]) => void;
}): JSX.Element {
  const { classes, paraphrases, updateParaphrases } = props;
  const [open, setOpen] = React.useState(false);

  function addParaphrase() {
    updateParaphrases([...paraphrases, ""]);
  }

  function updateParaphrase(val: string, idx: number) {
    paraphrases[idx] = val;
    updateParaphrases([...paraphrases]);
  }

  const removeParaphrase = (idx: number) => {
    paraphrases.splice(idx, 1);
    updateParaphrases([...paraphrases]);
  };

  function handleClick() {
    setOpen(!open);
  }

  return (
    <Paper
      elevation={0}
      style={{
        textAlign: "left",
        borderRadius: 10,
        border: "1px solid #ccc",
        height: "fit-content",
      }}
    >
      <List data-cy="paraphrases" dense disablePadding>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <ListSubheader>Paraphrases</ListSubheader>
          <ListItemButton
            onClick={handleClick}
            style={{ width: "fit-content" }}
            data-cy="paraphrases-expand"
          >
            {open ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </div>
        <Collapse in={open} timeout="auto" unmountOnExit>
          {paraphrases?.map((paraphrase, i) => (
            <ListItem
              data-cy={`paraphrase-${i}`}
              key={`paraphrase-${i}`}
              dense
              disableGutters
            >
              <Card style={{ width: "100%" }} elevation={0}>
                <CardContent>
                  <div style={{ display: "flex", flexDirection: "row" }}>
                    <TextField
                      data-cy="edit-paraphrase"
                      label="Paraphrase"
                      variant="outlined"
                      fullWidth
                      value={paraphrase}
                      onChange={(e) =>
                        onTextInputChanged(e, () => {
                          updateParaphrase(e.target.value, i);
                        })
                      }
                    />
                    <CardActions>
                      <IconButton
                        data-cy="delete-paraphrase"
                        size="small"
                        onClick={() => removeParaphrase(i)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </CardActions>
                  </div>
                </CardContent>
              </Card>
            </ListItem>
          ))}
          <Button
            data-cy="add-paraphrase"
            startIcon={<AddIcon />}
            className={classes.button}
            onClick={addParaphrase}
          >
            Add Paraphrase
          </Button>
        </Collapse>
      </List>
    </Paper>
  );
}

export default ImportedQuestionParaphrases;
