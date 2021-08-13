import { fetchFollowUpQuestions } from "api";
import { navigate } from "gatsby";
import { copyAndRemove, copyAndSet } from "helpers";
import { useState } from "react";
import { useEffect } from "react";
import { useWithLogin } from "store/slices/login/useWithLogin";
import { useWithMentor } from "store/slices/mentor/useWithMentor";
import { Answer, Mentor, QuestionType, Status, SubjectQuestion, UtteranceName } from "types";
import { v4 as uuid } from "uuid";


export interface UseWithFollowups{
  followUpQuestions: string[];
  saveAndLoadNewFollowups: (followups: string[]) => void;
  mentor: Mentor | undefined
}

export interface newQuestion{
  question: string;
  questionId: string;
  answerId: string;
}

export function useWithFollowups(props: {
  categoryId: string,
  subjectId: string,
}): UseWithFollowups {
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const [toRecordFollowUpQs, setToRecordFollowUpQs] = useState<boolean>(false);
  const [newQuestionIds, setNewQuestionIds] = useState<string[]>([]);
  const {mentor, editedMentor, editMentor, isMentorSaving, isMentorEdited, saveMentorSubjects } = useWithMentor();
  const {state} = useWithLogin();
  const {categoryId, subjectId} = props;
  const curSubject = mentor?.subjects.find(
    (s) => s._id == subjectId
  );
  const curCategory = curSubject?.categories.find((c) => c.id == categoryId)

  //TODO: be sure that fetch is getting called once 
  useEffect(()=>{
    if(!state.accessToken || !mentor || followUpQuestions?.length)
      return;
    fetch(mentor, state.accessToken);
  }, [mentor, state])

  useEffect(()=>{
    if(!isMentorEdited)
      return;
    console.log("triggering a save with edited mentor: ", editedMentor);
    saveMentorSubjects()
  }, [isMentorEdited])

  useEffect(()=>{
    console.log("in isMentorLoading useEffect")
    console.log("toRecordFollowUpQs: ", toRecordFollowUpQs)
    console.log("isMentorSaving: ", isMentorSaving)
    if(!toRecordFollowUpQs || isMentorSaving)
      return;
    console.log("triggered new record")
    let url = `/record?videoId=`
    newQuestionIds.forEach((questionId)=>{url += (questionId !== newQuestionIds[newQuestionIds.length-1] ? questionId + "," : questionId)})
    console.log(url)
    navigate(url)
  }, [isMentorSaving])

  function fetch(mentor: Mentor, accessToken: string){
    fetchFollowUpQuestions(categoryId, accessToken).then((data) => {
      let followUps = data
        ? data.map((d) => {
            return d.question;
          })
        : [];
      followUps = followUps.filter(
        (followUp) =>
          mentor.answers.findIndex((a) => a.question.question === followUp) ===
          -1
      );
      if(!followUps.length)
        navigate("/")
      else
        setFollowUpQuestions(followUps);
    }).catch((err)=>{
      console.error(err)
      navigate("/")
    })
  }

  function saveAndLoadNewFollowups(followups: string[]){
    if(!mentor || !curSubject || !curCategory){
      return
    }
    const subjectIdx = mentor.subjects.findIndex((s)=>s._id === curSubject._id)
    if(subjectIdx === -1)
      return; //TODO: should also navigate, since it failed to find the current subject in the mentor?
    setToRecordFollowUpQs(true);
    const newQuestions: SubjectQuestion[] = followups.map((followUp)=>{
      return  {question: {
        _id: uuid(),
        question: followUp,
        paraphrases: [],
        type: QuestionType.QUESTION,
        name: UtteranceName.NONE,
        mentor: mentor._id,
      },
      category: curCategory,
      topics: [],
    }})
    setNewQuestionIds(newQuestions.map((newQuestion)=>newQuestion.question._id))
    const newAnswers: Answer[] = newQuestions.map((newQuestion)=>{
      return {
        _id: uuid(),
        question: newQuestion.question,
        transcript: "",
        status: Status.INCOMPLETE,
        media: undefined,
        hasUntransferredMedia: false,
      }
    })
    console.log("new question to add: ", newQuestions)
    console.log("what subjects questions SHOULD be getting set to: ", [...newQuestions, ...curSubject.questions])
    editMentor({
      subjects: copyAndSet(mentor.subjects, subjectIdx, {
        ...mentor.subjects[subjectIdx],
        questions: [...newQuestions, ...curSubject.questions],
      }),
      answers: [...newAnswers, ...mentor.answers],
    })
  }



  return{
    followUpQuestions,
    saveAndLoadNewFollowups,
    mentor
  }
}