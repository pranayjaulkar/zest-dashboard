import { getRandomNumber } from "@/lib/utils";
import { Store } from "@prisma/client";
import { create } from "zustand";

interface Stores {
  stores: Store[];
  setStores: (stores: Store[]) => void;
}

export const useStores = create<Stores>((set) => ({
  stores: [],
  setStores: (stores: Store[]) => set({ stores }),
}));
