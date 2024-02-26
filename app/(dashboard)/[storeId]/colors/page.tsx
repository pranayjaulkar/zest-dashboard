import { Color } from "@prisma/client";
import prismadb from "@/lib/prismadb";
import Client from "@/components/Client";
import columns from "./(components)/columns";

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
        <Client
          data={colors}
          columns={columns}
          entityName="Color"
          entityNamePlural="colors"
          searchKey="name"
        />
      </div>
    </div>
  );
}
