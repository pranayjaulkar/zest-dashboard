import { create } from "zustand";

interface useLoadingBarStoreProps {
  progress: number;
  setProgress: (progress: number) => void;
  start: () => void;
  done: () => void;
}

function getRandomNumber(min: number, max: number) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}

function setIntervalIncrement(prevState: useLoadingBarStoreProps) {
  let randomNumber = getRandomNumber(5, 20);
  console.log("randomNumber: ", randomNumber);
  if (prevState.progress < 80)
    return { progress: prevState.progress + randomNumber };
  else return { progress: prevState.progress };
}

let intervalId: any;
export const useLoadingBarStore = create<useLoadingBarStoreProps>((set) => ({
  progress: 0,
  setProgress: (n) => set({ progress: n }),
  start: () => {
    set({ progress: 20 });
    intervalId = setInterval(() => {
      set((prevState) => setIntervalIncrement(prevState));
    }, 3000);
  },
  done: () => {
    clearInterval(intervalId);
    set({ progress: 100 });
  },
}));
