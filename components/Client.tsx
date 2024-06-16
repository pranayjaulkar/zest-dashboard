"use client";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Plus as PlusIcon } from "lucide-react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { format } from "date-fns";
import ApiList from "@/components/ui/api-list";
import { useLoadingBarStore } from "@/hooks/useLoadingBarStore";
import Link from "next/link";
import CellActions from "./CellActions";
import { AlertModal } from "./modals/AlertModal";
import axios from "axios";
import toast from "react-hot-toast";

interface ClientProps<TData> {
  data: TData[];
  columns: any[];
  entityNamePlural: string;
  entityName: string;
  searchKey: string;
  order?: boolean;
}

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
      console.trace("error: ", error);
      toast.error("Something Went Wrong");
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
          entityName={entityName}
          entityNamePlural={entityNamePlural}
          row={row.original}
          onDelete={openAlertDialog}
        />
      ),
    },
  ];

  const handleDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/stores/${params.storeId}/${entityNamePlural}/${rowId}`);
      setRows((previousData) => previousData.filter((element) => element.id !== rowId));
      toast.success(`${entityName} deleted`);
    } catch (error) {
      console.trace("error: ", error);
      toast.error("Something Went Wrong");
    } finally {
      router.refresh();
      setLoading(false);
      setOpen(false);
    }
  };

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
            onClick={() => {
              if (pathname !== `/${params.storeId}/${entityNamePlural}/new`) loadingBar.start();
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
