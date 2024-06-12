import prisma from "@/prisma/client";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function SetupPage({ children }: { children: React.ReactNode }) {
  const { userId } = auth();

  const store = await prisma.store.findFirst({ where: { userId: userId || "" } });
  // if store exists then redirect to store
  // if store does not exist then show create store modal dialog
  // when the component is mounted on the client side using 
  // useEffect which is inside the corresponding page.tsx
  if (store) {
    redirect(`/${store.id}`);
  }
  return <>{children}</>;
}
