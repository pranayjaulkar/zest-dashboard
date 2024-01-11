import { Product } from "@prisma/client";
import ProductClient from "./(components)/Client";
import prismadb, { ProductWithCategorySizeColor } from "@/lib/prismadb";
import { formatter } from "@/lib/utils";
import { format } from "date-fns";

export default async function ProductsPage({
  params,
}: {
  params: { storeId: string };
}) {
  let products = await prismadb.product.findMany({
    where: { storeId: params.storeId },
    include: { category: true, size: true, color: true },
    orderBy: { createdAt: "desc" },
  });
  const formattedProducts = products.map((item) => ({
    id: item.id,
    name: item.name,
    isFeatured: item.isFeatured,
    isArchived: item.isArchived,
    price: formatter.format(item.price.toNumber()),
    category: item.category.name,
    size: item.size.value,
    color: item.color.value,
    createdAt: format(item.createdAt, "dd-MM-yyy"),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductClient products={formattedProducts} />
      </div>
    </div>
  );
}
