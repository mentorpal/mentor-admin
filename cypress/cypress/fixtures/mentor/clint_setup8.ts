import { Status } from "../../support/types";
import {  updateAnswer } from "../helpers";
import clint_prev from "./clint_setup7";

export const mentor =  updateAnswer(clint_prev, "A5_1_1", {
  "video": "https://video.mentorpal.org/videos/mentors/clint/web/clintanderson_A5_1_1.mp4",
  "transcript": "I couldn't understand the question. Try asking me something else.",
  status: Status.COMPLETE,
});
export default mentor;
