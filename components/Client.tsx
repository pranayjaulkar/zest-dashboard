"use client";
import { useParams, usePathname, useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { format } from "date-fns";
import { useLoadingBarStore } from "@/hooks/useLoadingBarStore";
import axios from "axios";
import toast from "react-hot-toast";
import { Order, OrderItem } from "@prisma/client";

import CellActions from "@/components/CellActions";
import ApiList from "@/components/ui/api-list";
import Heading from "@/components/ui/heading";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus as PlusIcon } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { AlertModal } from "@/components/modals/AlertModal";

interface ClientProps<TData> {
  data: TData[];
  columns: any[];
  entityNamePlural: string;
  entityName: string;
  searchKey: string;
  order?: boolean;
}

type FormattedOrder = Order & { orderItems: OrderItem[] } & { totalPrice: number };

export default function Client<TData extends { id: string; label?: string; name?: string }>({
  data,
  columns,
  entityName,
  entityNamePlural,
  searchKey,
  order,
}: ClientProps<TData>) {
  const params = useParams();
  const loadingBar = useLoadingBarStore();
  const router = useRouter();
  const [rows, setRows] = useState(data);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rowId, setRowId] = useState("");
  const pathname = usePathname();

  const openAlertDialog = async (id: string) => {
    try {
      // open alert dialog
      setOpen(true);
      setRowId(id);
    } catch (error) {
      // console.trace("error: ", error);

      if (axios.isAxiosError(error))
        toast.error(
          error?.response?.status === 500 ? "Internal Server Error" : "Something went wrong. Please try again."
        );
      else toast.error("Something went wrong. Please try again.");
    }
  };

  const handleMarkDelivered = async (order: FormattedOrder) => {
    try {
      setLoading(true);

      const { totalPrice, orderItems, ...newOrder } = order;

      await axios.patch(`/api/stores/${params.storeId}/orders/${order?.id}`, { ...newOrder, delivered: true });

      setRows((prev) => prev.map((row) => (row.id === order.id ? { ...row, delivered: true } : row)));

      toast.success("Order marked as delivered");
    } catch (error) {
      // console.trace("error: ", error);

      if (axios.isAxiosError(error))
        toast.error(
          error?.response?.status === 500 ? "Internal Server Error" : "Something went wrong. Please try again."
        );
      else toast.error("Something went wrong. Please try again.");
    } finally {
      router.refresh();
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);

      await axios.delete(`/api/stores/${params.storeId}/${entityNamePlural}/${rowId}`);

      setRows((previousData) => previousData.filter((element) => element.id !== rowId));

      toast.success(`${entityName} deleted`);
    } catch (error) {
      // console.trace("error: ", error);

      if (axios.isAxiosError(error))
        toast.error(
          error?.response?.status === 500 ? "Internal Server Error" : "Something went wrong. Please try again."
        );
      else toast.error("Something went wrong. Please try again.");
    } finally {
      router.refresh();
      setLoading(false);
      setOpen(false);
    }
  };

  const columnDefs: ColumnDef<TData>[] = [
    ...columns.map((column) => {
      if (column.accessorKey === "createdAt")
        return {
          ...column,
          cell: ({ row }: { row: any }) => format(row.original.createdAt, "dd-MM-yyyy"),
        };
      else return column;
    }),
    {
      id: "actions",
      cell: ({ row }) => (
        <CellActions
          order={order}
          onMarkDelivered={() => handleMarkDelivered(row.original as unknown as FormattedOrder)}
          entityName={entityName}
          entityNamePlural={entityNamePlural}
          row={row.original}
          onDelete={openAlertDialog}
        />
      ),
    },
  ];

  return (
    <>
      <AlertModal isOpen={open} setOpen={setOpen} onConfirm={handleDelete} loading={loading} />
      <div className={`flex items-center ${order ? "justify-start" : "justify-between"}`}>
        <Heading
          title={`${entityName} (${data?.length || 0})`}
          description={`Manage ${entityNamePlural} for your store`}
        />
        {!order && (
          <Link
            href={`/${params.storeId}/${entityNamePlural}/new`}
            onClick={(event: any) => {
              if (pathname !== `/${params.storeId}/${entityNamePlural}/new`) loadingBar.start(event);
            }}
          >
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              Add New
            </Button>
          </Link>
        )}
      </div>
      <Separator />
      <DataTable columns={columnDefs} data={rows} searchKey={searchKey} />
      <Heading title="API" description={`API calls for ${entityNamePlural}`} />
      <Separator />
      <ApiList entityName={entityNamePlural} entityIdName={`${entityName.toLowerCase()}Id`} />
    </>
  );
}
