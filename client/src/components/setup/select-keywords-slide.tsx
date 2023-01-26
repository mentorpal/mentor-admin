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
  const { classes, mentor, keywords, editMentor } = props;
  const [keywordsByType, setKeywordsByType] = useState<
    Record<string, Keyword[]>
  >({});
  const { width: windowWidth } = useWithWindowSize();
  const { state: configState } = useWithConfig();

  useEffect(() => {
    if (!keywords || keywords.length === 0) {
      return;
    }
    const kwbt: Record<string, Keyword[]> = {};
    for (const type of configState.config?.featuredKeywordTypes || []) {
      const kws = keywords.filter(
        (kw) => kw.type.toLowerCase() === type.toLowerCase()
      );
      if (kws.length > 0) {
        kwbt[type] = kws;
      }
    }
    kwbt["Occupation"] = occupations.map((o) => ({
      _id: "",
      name: o,
      type: "Occupation",
    }));
    keywords
      .filter((kw) => kw.type === "Occupation")
      .forEach((kw) => {
        const f = kwbt["Occupation"].find((k) => k.name === kw.name);
        if (!f) {
          kwbt["Occupation"].push(kw);
        }
      });
    setKeywordsByType(kwbt);
  }, [keywords]);

  function hasKeyword(k: Keyword): boolean {
    return Boolean(
      mentor.keywords.find(
        (mk) => mk.name.toLowerCase() === k.name.toLowerCase()
      )
    );
  }

  function addKeyword(add: Keyword): void {
    editMentor({ ...mentor, keywords: [...mentor.keywords, add] });
  }

  function removeKeyword(remove: Keyword): void {
    editMentor({
      ...mentor,
      keywords: mentor.keywords.filter(
        (k) => k.name.toLowerCase() !== remove.name.toLowerCase()
      ),
    });
  }

  function toggleKeyword(k: Keyword): void {
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
              {Object.entries(keywordsByType).map((kv) => (
                <div
                  key={`keyword-type-${kv[0]}`}
                  data-cy={`keyword-type-${kv[0]}`}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Typography style={{ width: 100, textAlign: "left" }}>
                    {kv[0]}
                  </Typography>
                  {kv[1].length > 10 ? (
                    <Autocomplete
                      data-cy={`${kv[0]}-input`}
                      freeSolo
                      options={kv[1] as Keyword[]}
                      getOptionLabel={(option: Keyword | string) =>
                        typeof option === "string" ? option : option.name
                      }
                      isOptionEqualToValue={(option, value) =>
                        option._id === value._id
                      }
                      onChange={(e, v) => {
                        if (typeof v === "string") {
                          const kw = keywords.find((k) => k.name === v);
                          if (kw) {
                            toggleKeyword(kw);
                          } else {
                            editMentor({
                              ...mentor,
                              keywords: [
                                ...mentor.keywords,
                                { _id: "", name: v, type: kv[0] },
                              ],
                            });
                          }
                        } else if (v) {
                          toggleKeyword(v);
                        }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          placeholder={`Choose ${kv[0].toLowerCase()}`}
                        />
                      )}
                      renderOption={(props, option) => (
                        <Typography
                          {...props}
                          align="left"
                          data-cy={`${kv[0]}-option-${option.name}`}
                        >
                          {option.name}
                        </Typography>
                      )}
                      style={{ width: "100%", marginTop: 10, marginBottom: 10 }}
                    />
                  ) : (
                    <div>
                      {kv[1].map((k) => (
                        <Button
                          key={`keyword-name-${k.name}`}
                          data-cy={`keyword-name-${k.name}`}
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
                          {k.name}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <Autocomplete
                data-cy="keyword-input"
                multiple
                freeSolo
                value={mentor.keywords}
                options={keywords}
                getOptionLabel={(option: Keyword | string) =>
                  typeof option === "string" ? option : option.name
                }
                onChange={(e, v) =>
                  editMentor({
                    ...mentor,
                    keywords: v.map((k) => {
                      if (typeof k === "string") {
                        return { _id: "", name: k, type: "" };
                      } else {
                        return k;
                      }
                    }),
                  })
                }
                renderTags={(value: readonly Keyword[], getTagProps) =>
                  value.map((option: Keyword, index: number) => (
                    <Chip
                      data-cy={`keyword-${option.name}`}
                      label={option.name}
                      {...getTagProps({ index })}
                      key={`keyword-${option.name}`}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    placeholder="Enter your own keyword"
                  />
                )}
                renderOption={(props, option) => (
                  <Typography
                    {...props}
                    align="left"
                    data-cy={`keyword-option-${option.name}`}
                  >
                    {option.name}
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
