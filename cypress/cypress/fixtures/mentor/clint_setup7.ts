import { updateMentorAnswer } from "../../support/helpers";
import { Mentor, Status } from "../../support/types";
import clint_prev from "./clint_setup6";

export const mentor: Mentor = updateMentorAnswer(clint_prev, "A4_1_1", {
  "transcript": "My name is Clint Anderson I'm a Nuclear Electrician's Mate",
  status: Status.COMPLETE,
});
export default mentor;
