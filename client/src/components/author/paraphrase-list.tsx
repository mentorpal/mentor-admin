import React from "react";
import {
  Paper,
  Typography,
  List,
  ListItem,
  Button,
  Card,
  CardActions,
  CardContent,
  IconButton,
  TextField,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import ClearOutlinedIcon from "@material-ui/icons/ClearOutlined";

export function ParaphraseCard(props: {
  paraphrase: string;
  editParaphrase: (val: string) => void;
  removeParaphrase: () => void;
}) {
  const { paraphrase, editParaphrase, removeParaphrase } = props;

  return (
    <Card style={{ width: "100%" }} elevation={0}>
      <CardContent>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <TextField
            id="edit-paraphrase"
            label="Paraphrase"
            variant="outlined"
            fullWidth
            value={paraphrase}
            onChange={(e) => editParaphrase(e.target.value)}
          />
          <CardActions>
            <IconButton id="delete" size="small" onClick={removeParaphrase}>
              <ClearOutlinedIcon />
            </IconButton>
          </CardActions>
        </div>
      </CardContent>
    </Card>
  );
}

export function ParaphraseList(props: {
  classes: any;
  paraphrases: string[];
  updateParaphrases: (val: string[]) => void;
}): JSX.Element {
  const { classes, paraphrases, updateParaphrases } = props;

  function replaceItem<T>(a: Array<T>, index: number, item: T): Array<T> {
    const newArr = [...a];
    newArr[index] = item;
    return newArr;
  }

  function updateParaphrase(val: string, idx: number) {
    updateParaphrases(replaceItem(paraphrases, idx, val));
  }

  function addParaphrase() {
    updateParaphrases([...paraphrases, ""]);
  }

  const removeParaphrase = (idx: number) => {
    paraphrases.splice(idx, 1);
    updateParaphrases([...paraphrases]);
  };

  return (
    <Paper
      elevation={0}
      style={{
        textAlign: "left",
        borderRadius: 10,
        border: "1px solid #ccc",
        marginTop: 25,
      }}
    >
      <Typography variant="body2" style={{ padding: 15 }}>
        Paraphrases
      </Typography>
      <List id="paraphrases" dense disablePadding>
        {paraphrases.map((q, i) => (
          <ListItem id={`paraphrase-${i}`} dense disableGutters>
            <ParaphraseCard
              paraphrase={q}
              editParaphrase={(val: string) => {
                updateParaphrase(val, i);
              }}
              removeParaphrase={() => {
                removeParaphrase(i);
              }}
            />
          </ListItem>
        ))}
      </List>
      <Button
        id="add-paraphrase"
        startIcon={<AddIcon />}
        className={classes.button}
        onClick={addParaphrase}
      >
        Add Paraphrase
      </Button>
    </Paper>
  );
}

export default ParaphraseList;
