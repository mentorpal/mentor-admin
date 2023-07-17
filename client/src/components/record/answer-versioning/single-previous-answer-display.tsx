import React, { useEffect, useState } from "react";
import { PreviousAnswerVersion } from "types-gql";
import { PreviousVersionSelectionType } from "./answer-versions";
import {
  CardContent,
  Collapse,
  Container,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  Radio,
  RadioGroup,
} from "@mui/material";

function TranscriptDisplay(props: { transcript: string }): JSX.Element {
  return (
    <span style={{ margin: "5px" }}>
      <span style={{ fontWeight: "bold" }}>Transcript</span>
      <br />
      <span data-cy="transcript" style={{ fontSize: "13px" }}>
        {props.transcript}
      </span>
    </span>
  );
}

function VttDisplay(props: { vttText: string }): JSX.Element {
  const { vttText: _vttText } = props;
  if (!_vttText) {
    return <></>;
  }
  const vttText = _vttText.trim();
  const [open, setOpen] = useState<boolean>(false);
  const formattedVttText = vttText.split("\n").map((line, index) => (
    <React.Fragment key={index}>
      {line}
      <br />
    </React.Fragment>
  ));
  const vttTextStart = formattedVttText.slice(0, 10);
  const vttTextEnd = formattedVttText.slice(10);
  return (
    <span data-cy="vtt" style={{ margin: "5px" }}>
      <span style={{ fontWeight: "bold" }}>VTT</span>
      <pre style={{ margin: 0 }}>{vttTextStart}</pre>

      {vttTextEnd.length ? (
        <div>
          {!open && (
            <IconButton
              size="small"
              style={{ margin: 0, fontSize: "12px" }}
              onClick={() => {
                setOpen(!open);
              }}
            >
              {"Show More"}
            </IconButton>
          )}

          <div
            style={{
              backgroundColor: "rgba(211,211,211,0.4)",
            }}
          >
            <Collapse in={open} timeout="auto" unmountOnExit>
              <CardContent style={{ padding: 0, margin: 0 }}>
                <Container
                  sx={{
                    height: "fit-content",
                  }}
                >
                  <pre style={{ margin: 0, padding: 0 }}>{vttTextEnd}</pre>
                  {open && (
                    <IconButton
                      size="small"
                      style={{ margin: 0, fontSize: "12px" }}
                      onClick={() => {
                        setOpen(!open);
                      }}
                    >
                      {"Show Less"}
                    </IconButton>
                  )}
                </Container>
              </CardContent>
            </Collapse>
          </div>
        </div>
      ) : null}
    </span>
  );
}

function DateDisplay(props: { dateVersioned: string }): JSX.Element {
  const date = new Date(parseInt(props.dateVersioned));
  return (
    <span style={{ margin: "5px" }}>
      <span style={{ fontWeight: "bold" }}>Date Versioned:</span>{" "}
      {date.toLocaleString()}
    </span>
  );
}

export function PreviousAnswerDisplay(props: {
  previousAnswer: PreviousAnswerVersion;
  setSelectedAnswerVersion: (previousAnswer?: PreviousAnswerVersion) => void;
  setSelectionType: (selectionType: PreviousVersionSelectionType) => void;
}): JSX.Element {
  const { previousAnswer, setSelectedAnswerVersion, setSelectionType } = props;
  const [localSelectedRadio, setLocalSelectedRadio] = useState<string>(
    PreviousVersionSelectionType.NONE
  );

  useEffect(() => {
    if (!previousAnswer) {
      return;
    }
    setLocalSelectedRadio(PreviousVersionSelectionType.NONE);
    setSelectedAnswerVersion(undefined);
  }, [previousAnswer.transcript, previousAnswer.vttText]);
  return (
    <div
      data-cy={"previous-version"}
      style={{
        display: "flex",
        flexDirection: "column",
        margin: "5px",
        border: "3px solid black",
        padding: "8px",
        borderRadius: "5px",
      }}
    >
      <DateDisplay dateVersioned={previousAnswer.dateVersioned} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          backgroundColor: "lightgrey",
          border: "1px solid grey",
          width: "100%",
          borderRadius: "5px",
        }}
      >
        <TranscriptDisplay transcript={previousAnswer.transcript} />
        {previousAnswer.vttText !== undefined && (
          <VttDisplay vttText={previousAnswer.vttText} />
        )}
      </div>
      <FormControl style={{ alignSelf: "center" }}>
        <FormLabel>Replace:</FormLabel>
        <RadioGroup
          name="controlled-radio-buttons-replace"
          value={localSelectedRadio}
          onChange={(e) => {
            setLocalSelectedRadio(
              e.target.value as PreviousVersionSelectionType
            );
            setSelectionType(e.target.value as PreviousVersionSelectionType);
            setSelectedAnswerVersion(previousAnswer);
          }}
        >
          {previousAnswer.vttText && (
            <FormControlLabel
              data-cy="both-radio-button"
              value={PreviousVersionSelectionType.BOTH}
              control={<Radio />}
              label="BOTH"
            />
          )}
          <FormControlLabel
            data-cy="transcript-radio-button"
            value={PreviousVersionSelectionType.TRANSCRIPT_ONLY}
            control={<Radio />}
            label="Transcript Only"
          />
          {previousAnswer.vttText && (
            <FormControlLabel
              data-cy="vtt-radio-button"
              value={PreviousVersionSelectionType.VTT_ONLY}
              control={<Radio />}
              label="VTT Only"
            />
          )}
        </RadioGroup>
      </FormControl>
    </div>
  );
}
