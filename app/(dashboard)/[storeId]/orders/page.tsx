import { formatter } from "@/lib/utils";
import prismadb from "@/lib/prismadb";
import Client from "@/components/Client";
import columns from "./(components)/columns";

export default async function OrdersPage({
  params,
}: {
  params: { storeId: string };
}) {
  let orders = await prismadb.order.findMany({
    where: { storeId: params.storeId },
    include: { orderItems: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });
  const formattedOrders = orders.map((item) => ({
    ...item,
    totalPrice: formatter.format(
      item.orderItems.reduce((total, item) => {
        return total + Number(item.product.price);
      }, 0)
    ),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Client
          data={formattedOrders}
          columns={columns}
          entityName="Order"
          entityNamePlural="orders"
          searchKey="orders"
        />
      </div>
    </div>
  );
}
