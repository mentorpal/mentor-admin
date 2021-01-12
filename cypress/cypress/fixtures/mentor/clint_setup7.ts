import { Mentor, Status } from "../../support/types";
import { updateQuestion } from "../helpers";
import clint_prev from "./clint_setup6";

export const mentor: Mentor = updateQuestion(clint_prev, "A4_1_1", {
  "video": "https://video.mentorpal.org/videos/mentors/clint/web/clintanderson_A4_1_1.mp4",
  "transcript": "My name is Clint Anderson I'm a Nuclear Electrician's Mate",
  status: Status.COMPLETE,
});
export default mentor;
