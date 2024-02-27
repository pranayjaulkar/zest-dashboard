"use client";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Plus as PlusIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { DataTable } from "@/components/ui/dataTable";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { format } from "date-fns";
import ApiList from "@/components/ui/apiList";
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
}

export default function Client<
  TData extends { id: string; label?: string; name?: string }
>({
  data,
  columns,
  entityName,
  entityNamePlural,
  searchKey,
}: ClientProps<TData>) {
  const params = useParams();
  const loadingBar = useLoadingBarStore();
  const [rows, setRows] = useState(data);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rowId, setRowId] = useState("");

  const onDelete = async (id: string) => {
    setOpen(true);
    setRowId(id);
  };

  const columnDefs: ColumnDef<TData>[] = [
    ...columns.map((column) => {
      if (column.accessorKey === "createdAt")
        return {
          ...column,
          cell: ({ row }: { row: any }) =>
            format(row.original.createdAt, "dd-MM-yyyy"),
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
          onDelete={onDelete}
        />
      ),
    },
  ];

  const onConfirm = async () => {
    try {
      setLoading(true);
      loadingBar.start();
      await axios.delete(
        `/api/stores/${params.storeId}/${entityNamePlural}/${rowId}`
      );
      setRows((previousData) =>
        previousData.filter((element) => element.id !== rowId)
      );
      setLoading(false);
      setOpen(false);
      loadingBar.done();
      toast.success(`${entityName} deleted`);
    } catch (error) {
      console.trace("error: ", error);
      toast.error("Something Went Wrong");
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        setOpen={setOpen}
        onConfirm={onConfirm}
        loading={loading}
      />
      <div className="flex items-center justify-between">
        <Heading
          title={`${entityName} (${data.length})`}
          description={`Manage ${entityNamePlural} for your store`}
        />
        <Link
          href={`/${params.storeId}/${entityNamePlural}/new`}
          onClick={() => loadingBar.start()}
        >
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add New
          </Button>
        </Link>
      </div>
      <Separator />
      <DataTable columns={columnDefs} data={rows} searchKey={searchKey} />
      <Heading title="API" description={`API calls for ${entityNamePlural}`} />
      <Separator />
      <ApiList
        entityName={entityNamePlural}
        entityIdName={`${entityName.toLowerCase()}Id`}
      />
    </>
  );
}
