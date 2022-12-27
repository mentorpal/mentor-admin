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

export function FooterStyles(props: {
  styles: Record<string, string>;
  config: Config;
  updateConfig: (c: Partial<Config>) => void;
}): JSX.Element {
  const { styles, config, updateConfig } = props;

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
        <div>
          <Typography
            variant="subtitle1"
            data-cy="homeFooterColor"
            data-test={config.homeFooterColor}
          >
            Footer Color: {config.homeFooterColor}
          </Typography>
          <SketchPicker
            color={config.homeFooterColor}
            onChangeComplete={(color: { hex: string }) =>
              updateConfig({ homeFooterColor: color.hex })
            }
          />
        </div>
        <div>
          <Typography
            variant="subtitle1"
            data-cy="homeFooterTextColor"
            data-test={config.homeFooterTextColor}
          >
            Footer Text Color: {config.homeFooterTextColor}
          </Typography>
          <SketchPicker
            color={config.homeFooterTextColor}
            onChangeComplete={(color: { hex: string }) =>
              updateConfig({ homeFooterTextColor: color.hex })
            }
          />
        </div>
      </div>
    </div>
  );
}