"use client";
import { OrderItem, Product } from "@prisma/client";

const columns = [
  {
    accessorKey: "products",
    header: "Products",
    cell: ({ row }: { row: any }) => (
      <div className="min-w-32 max-w-52">
        {row.original.orderItems
          .map((orderItem: OrderItem & { product: Product }) => orderItem.product.name)
          .join(", ")}
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Date",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },

  {
    accessorKey: "address",
    header: "Address",
    cell: ({ row }: { row: any }) => <div className="min-w-32 max-w-52">{row.original.address}</div>,
  },
  {
    accessorKey: "variation",
    header: "Variations",
    cell: ({ row }: { row: any }) => (
      <div className="min-w-32 max-w-40">
        {row.original.orderItems.map((item: any) => item.productVariation.name).join(", ")}
      </div>
    ),
  },
  {
    accessorKey: "isPaid",
    header: "Paid",
  },
  {
    accessorKey: "delivered",
    header: "Delivered",
  },
  {
    accessorKey: "totalPrice",
    header: "Total Price",
  },
];

export default columns;
