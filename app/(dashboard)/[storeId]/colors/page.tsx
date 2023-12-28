import { Size } from "@prisma/client";
import SizeClient from "./(components)/Client";
import prismadb from "@/lib/prismadb";

export default async function SizesPage({
  params,
}: {
  params: { storeId: string };
}) {
  const sizes: Size[] = await prismadb.size.findMany({
    where: { storeId: params.storeId },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SizeClient sizes={sizes} />
      </div>
    </div>
  );
}
