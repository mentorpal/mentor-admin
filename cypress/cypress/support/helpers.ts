import {
  Mentor,
  MentorType,
  Question,
  QuestionType,
  Subject,
  SubjectQuestion,
} from "./types";

export function completeMentor(m: Partial<Mentor>): Mentor {
  return {
    ...m,
    _id: m._id || "",
    name: m.name || "",
    firstName: m.firstName || "",
    title: m.title || "",
    mentorType: (m.mentorType || MentorType.VIDEO) as MentorType,
    lastTrainedAt: m.lastTrainedAt || "",
    subjects: m.subjects || [],
    topics: m.topics || [],
    answers: m.answers || [],
    questions: m.questions || [],
  };
}

export function completeQuestion(q: Partial<Question>): Question {
  return {
    ...q,
    _id: q._id || "",
    question: q.question || "",
    name: q.name || "",
    type: q.type || QuestionType.QUESTION,
    paraphrases: q.paraphrases || [],
  };
}

export function completeSubjectQuestion(
  q: Partial<SubjectQuestion>
): SubjectQuestion {
  return {
    ...q,
    question: completeQuestion(q.question || {}),
    topics: q.topics || [],
  };
}

export function completeSubject(s: Partial<Subject>): Subject {
  return {
    ...s,
    _id: s._id || "",
    name: s.name || "",
    description: s.description || "",
    categories: s.categories || [],
    topics: s.topics || [],
    questions: s.questions || [],
  };
}

export function updateMentorAnswer(
  mentor: Mentor,
  answerId: string,
  update: any
): Mentor {
  return {
    ...mentor,
    answers: mentor.answers.map((answer) => {
      if (answer._id === answerId) {
        return {
          ...answer,
          ...update,
        };
      } else {
        return answer;
      }
    }),
  };
}

export function updateSubjectQuestion(
  subject: Partial<Subject>,
  questionId: string,
  update: any
): Partial<Mentor> {
  return {
    ...subject,
    questions: subject.questions.map((subjectQuestion) => {
      if (subjectQuestion.question._id === questionId) {
        return {
          ...subjectQuestion,
          ...update,
        };
      } else {
        return subjectQuestion;
      }
    }),
  };
}
