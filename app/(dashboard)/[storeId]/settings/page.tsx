import { Store } from "@prisma/client";
import SettingsForm from "./components/SettingsForm";
import prismadb from "@/lib/prismadb";

export default async function SettingsPage({
  params,
}: {
  params: { storeId: string };
}) {
  const store: Store | null = await prismadb.store.findFirst({
    where: { id: params.storeId },
  });
  return (
    <div className="mx-4">
      <SettingsForm initialData={store} />
    </div>
  );
}
