"use client";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Plus as PlusIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/dataTable";
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./CellAction";
import { useState } from "react";
import ApiList from "@/components/ui/apiList";

export type OrderColumn = {
  id: string;
  phone: string;
  address: string;
  isPaid: boolean;
  products: string;
  totalPrice: string;
  createdAt: string;
};

interface OrderClientProps {
  orders: OrderColumn[];
}

export const OrderClient: React.FC<OrderClientProps> = ({ orders }) => {

  const columns: ColumnDef<OrderColumn>[] = [
    {
      accessorKey: "products",
      header: "Products",
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
    },
    {
      accessorKey: "isPaid",
      header: "Paid",
    },
    {
      accessorKey: "totalPrice",
      header: "Total Price",
    },
  ];

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Orders (${orders.length})`}
          description="Manage orders for your store"
        />
      </div>
      <Separator />
      <DataTable columns={columns} data={orders} searchKey="products" />
    </>
  );
};

export default OrderClient;
