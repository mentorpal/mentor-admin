import { useAppSelector, useAppDispatch } from "store/hooks";
import { uploadInitStarted, uploadInitCompleted } from ".";

export interface UseWithUploadInitStatusActions{
  newUploadInitCompleted: (uploadId: string) => void;
  newUploadInitStarted: (uploadId: string) => void;
}

export function useWithUploadInitStatusActions(): UseWithUploadInitStatusActions{
  const dispatch = useAppDispatch();

  function newUploadInitStarted(uploadId: string){
    dispatch(uploadInitStarted(uploadId))
  }

  function newUploadInitCompleted(uploadId: string){
    dispatch(uploadInitCompleted(uploadId));
  }

  return{
    newUploadInitCompleted,
    newUploadInitStarted
  }
}