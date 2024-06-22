import { create } from "zustand";

interface CreateModalStore {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  cancel: boolean;
  setCancel: (value: boolean) => void;
  closable: boolean;
  setClosable: (value: boolean) => void;
}

export const useCreateModalStore = create<CreateModalStore>((set) => ({
  isOpen: false,
  cancel: true,
  closable: true,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  setClosable: (value: boolean) => set({ closable: value }),
  setCancel: (value: boolean) => set({ cancel: value }),
}));
