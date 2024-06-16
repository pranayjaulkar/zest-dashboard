import { formatter } from "@/lib/utils";
import prisma from "@/prisma/client";
import Client from "@/components/Client";
import columns from "./(components)/columns";

export default async function OrdersPage({ params }: { params: { storeId: string } }) {
  const orders = await prisma.order.findMany({
    where: { storeId: params.storeId },
    include: { orderItems: { include: { product: true, productVariation: true } } },
    orderBy: { createdAt: "desc" },
  });
  const formattedOrders = orders.map((item) => ({
    ...item,
    totalPrice: formatter.format(
      item.orderItems.reduce((total, item) => {
        return total + Number(item.product.price);
      }, 0)
    ),
    orderItems: item.orderItems.map((orderItem) => ({
      ...orderItem.product,
      price: formatter.format(Number(orderItem.product.price)),
    })),
  }));

  return (
    <div className="flex-col max-w-screen-xl mx-auto">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Client
          data={formattedOrders}
          order
          columns={columns}
          entityName="Order"
          entityNamePlural="orders"
          searchKey="products"
        />
      </div>
    </div>
  );
}
