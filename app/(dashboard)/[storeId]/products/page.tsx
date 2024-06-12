import prisma from "@/prisma/client";
import { formatter } from "@/lib/utils";
import Client from "@/components/Client";
import columns from "./(components)/columns";

export default async function ProductsPage({
  params,
}: {
  params: { storeId: string };
}) {
  let products = await prisma.product.findMany({
    where: { storeId: params.storeId },
    include: {
      category: true,
      productVariations: { include: { size: true, color: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  const formattedProducts = products.map((item) => ({
    ...item,
    price: formatter.format(item.price.toNumber()),
  }));

  return (
    <div className="flex-col max-w-screen-xl mx-auto">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Client
          data={formattedProducts}
          columns={columns}
          entityName="Product"
          entityNamePlural="products"
          searchKey="name"
        />
      </div>
    </div>
  );
}
