import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import StoreSwitcher from "@/components/Navbar/components/StoreSwitcher";
import NavLinks from "@/components/Navbar/components/NavLinks";
import prisma from "@/prisma/client";
import { redirect } from "next/navigation";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default async function Navbar() {
  const { userId } = auth();

  const stores = await prisma.store.findMany({
    where: {
      userId: userId || "",
    },
  });

  if (!stores.length) {
    redirect("/");
  }

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <StoreSwitcher items={stores} />
        <NavLinks stores={stores} className="mx-6" />
        <div className="ml-auto flex items-center space-x-4">
          <ThemeToggle />
          <UserButton />
        </div>
      </div>
    </div>
  );
}
