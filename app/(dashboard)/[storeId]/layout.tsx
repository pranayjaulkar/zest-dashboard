import { useState } from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";

type Props = {
  children: React.ReactNode;
  params: { storeId: string };
};

export default async function DashboardLayout({ children, params }: Props) {
  const { userId } = auth();
  if (!userId) {
    redirect("/sign-in");
  }
  const store = await prismadb.store.findFirst({
    where: {
      id: params.storeId,
      userId,
    },
  });
  return <div></div>;
}
