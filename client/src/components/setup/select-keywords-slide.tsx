/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { Button, Chip, TextField, Typography } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import React, { useEffect, useState } from "react";

import { occupations } from "data/occupations";
import { useWithWindowSize } from "hooks/use-with-window-size";
import { useWithConfig } from "store/slices/config/useWithConfig";
import { Keyword, Mentor } from "types";
import { Slide } from "./slide";

export function SelectKeywordsSlide(props: {
  classes: Record<string, string>;
  mentor: Mentor;
  keywords: Keyword[];
  editMentor: (edits: Partial<Mentor>) => void;
}): JSX.Element {
  const { classes, mentor, editMentor } = props;
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [allKeywords, setAllKeywords] = useState<string[]>([]);
  const { width: windowWidth } = useWithWindowSize();
  const { state: configState } = useWithConfig();

  useEffect(() => {
    if (
      !props.keywords ||
      props.keywords.length === 0 ||
      !configState.config?.featuredKeywordTypes
    ) {
      return;
    }
    const keywords = props.keywords.filter((k) =>
      configState.config!.featuredKeywordTypes.includes(k.type)
    );
    const kwO = keywords.findIndex((k) => k.type === "Occupation");
    if (kwO === -1) {
      keywords.push({ _id: "", type: "Occupation", keywords: occupations });
    } else {
      keywords[kwO].keywords = [
        ...new Set([...keywords[kwO].keywords, ...occupations]),
      ];
    }
    setKeywords(keywords);
    const allKeyWords: string[] = [];
    for (const k of keywords) {
      allKeyWords.push(...k.keywords);
    }
    setAllKeywords(allKeyWords);
  }, [props.keywords, configState.config]);

  function hasKeyword(k: string): boolean {
    return Boolean(
      mentor.keywords.find((mk) => mk.toLowerCase() === k.toLowerCase())
    );
  }

  function addKeyword(add: string): void {
    editMentor({ ...mentor, keywords: [...mentor.keywords, add] });
  }

  function removeKeyword(remove: string): void {
    editMentor({
      ...mentor,
      keywords: mentor.keywords.filter(
        (k) => k.toLowerCase() !== remove.toLowerCase()
      ),
    });
  }

  function toggleKeyword(k: string): void {
    if (hasKeyword(k)) {
      removeKeyword(k);
    } else {
      addKeyword(k);
    }
  }

  if (!mentor) {
    return <div />;
  }
  return (
    <Slide
      classes={classes}
      title="Experiences & Identities"
      content={
        <div>
          <div style={{ display: "flex", flexDirection: "row" }}>
            <div style={{ width: windowWidth * 0.85, margin: 10 }}>
              {keywords.map((kw) => (
                <div
                  key={`keyword-type-${kw.type}`}
                  data-cy={`keyword-type-${kw.type}`}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Typography style={{ width: 100, textAlign: "left" }}>
                    {kw.type}
                  </Typography>
                  {kw.keywords.length > 10 ? (
                    <Autocomplete
                      data-cy={`${kw.type}-input`}
                      freeSolo
                      options={kw.keywords}
                      onChange={(e, v) => {
                        if (typeof v === "string") {
                          toggleKeyword(v);
                        }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          placeholder={`Choose ${kw.type.toLowerCase()}`}
                        />
                      )}
                      renderOption={(props, option) => (
                        <Typography
                          {...props}
                          align="left"
                          data-cy={`${kw.type}-option-${option}`}
                        >
                          {option}
                        </Typography>
                      )}
                      style={{ width: "100%", marginTop: 10, marginBottom: 10 }}
                    />
                  ) : (
                    <div>
                      {kw.keywords.map((k) => (
                        <Button
                          key={`keyword-name-${k}`}
                          data-cy={`keyword-name-${k}`}
                          data-test={hasKeyword(k)}
                          variant="contained"
                          color={hasKeyword(k) ? "primary" : "secondary"}
                          onClick={() => toggleKeyword(k)}
                          style={{
                            marginRight: 10,
                            marginTop: 5,
                            marginBottom: 5,
                            textTransform: "none",
                          }}
                        >
                          {k}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "wrap",
                }}
              >
                {mentor.keywords.map((k) => (
                  <Chip
                    key={`keyword-${k}`}
                    data-cy={`keyword-${k}`}
                    label={k}
                    onDelete={() => removeKeyword(k)}
                    style={{ margin: 5 }}
                  />
                ))}
              </div>
              <Autocomplete
                data-cy="keyword-input"
                title="Your Keywords"
                multiple
                freeSolo
                value={mentor.keywords}
                options={allKeywords}
                onChange={(e, v) =>
                  editMentor({
                    ...mentor,
                    keywords: v,
                  })
                }
                renderTags={() => <></>}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    placeholder="Enter your own keywords"
                  />
                )}
                disableClearable
                renderOption={(props, option) => (
                  <Typography
                    {...props}
                    align="left"
                    data-cy={`keyword-option-${option}`}
                  >
                    {option}
                  </Typography>
                )}
                style={{ width: "100%", marginTop: 10 }}
              />
            </div>
          </div>
        </div>
      }
    />
  );
}
