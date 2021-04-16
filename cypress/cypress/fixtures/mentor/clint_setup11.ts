import { updateMentorAnswer } from "../../support/helpers";
import { Mentor, Status } from "../../support/types";
import clint_prev from "./clint_setup10";

export const mentor: Partial<Mentor> =  updateMentorAnswer(clint_prev, "A7_1_1", {
  "transcript": "I had to throw a man overboard once.",
  status: Status.COMPLETE,
});
export default mentor;
