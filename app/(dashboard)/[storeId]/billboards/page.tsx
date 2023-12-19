import { Billboard } from "@prisma/client";
import BillboardClient from "./(components)/BillboardClient";
import prismadb from "@/lib/prismadb";

export default async function BillboardsPage({
  params,
}: {
  params: { storeId: string };
}) {
  const billboards: Billboard[] = await prismadb.billboard.findMany({
    where: { storeId: params.storeId },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
      <BillboardClient billboards={billboards} />
      </div>
    </div>
  );
}
