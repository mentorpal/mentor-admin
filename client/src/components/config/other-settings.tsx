/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import {
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from "@mui/material";
import { Autocomplete } from "@mui/material";

import { Config, Keyword, QuestionSortOrder } from "types";
import { SubjectGQL } from "types-gql";
import { uuid4 } from "@sentry/utils";

export function Settings(props: {
  config: Config;
  keywords: Keyword[];
  subjects: SubjectGQL[];
  updateConfig: (c: Partial<Config>) => void;
}): JSX.Element {
  const { config, updateConfig } = props;
  const featuredSubjects = props.subjects.filter((s) =>
    config.featuredSubjects?.includes(s._id)
  );
  const defaultSubject = props.subjects.find(
    (s) => config.defaultSubject === s._id
  );

  return (
    <div>
      <Autocomplete
        data-cy="keyword-input"
        multiple
        value={config.featuredKeywordTypes}
        options={
          props.keywords
            ?.map((k) => k.type)
            ?.filter((v, i, a) => a.indexOf(v) === i) || []
        }
        getOptionLabel={(option: string) => option}
        onChange={(e, v) => updateConfig({ featuredKeywordTypes: v })}
        renderTags={(value: readonly string[], getTagProps) =>
          value.map((option: string, index: number) => (
            <Chip
              data-cy={`keyword-${option}`}
              label={option}
              {...getTagProps({ index })}
              key={`keyword-${option}`}
            />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            placeholder="Featured Keyword Types"
            label="Featured Keyword Types"
          />
        )}
        renderOption={(props, option) => (
          <Typography
            {...props}
            align="left"
            data-cy={`keyword-option-${option}`}
            key={`${option}${uuid4()}`}
          >
            {option}
          </Typography>
        )}
        style={{ width: "100%", marginBottom: 10 }}
      />
      <Autocomplete
        data-cy="subject-input"
        multiple
        value={featuredSubjects}
        options={props.subjects}
        getOptionLabel={(option: SubjectGQL) => option.name}
        onChange={(e, v) =>
          updateConfig({ featuredSubjects: v.map((s) => s._id) })
        }
        renderTags={(value: readonly SubjectGQL[], getTagProps) =>
          value.map((option: SubjectGQL, index: number) => (
            <Chip
              data-cy={`subject-${option._id}`}
              label={option.name}
              {...getTagProps({ index })}
              key={`subject-${option._id}`}
            />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            placeholder="Featured Subjects"
            label="Featured Subjects"
          />
        )}
        renderOption={(props, option) => (
          <Typography
            {...props}
            align="left"
            data-cy={`subject-option-${option._id}`}
            key={`${option._id}`}
          >
            {option.name}
          </Typography>
        )}
        style={{ width: "100%", marginBottom: 10 }}
      />
      <Autocomplete
        data-cy="default-subject-input"
        value={defaultSubject}
        options={featuredSubjects}
        getOptionLabel={(option: SubjectGQL) => option.name}
        onChange={(e, v) =>
          updateConfig({ defaultSubject: v?._id || undefined })
        }
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            placeholder="Default Subject"
            label="Default Subject"
          />
        )}
        renderOption={(props, option) => (
          <Typography
            {...props}
            align="left"
            data-cy={`default-subject-option-${option._id}`}
            key={`${option._id}`}
          >
            {option.name}
          </Typography>
        )}
        style={{ width: "100%", marginBottom: 10 }}
      />
      <TextField
        fullWidth
        data-cy="minTopicQuestionSize"
        data-test={config.minTopicQuestionSize}
        variant="outlined"
        label="Minimum Question Topic Size"
        value={config.minTopicQuestionSize}
        onChange={(e) =>
          updateConfig({ minTopicQuestionSize: Number(e.target.value) || 0 })
        }
        style={{ marginBottom: 20 }}
        inputProps={{ inputMode: "numeric", pattern: "[0-9]+" }}
        InputLabelProps={{
          shrink: true,
        }}
      />
      <FormControl variant="outlined" fullWidth>
        <InputLabel>Question Sort Order</InputLabel>
        <Select
          label="Question Sort Order"
          value={config.questionSortOrder || QuestionSortOrder.Default}
          onChange={(event: SelectChangeEvent<QuestionSortOrder>) =>
            updateConfig({
              questionSortOrder: event.target.value as QuestionSortOrder,
            })
          }
        >
          <MenuItem value={QuestionSortOrder.Default}>Default</MenuItem>
          <MenuItem value={QuestionSortOrder.Alphabetical}>
            {QuestionSortOrder.Alphabetical}
          </MenuItem>
          <MenuItem value={QuestionSortOrder.ReverseAlphabetical}>
            {QuestionSortOrder.ReverseAlphabetical}
          </MenuItem>
        </Select>
      </FormControl>
    </div>
  );
}
