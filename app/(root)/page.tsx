"use client";
import { useCreateModalStore } from "@/hooks/useCreateModalStore";
import { useEffect } from "react";

export default function Home() {
  const createModal = useCreateModalStore();

  // if no store was found with the account then show create store modal
  // set cancel to false to not show cancel button and set closable to false 
  // to disable closing of modal
  useEffect(() => {
    createModal.setCancel(false);
    createModal.setClosable(false);
    createModal.open();
  }, []);

  return null;
}
