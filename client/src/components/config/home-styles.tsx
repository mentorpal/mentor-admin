/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import { SketchPicker } from "react-color";
import { makeStyles, TextField, Typography } from "@material-ui/core";

import { Config } from "types";
import { ImageTutorials } from "./image-tutorials";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    margin: 0,
  },
  progress: {
    position: "fixed",
    top: "50%",
    left: "50%",
  },
  button: {
    width: 200,
    padding: 5,
    margin: theme.spacing(2),
  },
  tab: {
    width: "95%",
  },
  list: {
    background: "#F5F5F5",
  },
  expand: {
    transform: "rotate(0deg)",
    marginLeft: "auto",
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: "rotate(180deg)",
  },
  thumbnail: {
    boxSizing: "border-box",
    height: 56,
    padding: 5,
  },
}));

export function HomeStyles(props: {
  config: Config;
  updateConfig: (c: Partial<Config>) => void;
}): JSX.Element {
  const styles = useStyles();
  const { config, updateConfig } = props;

  return (
    <div>
      <ImageTutorials text="These settings will customize the look and feel of your home page." />
      <TextField
        fullWidth
        data-cy="styleHeaderTitle"
        data-test={config.styleHeaderTitle}
        variant="outlined"
        label="Header Title"
        helperText="Shows at the top of your home page."
        value={config.styleHeaderTitle}
        onChange={(e) => updateConfig({ styleHeaderTitle: e.target.value })}
        style={{ marginBottom: 20 }}
        InputLabelProps={{
          shrink: true,
        }}
      />
      <TextField
        fullWidth
        data-cy="styleHeaderText"
        data-test={config.styleHeaderText}
        variant="outlined"
        label="Header Text"
        helperText="Shows beside your home page logo."
        value={config.styleHeaderText}
        onChange={(e) => updateConfig({ styleHeaderText: e.target.value })}
        style={{ marginBottom: 20 }}
        InputLabelProps={{
          shrink: true,
        }}
      />

      <div style={{ display: "flex", flexDirection: "row", marginBottom: 20 }}>
        <TextField
          fullWidth
          data-cy="styleHeaderLogo"
          data-test={config.styleHeaderLogo}
          variant="outlined"
          label="Header Logo Image URL"
          helperText="Shows at the top left corner of your home page."
          value={config.styleHeaderLogo}
          onChange={(e) => updateConfig({ styleHeaderLogo: e.target.value })}
          InputLabelProps={{
            shrink: true,
          }}
        />
        <img
          data-cy="image-thumbnail"
          className={styles.thumbnail}
          src={config.styleHeaderLogo}
          onClick={() => {
            window.open(config.styleHeaderLogo || "", "_blank");
          }}
        />
      </div>
      <TextField
        fullWidth
        data-cy="styleHeaderLogoUrl"
        data-test={config.styleHeaderLogoUrl}
        variant="outlined"
        label="Header Logo Link Url"
        helperText="Link that will open upon clicking your logo. Leave empty for no link."
        value={config.styleHeaderLogoUrl}
        onChange={(e) => updateConfig({ styleHeaderLogoUrl: e.target.value })}
        style={{ marginBottom: 20 }}
        InputLabelProps={{
          shrink: true,
        }}
      />

      <div
        style={{ display: "flex", flexDirection: "row", alignItems: "center" }}
      >
        <div>
          <Typography
            variant="subtitle1"
            data-cy="styleHeaderColor"
            data-test={config.styleHeaderColor}
          >
            Header Color: {config.styleHeaderColor}
          </Typography>
          <SketchPicker
            color={config.styleHeaderColor}
            onChangeComplete={(color: { hex: string }) =>
              updateConfig({ styleHeaderColor: color.hex })
            }
          />
        </div>
        <div>
          <Typography
            variant="subtitle1"
            data-cy="styleHeaderTextColor"
            data-test={config.styleHeaderTextColor}
          >
            Header Text Color: {config.styleHeaderTextColor}
          </Typography>
          <SketchPicker
            color={config.styleHeaderTextColor}
            onChangeComplete={(color: { hex: string }) =>
              updateConfig({ styleHeaderTextColor: color.hex })
            }
          />
        </div>
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
          <Typography variant="subtitle1">Text color on footer bar</Typography>
          <SketchPicker
            color={config.homeFooterTextColor}
            onChangeComplete={(color: { hex: string }) =>
              updateConfig({ homeFooterTextColor: color.hex })
            }
          />
        </div>
        <div>
          <Typography
            variant="subtitle1"
            data-cy="homeBannerColor"
            data-test={config.homeBannerColor}
          >
            Banner Color: {config.homeBannerColor}
          </Typography>
          <SketchPicker
            color={config.homeBannerColor}
            onChangeComplete={(color: { hex: string }) =>
              updateConfig({ homeBannerColor: color.hex })
            }
          />
        </div>
        <div>
          <Typography
            variant="subtitle1"
            data-cy="homeBannerButtonColor"
            data-test={config.homeBannerButtonColor}
          >
            Banner Button Color: {config.homeBannerButtonColor}
          </Typography>
          <SketchPicker
            color={config.homeBannerButtonColor}
            onChangeComplete={(color: { hex: string }) =>
              updateConfig({ homeBannerButtonColor: color.hex })
            }
          />
        </div>
        <div>
          <Typography
            variant="subtitle1"
            data-cy="homeCarouselColor"
            data-test={config.homeCarouselColor}
          >
            Carousel Color: {config.homeCarouselColor}
          </Typography>
          <SketchPicker
            color={config.homeCarouselColor}
            onChangeComplete={(color: { hex: string }) =>
              updateConfig({ homeCarouselColor: color.hex })
            }
          />
        </div>
      </div>
    </div>
  );
}
