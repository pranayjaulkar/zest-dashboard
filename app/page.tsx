"use client";
import { UserButton } from "@clerk/nextjs";
import { useStoreModal } from "@/hooks/useStoreModalStore";
import { useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const onOpen = useStoreModal((state) => state.onOpen);
  const isOpen = useStoreModal((state) => state.isOpen);
  useEffect(() => {
    if (!isOpen) {
      onOpen();
    }
  }, [isOpen, onOpen]);

  return (
    <div className="h-[50%] w-full flex flex-col justify-center items-center space-y-4 ">
      <h1>Root Page</h1>
      <Link href="/sign-in">Sign in</Link>
      <Link href="/sign-up">Sign up</Link>
      <UserButton afterSignOutUrl="/" />
    </div>
  );
}
