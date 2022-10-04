/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { Button, Chip, TextField, Typography } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { graphql, useStaticQuery } from "gatsby";
import React, { useEffect, useState } from "react";

import { useWithWindowSize } from "hooks/use-with-window-size";
import { Keyword, Mentor } from "types";
import { Slide } from "./slide";
import { useWithConfig } from "store/slices/config/useWithConfig";

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
  const occupationData = useStaticQuery(graphql`
    query AllOccupations {
      allOccupationsCsv {
        edges {
          node {
            Occupation
          }
        }
      }
    }
  `);

  useEffect(() => {
    if (!occupationData || !keywords || keywords.length === 0) {
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
    kwbt["Occupation"] = occupationData.allOccupationsCsv.edges.map(
      (edge: { node: { Occupation: string } }) => ({
        _id: "",
        name: edge.node.Occupation,
        type: "Occupation",
      })
    );
    setKeywordsByType(kwbt);
  }, [keywords, occupationData]);

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
                      options={kv[1]}
                      getOptionLabel={(option: Keyword) => option.name}
                      onChange={(e, v) => {
                        if (v) toggleKeyword(v);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          placeholder={`Choose ${kv[0].toLowerCase()}`}
                        />
                      )}
                      renderOption={(option) => (
                        <Typography
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
                          color={hasKeyword(k) ? "primary" : "default"}
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
                getOptionLabel={(option: Keyword) => option.name}
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
                      key={`keyword-${option.name}`}
                      data-cy={`keyword-${option.name}`}
                      variant="default"
                      label={option.name}
                      {...getTagProps({ index })}
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
                renderOption={(option) => (
                  <Typography
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
