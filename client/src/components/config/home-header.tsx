/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import { SketchPicker } from "react-color";
import {
  TextField,
  Typography,
} from "@material-ui/core";

import { Config } from "types";

export function HomeHeader(props: {
  styles: Record<string, string>;
  config: Config;
  updateConfig: (c: Partial<Config>) => void;
}): JSX.Element {
  const { styles, config, updateConfig } = props;
  return (
    <div>
      <TextField
        fullWidth
        data-cy="homeHeaderTitle"
        data-test={config.homeHeaderTitle}
        variant="outlined"
        label="Header Page Title"
        value={config.homeHeaderTitle}
        onChange={(e) => updateConfig({ homeHeaderTitle: e.target.value })}
        style={{ marginBottom: 20 }}
        InputLabelProps={{
          shrink: true,
        }}
      />
      <div style={{ display: "flex", flexDirection: "row", marginBottom: 20 }}>
        <TextField
          fullWidth
          data-cy="homeHeaderLogo"
          data-test={config.homeHeaderLogo}
          variant="outlined"
          label="Logo Image Url"
          value={config.homeHeaderLogo}
          onChange={(e) => updateConfig({ homeHeaderLogo: e.target.value })}
          InputLabelProps={{
            shrink: true,
          }}
        />
        <img
          data-cy="image-thumbnail"
          className={styles.thumbnail}
          src={config.homeHeaderLogo}
          onClick={() => {
            window.open(config.homeHeaderLogo || "", "_blank");
          }}
        />
      </div>
      <TextField
        fullWidth
        data-cy="homeHeaderLogoUrl"
        data-test={config.homeHeaderLogoUrl}
        variant="outlined"
        label="Logo Link Url"
        value={config.homeHeaderLogoUrl}
        onChange={(e) => updateConfig({ homeHeaderLogoUrl: e.target.value })}
        style={{ marginBottom: 20 }}
        InputLabelProps={{
          shrink: true,
        }}
      />
      <TextField
        fullWidth
        data-cy="homeHeaderText"
        data-test={config.homeHeaderText}
        variant="outlined"
        label="Logo Text/Org Abbreviation"
        value={config.homeHeaderText}
        onChange={(e) => updateConfig({ homeHeaderText: e.target.value })}
        style={{ marginBottom: 20 }}
        InputLabelProps={{
          shrink: true,
        }}
      />
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
        <div>
          <Typography
            variant="subtitle1"
            data-cy="homeHeaderTextColor"
            data-test={config.homeHeaderTextColor}
          >
            Header Text Color: {config.homeHeaderTextColor}
          </Typography>
          <SketchPicker
            color={config.homeHeaderTextColor}
            onChangeComplete={(color: { hex: string }) =>
              updateConfig({ homeHeaderTextColor: color.hex })
            }
          />
        </div>
        <div>
          <Typography
            variant="subtitle1"
            data-cy="homeHeaderColor"
            data-test={config.homeHeaderColor}
          >
            Header Color: {config.homeHeaderColor}
          </Typography>
          <SketchPicker
            color={config.homeHeaderColor}
            onChangeComplete={(color: { hex: string }) =>
              updateConfig({ homeHeaderColor: color.hex })
            }
          />
        </div>
      </div>
    </div>
  );
}