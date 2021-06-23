import { updateMentorAnswer } from "../../support/helpers";
import { Mentor, Status } from "../../support/types";
import clint_prev from "./clint_setup7";

export const mentor: Mentor = updateMentorAnswer(clint_prev, "A5_1_1", {
  transcript:
    "I couldn't understand the question. Try asking me something else.",
  status: Status.COMPLETE,
});
export default mentor;
