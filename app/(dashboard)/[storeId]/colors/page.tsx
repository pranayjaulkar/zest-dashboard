import { Color } from "@prisma/client";
import ColorClient from "./(components)/Client";
import prismadb from "@/lib/prismadb";

export default async function ColorsPage({
  params,
}: {
  params: { storeId: string };
}) {
  const colors: Color[] = await prismadb.color.findMany({
    where: { storeId: params.storeId },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ColorClient colors={colors} />
      </div>
    </div>
  );
}
