import { Mentor, Status } from "../../support/types";
import {  updateAnswer } from "../helpers";
import clint_prev from "./clint_setup4";

export const mentor: Mentor =  updateAnswer(clint_prev, "A1_1_1", {
  "video": "https://video.mentorpal.org/videos/mentors/clint/web/clintanderson_A1_1_1.mp4",
  "transcript": "My name is Clint Anderson and I'm a Nuclear Electrician's Mate",
  "status": Status.COMPLETE
});
export default mentor;
