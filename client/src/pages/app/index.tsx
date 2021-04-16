import { withPrefix } from "gatsby";
import React from "react";
import { Router } from "@reach/router";

import AuthorQuestions from "components/author/questions";
import AuthorSubject from "components/author/subject";
import AuthorSubjects from "components/author/subjects";
import Feedback from "components/feedback";
import Profile from "components/profile";
import Record from "components/record";
import Setup from "components/setup";
import Subjects from "components/subjects";
import PrivateRoute from "components/private-route";

/**
 * Client-only routes that require an authorized user to access
 */
function App(): JSX.Element {
  return (
    <Router basepath={withPrefix("/app")}>
      <PrivateRoute path="/author/questions" component={AuthorQuestions} />
      <PrivateRoute path="/author/subject" component={AuthorSubject} />
      <PrivateRoute path="/author/subjects" component={AuthorSubjects} />
      <PrivateRoute path="/feedback" component={Feedback} />
      <PrivateRoute path="/profile" component={Profile} />
      <PrivateRoute path="/record" component={Record} />
      <PrivateRoute path="/setup" component={Setup} />
      <PrivateRoute path="/subjects" component={Subjects} />
    </Router>
  );
}

export default App;
