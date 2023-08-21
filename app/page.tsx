"use client";
import { UserButton } from "@clerk/nextjs";
import { useStoreModal } from "@/hooks/useStoreModalStore";
import { useEffect } from "react";

export default function Home() {
  const onOpen = useStoreModal((state) => state.onOpen);
  const isOpen = useStoreModal((state) => state.isOpen);
  useEffect(() => {
    if (!isOpen) {
      // onOpen();
    }
  }, [isOpen, onOpen]);

  return <>Root Page</>;
}
