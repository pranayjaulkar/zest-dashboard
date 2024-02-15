"use client";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Plus as PlusIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/dataTable";
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./CellAction";
import { Color } from "@prisma/client";
import { useState } from "react";
import { format } from "date-fns";
import ApiList from "@/components/ui/apiList";

export type ColorColumn = {
  id: string;
  name: string;
  value: string;
  createdAt: string;
};

interface ColorClientProps {
  colors: Color[];
}

const ColorClient: React.FC<ColorClientProps> = ({ colors }) => {
  const router = useRouter();
  const params = useParams();
  const [data, setData] = useState<ColorColumn[]>(
    colors.map((item) => ({
      id: item.id,
      name: item.name,
      value: item.value,
      createdAt: format(item.createdAt, "dd-MM-yyy"),
    }))
  );

  const columns: ColumnDef<ColorColumn>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "value",
      header: "Value",
      cell: ({ row }) => (
        <div className="flex items-center gap-x-2">
          <div className="w-16">{row.original.value}</div>
          <div
            className="h-6 w-6 rounded-full border"
            style={{ backgroundColor: row.original.value }}
          ></div>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Date",
    },
    {
      id: "actions",
      cell: ({ row }) => <CellAction data={row.original} setData={setData} />,
    },
  ];

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Colors (${data.length})`}
          description="Manage colors for your store"
        />
        <Button onClick={() => router.push(`/${params.storeId}/colors/new`)}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>
      <Separator />
      <DataTable columns={columns} data={data} searchKey="name" />
      <Heading title="API" description="API calls for colors" />
      <Separator />
      <ApiList entityName="colors" entityIdName="colorId" />
    </>
  );
};

export default ColorClient;
