import { useAppDispatch } from "store/hooks";
import { startedPolling, stoppedPolling, uploadsInProgress } from ".";
import { UploadTask } from "types";

export interface UseWithUploadStatusActions {
  pollingStarted: () => void;
  pollingEnded: () => void;
  newUploadsData: (uploads: UploadTask[]) => void;
}

export function useWithUploadStatusActions(): UseWithUploadStatusActions {
  const dispatch = useAppDispatch();

  function pollingStarted() {
    dispatch(startedPolling());
  }

  function pollingEnded() {
    dispatch(stoppedPolling());
  }

  function newUploadsData(uploads: UploadTask[]) {
    dispatch(uploadsInProgress(uploads));
  }

  return {
    pollingStarted,
    pollingEnded,
    newUploadsData,
  };
}
