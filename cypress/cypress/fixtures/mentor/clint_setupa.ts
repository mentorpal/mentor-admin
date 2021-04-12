import { Mentor, MentorType } from "../../support/types";

export const mentor: Partial<Mentor> = {
  _id: "clintanderson",
  name: "",
  firstName: "",
  title: "",
  mentorType: MentorType.CHAT,
  lastTrainedAt: "",
  topics: [],
  subjects: [],
  questions: [],
  answers: [],
};
export default mentor;