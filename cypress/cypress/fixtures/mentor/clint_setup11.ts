import { Mentor, Status } from "../../support/types";
import {  updateAnswer } from "../helpers";
import clint_prev from "./clint_setup10";

export const mentor: Mentor =  updateAnswer(clint_prev, "A7_1_1", {
  "transcript": "I had to throw a man overboard once.",
  status: Status.COMPLETE,
});
export default mentor;
