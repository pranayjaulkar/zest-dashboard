"use client";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Plus as PlusIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/dataTable";
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./CellAction";
import { Billboard } from "@prisma/client";
import { useState } from "react";
import { format } from "date-fns";
import ApiList from "@/components/ui/apiList";
import { useLoadingBarStore } from "@/hooks/useLoadingBarStore";
import Link from "next/link";

export type BillboardColumn = {
  id: string;
  label: string;
  createdAt: string;
};

interface BillboardClientProps {
  billboards: Billboard[];
}

const BillboardClient: React.FC<BillboardClientProps> = ({ billboards }) => {
  const params = useParams();
  const loadingBar = useLoadingBarStore();
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
        <Link
          href={`/${params.storeId}/billboards/new`}
          onClick={() => loadingBar.start()}
        >
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add New
          </Button>
        </Link>
      </div>
      <Separator />
      <DataTable columns={columns} data={data} searchKey="label" />
      <Heading title="API" description="API calls for billboards" />
      <Separator />
      <ApiList entityName="billboards" entityIdName="billboardId" />
    </>
  );
};

export default BillboardClient;
