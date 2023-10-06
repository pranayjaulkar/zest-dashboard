import Navbar from "@/components/Navbar/Navbar";
import {
  SignedInAuthObject,
  SignedOutAuthObject,
  auth,
} from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
type Props = {
  children: React.ReactNode;
  params: { storeId: string };
};

export default async function DashboardLayout({ children }: Props) {
  const { userId }: SignedInAuthObject | SignedOutAuthObject = auth();
  if (!userId) {
    redirect("/sign-in");
  }
  return (
    <div>
      <Navbar />
      {children}
    </div>
  );
}
