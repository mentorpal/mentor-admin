import { updateMentorAnswer } from "../../support/helpers";
import { Mentor, Status } from "../../support/types";
import clint_prev from "./clint_setup4";

export const mentor: Partial<Mentor> =  updateMentorAnswer(clint_prev, "A1_1_1", {
  "transcript": "My name is Clint Anderson and I'm a Nuclear Electrician's Mate",
  "status": Status.COMPLETE
});
export default mentor;
