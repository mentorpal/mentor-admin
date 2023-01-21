/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useState } from "react";
import {
  Button,
  Grid,
  IconButton,
  List,
  ListSubheader,
  TextField,
  Theme,
  Typography,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import DeleteIcon from "@mui/icons-material/Delete";
import { Config, Organization } from "types";
import { ColorPicker } from "./color-picker";
import { copyAndRemove, copyAndSet } from "helpers";
import { uploadFooterImg, uploadHeaderImg } from "api";
import { ErrorDialog, LoadingDialog } from "components/dialog";

const useStyles = makeStyles((theme: Theme) => ({
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
  org: Organization | undefined;
  config: Config;
  accessToken: string;
  updateConfig: (c: Partial<Config>) => void;
}): JSX.Element {
  const styles = useStyles();
  const { config, updateConfig } = props;
  const [errorMessage, setErrorMessage] = useState<string>();
  const [uploadInProgress, setUploadInProgress] = useState<boolean>(false);
  const uploadLambdaEndpoint = config.uploadLambdaEndpoint || "";

  const handleHeaderUpload = (file: File) => {
    setErrorMessage("");
    setUploadInProgress(true);
    uploadHeaderImg(file, props.accessToken, uploadLambdaEndpoint, props.org)
      .then((url) => {
        setUploadInProgress(false);
        updateConfig({ styleHeaderLogo: url });
      })
      .catch(() => {
        setUploadInProgress(false);
        setErrorMessage("Failed to upload image");
      });
  };

  const handleFooterUpload = (file: File, idx: number) => {
    setErrorMessage("");
    setUploadInProgress(true);
    uploadFooterImg(
      file,
      idx,
      props.accessToken,
      uploadLambdaEndpoint,
      props.org
    )
      .then((url) => {
        setUploadInProgress(false);
        updateConfig({
          homeFooterImages: copyAndSet(config.homeFooterImages, idx, url),
        });
      })
      .catch(() => {
        setUploadInProgress(false);
        setErrorMessage("Failed to upload image");
      });
  };

  return (
    <div>
      <LoadingDialog title={uploadInProgress ? "Uploading..." : ""} />
      <ErrorDialog
        error={
          errorMessage ? { error: errorMessage, message: "Error" } : undefined
        }
        clearError={() => setErrorMessage(undefined)}
      />
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
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          justifyItems: "center",
          alignContent: "center",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
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
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (!e.target.files?.length) {
              return;
            } else {
              handleHeaderUpload(e.target.files[0]);
            }
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

      <Grid container spacing={5} justifyContent="center">
        <Grid item>
          <Typography
            variant="subtitle1"
            data-cy="styleHeaderColor"
            data-test={config.styleHeaderColor}
          >
            Header Color
          </Typography>
          <ColorPicker
            color={config.styleHeaderColor}
            onChange={(c) => updateConfig({ styleHeaderColor: c })}
          />
        </Grid>
        <Grid item>
          <Typography
            variant="subtitle1"
            data-cy="styleHeaderTextColor"
            data-test={config.styleHeaderTextColor}
          >
            Header Text Color
          </Typography>
          <ColorPicker
            color={config.styleHeaderTextColor}
            onChange={(c) => updateConfig({ styleHeaderTextColor: c })}
          />
        </Grid>
        <Grid item>
          <Typography
            variant="subtitle1"
            data-cy="homeFooterColor"
            data-test={config.homeFooterColor}
          >
            Footer Color
          </Typography>
          <ColorPicker
            color={config.homeFooterColor}
            onChange={(c) => updateConfig({ homeFooterColor: c })}
          />
        </Grid>
        <Grid item>
          <Typography
            variant="subtitle1"
            data-cy="homeFooterTextColor"
            data-test={config.homeFooterTextColor}
          >
            Footer Text Color
          </Typography>
          <ColorPicker
            color={config.homeFooterTextColor}
            onChange={(c) => updateConfig({ homeFooterTextColor: c })}
          />
        </Grid>
        <Grid item>
          <Typography
            variant="subtitle1"
            data-cy="homeBannerColor"
            data-test={config.homeBannerColor}
          >
            Banner Color
          </Typography>
          <ColorPicker
            color={config.homeBannerColor}
            onChange={(c) => updateConfig({ homeBannerColor: c })}
          />
        </Grid>
        <Grid item>
          <Typography
            variant="subtitle1"
            data-cy="homeBannerButtonColor"
            data-test={config.homeBannerButtonColor}
          >
            Banner Button Color
          </Typography>
          <ColorPicker
            color={config.homeBannerButtonColor}
            onChange={(c) => updateConfig({ homeBannerButtonColor: c })}
          />
        </Grid>
        <Grid item>
          <Typography
            variant="subtitle1"
            data-cy="homeCarouselColor"
            data-test={config.homeCarouselColor}
          >
            Carousel Color
          </Typography>
          <ColorPicker
            color={config.homeCarouselColor}
            onChange={(c) => updateConfig({ homeCarouselColor: c })}
          />
        </Grid>
      </Grid>

      <List>
        <ListSubheader>Footer Images</ListSubheader>
        {(config.homeFooterImages || []).map((f, i) => (
          <div
            key={i}
            style={{
              marginBottom: 20,
              display: "flex",
              flexDirection: "row",
              width: "100%",
            }}
          >
            <div style={{ width: "100%" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  justifyItems: "center",
                  alignContent: "center",
                  alignItems: "center",
                  marginBottom: 20,
                  width: "100%",
                }}
              >
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Footer Image"
                  value={f}
                  onChange={(e) =>
                    updateConfig({
                      homeFooterImages: copyAndSet(
                        config.homeFooterImages,
                        i,
                        e.target.value
                      ),
                    })
                  }
                  InputLabelProps={{ shrink: true }}
                />
                <img
                  data-cy="image-thumbnail"
                  className={styles.thumbnail}
                  src={f}
                  onClick={() => window.open(f || "", "_blank")}
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (!e.target.files?.length) {
                      return;
                    } else {
                      handleFooterUpload(e.target.files[0], i);
                    }
                  }}
                />
              </div>
              <TextField
                fullWidth
                variant="outlined"
                label="Footer Image Link"
                value={config.homeFooterLinks[i]}
                onChange={(e) =>
                  updateConfig({
                    homeFooterLinks: copyAndSet(
                      config.homeFooterLinks,
                      i,
                      e.target.value
                    ),
                  })
                }
                InputLabelProps={{ shrink: true }}
              />
            </div>
            <IconButton
              style={{ marginLeft: 5 }}
              onClick={() =>
                updateConfig({
                  homeFooterImages: copyAndRemove(config.homeFooterImages, i),
                  homeFooterLinks: copyAndRemove(config.homeFooterLinks, i),
                })
              }
              size="large"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </div>
        ))}
        <Button
          variant="outlined"
          disabled={config.homeFooterImages?.length >= 4}
          onClick={() =>
            updateConfig({
              homeFooterImages: [...(config.homeFooterImages || []), ""],
              homeFooterLinks: [...(config.homeFooterLinks || []), ""],
            })
          }
        >
          Add Footer Image
        </Button>
      </List>
    </div>
  );
}
