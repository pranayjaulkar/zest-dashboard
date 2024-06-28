import { Store } from "@prisma/client";
import SettingsForm from "./components/SettingsForm";
import prisma from "@/prisma/client";

export default async function SettingsPage({ params }: { params: { storeId: string } }) {
  const store: Store | null = await prisma.store.findFirst({ where: { id: params.storeId } });

  return (
    <div className="flex-col max-w-screen-xl mx-auto ">
      <SettingsForm initialData={store} />
    </div>
  );
}
