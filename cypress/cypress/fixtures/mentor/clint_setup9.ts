import { Mentor } from "../../support/types";
import clint_prev from "./clint_setup8";

export const mentor: Partial<Mentor> = {
  ...clint_prev,
  lastTrainedAt: "Today",
}
export default mentor;
