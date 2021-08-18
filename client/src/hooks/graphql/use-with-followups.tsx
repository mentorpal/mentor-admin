import { fetchFollowUpQuestions, updateSubject } from "api";
import { navigate } from "gatsby";
import { copyAndSet, equals } from "helpers";
import { useState } from "react";
import { useEffect } from "react";
import { useWithLogin } from "store/slices/login/useWithLogin";
import { useWithMentor } from "store/slices/mentor/useWithMentor";
import { Answer, Mentor, QuestionType, Status, Subject, SubjectQuestion, UtteranceName } from "types";
import { v4 as uuid } from "uuid";
import { useWithSubject } from "./use-with-subject";


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
  const [toRecordFollowUpQs, setToRecordFollowUpQs] = useState<string[]>([]);
  const {state} = useWithLogin();
  const {mentor, isMentorLoading} = useWithMentor();
  const {editData, editedData, data: subjectData, isSaving: isSubjectSaving, isLoading: isSubjectLoading, isEdited: isSubjectEdited, saveSubject, reloadData: reloadSubject} = useWithSubject(props.subjectId, state.accessToken || "");
  const {categoryId, subjectId} = props;
  const curSubject = mentor?.subjects.find(
    (s) => s._id == subjectId
  );
  const curCategory = curSubject?.categories.find((c) => c.id == categoryId)

  //TODO: 
  useEffect(()=>{
    if(!state.accessToken || !subjectData || followUpQuestions?.length)
      return;
    fetch(subjectData, state.accessToken);
  }, [subjectData, state])

  useEffect(()=>{
    if(!isSubjectEdited || !editedData)
      return;
    console.log("triggering a save with edited subject: ", subjectData);
    saveSubject().then(()=>{
      reloadSubject();
    })
  }, [isSubjectEdited])

  useEffect(()=>{
    console.log("in isMentorLoading useEffect")
    console.log("toRecordFollowUpQs: ", toRecordFollowUpQs)
    console.log("isMentorLoading: ", isMentorLoading)
    if(!toRecordFollowUpQs.length || isMentorLoading || !mentor || !curSubject)
      return;
    console.log("curSubject should be updated with new question at this point: ", curSubject)
    var newQuestionIds = curSubject.questions.reduce(function(result: string[], question) {
      const index = toRecordFollowUpQs.findIndex((followup) =>followup === question.question.question)
      if (index !== -1 && question.question.mentor === mentor._id) {
        result.push(question.question._id);
      }
      return result;
    }, []);
    console.log("new question ids: " + newQuestionIds);

    if(newQuestionIds && newQuestionIds.length){
      console.log("triggered new record")
      let url = `/record?videoId=`
      newQuestionIds.forEach((questionId)=>{if(!newQuestionIds) return; url += (questionId !== newQuestionIds[newQuestionIds.length-1] ? questionId + "," : questionId)})
      console.log(url)
      navigate(url)
    }
  }, [isMentorLoading])

  function fetch(subjectData: Subject, accessToken: string){
    console.log(subjectData)
    fetchFollowUpQuestions(categoryId, accessToken).then((data) => {
      let followUps = data
        ? data.map((d) => {
            return d.question;
          })
        : [];
      followUps = followUps.filter(
        (followUp) =>
        subjectData.questions.findIndex((q) => q.question.question === followUp) ===
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
    if(!editedData || !curCategory || !mentor){
      return
    }
    setToRecordFollowUpQs(followups);
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
    editData({
      questions:[
        ...editedData.questions,
        ...newQuestions
      ]
    })
  }



  return{
    followUpQuestions,
    saveAndLoadNewFollowups,
    mentor
  }
}


