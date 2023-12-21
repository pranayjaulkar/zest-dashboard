"use client";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Plus as PlusIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cellAction";
import { Billboard } from "@prisma/client";
import { useState } from "react";
import { format } from "date-fns";

export type BillboardColumn = {
  id: string;
  label: string;
  createdAt: string;
};

interface BillboardClientProps {
  billboards: Billboard[];
}

export const BillboardClient: React.FC<BillboardClientProps> = ({
  billboards,
}) => {
  const router = useRouter();
  const params = useParams();
  const [data, setData] = useState<BillboardColumn[]>(
    billboards.map((item) => ({
      id: item.id,
      label: item.label,
      createdAt: format(item.createdAt, "dd-MM-yyy"),
    }))
  );

  const columns: ColumnDef<BillboardColumn>[] = [
    {
      accessorKey: "label",
      header: "Label",
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
          title={`Billboards (${data.length})`}
          description="Manage billboards for your store"
        />
        <Button
          onClick={() => router.push(`/${params.storeId}/billboards/new`)}
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>
      <Separator />
      <DataTable columns={columns} data={data} searchKey="label" />
    </>
  );
};

export default BillboardClient;
