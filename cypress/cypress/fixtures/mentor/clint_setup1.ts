import { Mentor } from "../../support/types";
import clint_prev from "./clint_new"

export const mentor: Partial<Mentor> = {
  ...clint_prev,
  firstName: "Clint"
}
export default mentor;