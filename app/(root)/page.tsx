"use client";
import { useStoreModal } from "@/hooks/useStoreModalStore";
import { useEffect } from "react";

const findUser = () => {
  return async () => {};
};

export default function Home() {
  const onOpen = useStoreModal((state) => state.onOpen);
  const isOpen = useStoreModal((state) => state.isOpen);
  useEffect(() => {
    onOpen();
  }, [onOpen]);

  return null;
}
