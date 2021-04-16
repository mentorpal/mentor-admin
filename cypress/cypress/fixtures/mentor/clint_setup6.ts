import { updateMentorAnswer } from "../../support/helpers";
import { Mentor, Status } from "../../support/types";
import clint_prev from "./clint_setup5";

export const mentor: Partial<Mentor> =  updateMentorAnswer(clint_prev, "A2_1_1", {
  "transcript": "I'm 37 years old",
  "status": Status.COMPLETE
});
export default mentor;
