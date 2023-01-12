/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import * as React from "react";
import Box from "@mui/material/Box";
import "../styles/layout.css";
import TextField from "@mui/material/TextField";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Button, CircularProgress, Typography } from "@mui/material";
import AlertPopUp, { AlertTypes } from "components/lrs-reports/alert";
import {
  generateReportForAllUsers,
  reportToCsv,
  userQuestionsToCSV,
} from "lrs-helpers";
import { useWithUserQuestions } from "hooks/lrs-reports/use-with-user-questions";
import { useWithMergeReport } from "hooks/lrs-reports/use-with-merge-report";
import { useWithStatements } from "hooks/lrs-reports/use-with-statements";
import withLocation from "wrap-with-location";
import withAuthorizationOnly from "hooks/wrap-with-authorization-only";
import { useWithLogin } from "store/slices/login/useWithLogin";
import { canEditContent } from "helpers";

function LRSReportsPage(): JSX.Element {
  const [startDate, setStartDate] = React.useState<string>("");
  const [endDate, setEndDate] = React.useState<string>("");
  const [loadInProgress, setLoadInProgress] = React.useState<boolean>(false);
  const [reportAlert, setReportAlert] = React.useState<boolean>(false);
  const [noReportAlert, setNoReportAlert] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string>("");
  const { getStatements, xApiLoaded } = useWithStatements();
  const { fetchUserQuestions } = useWithUserQuestions();
  const { handleMergeReport } = useWithMergeReport();
  const { state } = useWithLogin();
  const editPermission = canEditContent(state.user);

  const delay = (ms: number | undefined) =>
    new Promise((res) => setTimeout(res, ms));

  React.useEffect(() => {
    if (reportAlert) {
      delay(3000).then(() => {
        setReportAlert(false);
      });
    }
  }, [reportAlert]);

  React.useEffect(() => {
    if (noReportAlert) {
      delay(3000).then(() => {
        setNoReportAlert(false);
      });
    }
  }, [noReportAlert]);

  React.useEffect(() => {
    if (errorMessage) {
      delay(3000).then(() => {
        setErrorMessage("");
      });
    }
  }, [errorMessage]);

  if (!editPermission) {
    return (
      <div>You must be an admin or content manager to view this page.</div>
    );
  }

  if (!xApiLoaded) {
    return (
      <div className="app-container" data-cy="app-container">
        <Typography variant="h6" style={{ marginBottom: 30, color: "#868686" }}>
          Mentorpal LRS Report
        </Typography>
        <CircularProgress />
      </div>
    );
  }

  const handleDownloadLrsReport = async () => {
    if (!startDate || !endDate) {
      return;
    }
    const statements = await getStatements(startDate, endDate);
    if (!statements) {
      console.error("No statements loaded");
      return;
    }
    if (!statements.length) {
      setNoReportAlert(true);
      return;
    }
    setReportAlert(true);
    const reportEntries = generateReportForAllUsers(statements);
    reportToCsv(reportEntries);
  };

  const handleDownloadUserQuestions = async () => {
    if (!startDate || !endDate) {
      return;
    }
    const userQuestions = await fetchUserQuestions(startDate, endDate);
    if (!userQuestions) {
      return;
    }
    if (!userQuestions.length) {
      setNoReportAlert(true);
      return;
    }
    setReportAlert(true);
    userQuestionsToCSV(userQuestions);
  };

  const handleDownloadMergedReport = async () => {
    if (!startDate || !endDate) {
      return;
    }
    const reportEntries = await handleMergeReport(startDate, endDate);
    if (!reportEntries) {
      return;
    }
    if (!reportEntries.length) {
      setNoReportAlert(true);
      return;
    }
    setReportAlert(true);
    reportToCsv(reportEntries);
  };

  return (
    <div className="app-container" data-cy="app-container">
      <Typography variant="h6" style={{ marginBottom: 30, color: "#868686" }}>
        Mentorpal LRS Report
      </Typography>

      <Box className="form-wrapper" data-cy="form-container">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Start date"
            value={startDate}
            onChange={(newValue) => {
              setStartDate(newValue || "");
            }}
            renderInput={(params) => (
              <TextField data-cy="start-date-input" {...params} />
            )}
          />
        </LocalizationProvider>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="End date"
            value={endDate}
            onChange={(newValue) => {
              setEndDate(newValue || "");
            }}
            renderInput={(params) => (
              <TextField data-cy="end-date-input" {...params} />
            )}
          />
        </LocalizationProvider>
      </Box>

      {loadInProgress ? (
        <>
          <CircularProgress />
          <br />
          This could take a minute...
        </>
      ) : (
        <>
          <Button
            variant="outlined"
            style={{
              marginTop: 30,
              border: "1px solid #868686",
              color: "#868686",
            }}
            data-cy="submit-btn"
            onClick={() => {
              setLoadInProgress(true);
              handleDownloadLrsReport()
                .catch((err) => {
                  console.error(err);
                  setErrorMessage(
                    `Error occured when downloading LRS report: ${JSON.stringify(
                      err
                    )}`
                  );
                })
                .finally(() => setLoadInProgress(false));
            }}
          >
            Download LRS Statements
          </Button>

          <Button
            variant="outlined"
            style={{
              marginTop: 30,
              border: "1px solid #868686",
              color: "#868686",
            }}
            data-cy="submit-btn"
            onClick={() => {
              setLoadInProgress(true);
              handleDownloadUserQuestions()
                .catch((err) => {
                  setErrorMessage(
                    `Error occured when downloading user questions: ${JSON.stringify(
                      err
                    )}`
                  );
                })
                .finally(() => setLoadInProgress(false));
            }}
          >
            Download User Questions
          </Button>

          <Button
            variant="outlined"
            style={{
              marginTop: 30,
              border: "1px solid #868686",
              color: "#868686",
            }}
            data-cy="submit-btn"
            onClick={() => {
              setLoadInProgress(true);

              handleDownloadMergedReport()
                .catch((err) => {
                  setErrorMessage(
                    `Error occured when downloading merged report: ${JSON.stringify(
                      err
                    )}`
                  );
                })
                .finally(() => setLoadInProgress(false));
            }}
          >
            Download Merged Report
          </Button>
        </>
      )}

      {errorMessage ? (
        <AlertPopUp type={AlertTypes.ERROR} message={errorMessage} />
      ) : null}

      {noReportAlert ? (
        <AlertPopUp
          type={AlertTypes.WARNING}
          message={"No documents found for this date range."}
        />
      ) : null}
      {reportAlert ? (
        <AlertPopUp type={AlertTypes.SUCCESS} message={"Report Created!"} />
      ) : null}
    </div>
  );
}

export default withAuthorizationOnly(withLocation(LRSReportsPage));
