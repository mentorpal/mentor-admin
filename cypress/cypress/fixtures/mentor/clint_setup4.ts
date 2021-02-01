import { Mentor, Status } from "../../support/types";
import { updateAnswer } from "../helpers";
import clint_prev from "./clint_setup3";

export const mentor: Mentor = updateAnswer(clint_prev, "A3_1_1", {
  video:
    "https://video.mentorpal.org/videos/mentors/clint/web/clintanderson_A3_1_1.mp4",
  status: Status.COMPLETE,
});
export default mentor;
