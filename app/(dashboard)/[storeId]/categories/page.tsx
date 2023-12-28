import { Billboard, Category, Prisma } from "@prisma/client";
import CategoryClient from "./(components)/Client";
import prismadb, { CategoryWithBillboards } from "@/lib/prismadb";

export default async function CategoriesPage({
  params,
}: {
  params: { storeId: string };
}) {
  const categories: CategoryWithBillboards[] = await prismadb.category.findMany({
    where: { storeId: params.storeId },
    include: { billboard: true },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <CategoryClient categories={categories} />
      </div>
    </div>
  );
}
