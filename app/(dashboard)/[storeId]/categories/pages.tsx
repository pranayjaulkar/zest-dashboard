import { Billboard, Category } from "@prisma/client";
import CategoryClient from "./(components)/CategoryClient";
import prismadb from "@/lib/prismadb";

export default async function CategoriesPage({
  params,
}: {
  params: { storeId: string };
  }) {
  const categories = await prismadb.category.findMany({
    where: { storeId: params.storeId },
    include: { billboard: true },
    orderBy: { createdAt: "desc" },
  });
  console.log('categories: ', categories);
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <CategoryClient categories={categories} />
      </div>
    </div>
  );
}
