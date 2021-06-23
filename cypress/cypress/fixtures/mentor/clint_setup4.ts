import { updateMentorAnswer } from "../../support/helpers";
import { Mentor, Status } from "../../support/types";
import clint_prev from "./clint_setup3";

export const mentor: Mentor = updateMentorAnswer(clint_prev, "A3_1_1", {
  status: Status.COMPLETE,
});
export default mentor;
