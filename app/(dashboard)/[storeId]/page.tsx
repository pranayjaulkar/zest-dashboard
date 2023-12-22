import Content from "./Content";
import prismadb from "@/lib/prismadb";
import { Store } from "@prisma/client";
export const metadata = {
  title: "Dashboard",
};
type Props = { storeId: string };

export default async function DashboardPage({ storeId }: Props) {
  const store: Store | null = await prismadb.store.findFirst({
    where: { id: storeId },
  });
  return (
    <div>
      <Content store={store} />
    </div>
  );
}
