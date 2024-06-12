"use client";
import { useEffect, useState } from "react";
import CreateModal from "@/components/modals/CreateModal";

export default function CreateModalProvider() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return <CreateModal />;
}
