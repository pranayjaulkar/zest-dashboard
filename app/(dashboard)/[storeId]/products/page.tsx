import { Product } from "@prisma/client";
import ProductClient from "./(components)/Client";
import prismadb, { ProductWithCategorySizeColor } from "@/lib/prismadb";

export default async function ProductsPage({
  params,
}: {
  params: { storeId: string };
}) {
  const products = await prismadb.product.findMany({
    where: { storeId: params.storeId },
    include: { category: true, size: true, color: true },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductClient products={products} />
      </div>
    </div>
  );
}
