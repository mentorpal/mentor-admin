import { Mentor, Status } from "../../support/types";
import { updateQuestion } from "../helpers";
import clint_prev from "./clint_setup4";

export const mentor: Mentor = updateQuestion(clint_prev, "A1_1_1", {
  "video": "https://video.mentorpal.org/videos/mentors/clint/web/clintanderson_A1_1_1.mp4",
  "transcript": "My name is Clint Anderson and I'm a Nuclear Electrician's Mate",
  "recordedAt": "",
  "status": Status.COMPLETE
});
export default mentor;
