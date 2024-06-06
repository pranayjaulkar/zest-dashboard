import { getRandomNumber } from "@/lib/utils";
import { create } from "zustand";

interface useLoadingBarStoreProps {
  progress: number;
  setProgress: (progress: number) => void;
  start: () => void;
  done: () => void;
}
function setIntervalIncrement(prevState: useLoadingBarStoreProps) {
  let randomNumber = getRandomNumber(5, 15);
  if (prevState.progress < 80)
    return { progress: prevState.progress + randomNumber };
  else return { progress: prevState.progress };
}

let intervalId: any;
export const useLoadingBarStore = create<useLoadingBarStoreProps>((set) => ({
  progress: 15,
  setProgress: (n) => set({ progress: n }),
  start: () => {
    set((prevProgress) => {
      if (prevProgress.progress === 0) return { progress: 20 };
      else {
        clearInterval(intervalId);
        return { progress: 20 };
      }
    });
    intervalId = setInterval(() => {
      set((prevState) => setIntervalIncrement(prevState));
    }, 400);
  },
  done: () => {
    clearInterval(intervalId);
    set({ progress: 100 });
  },
}));
