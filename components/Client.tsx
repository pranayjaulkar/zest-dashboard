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
          setRows={setRows}
        />
      ),
    },
  ];

  return (
    <>
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
