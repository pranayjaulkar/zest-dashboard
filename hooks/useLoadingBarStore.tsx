import { getRandomNumber } from "@/lib/utils";
import { create } from "zustand";

interface LoadingBarStore {
  progress: number;
  setProgress: (progress: number) => void;
  start: () => void;
  done: () => void;
}
function increaseProgress(prev: LoadingBarStore) {
  if (prev.progress < 80) return { progress: prev.progress + getRandomNumber(5, 35) };
  else return { progress: prev.progress };
}

let intervalId: any;
export const useLoadingBarStore = create<LoadingBarStore>((set) => ({
  progress: 0,
  setProgress: (num) => set({ progress: num }),
  // start() method starts the loading bar
  // use when manually redirecting to a page.
  // when manually redirecting dont call done() method.
  // it will be called automatically when the route changes.
  start: () => {
    // if loading bar is already started then clear the previous
    // loading bar progress and restart loading bar
    // this case is for when start() method is called multiple times
    // before the previous is finished
    clearInterval(intervalId);
    set({ progress: 15 });
    // increase progress by 5-15 every 400 milliseconds
    // store intervalId
    intervalId = setInterval(() => {
      set((prev) => increaseProgress(prev));
    }, 1500);
  },

  // call this method after start when you want to
  // display the loading bar but dont want to change the route
  done: () => {
    clearInterval(intervalId);
    set({ progress: 100 });
  },
}));
