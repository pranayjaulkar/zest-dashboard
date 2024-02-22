"use client";
import ApiList from "@/components/ui/apiList";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/dataTable";
import Heading from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Billboard, Category } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { PlusIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CellAction } from "./CellAction";
import { useLoadingBarStore } from "@/hooks/useLoadingBarStore";
import Link from "next/link";

export type CategoryColumn = {
  id: string;
  name: string;
  billboardLabel: string;
  createdAt: string;
};

interface CategoriesClientProps {
  categories: (Category & { billboard: Billboard })[];
}

const CategoryClient: React.FC<CategoriesClientProps> = ({ categories }) => {
  const loadingBar = useLoadingBarStore();
  const params = useParams();
  const [data, setData] = useState<CategoryColumn[]>(
    categories.map((item) => ({
      id: item.id,
      name: item.name,
      billboardLabel: item.billboard.label,
      createdAt: format(item.createdAt, "dd-MM-yyy"),
    }))
  );

  const columns: ColumnDef<CategoryColumn>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "billboard",
      header: "Billboard",
      cell: ({ row }) => row.original.billboardLabel,
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
          title={`Categories (${data.length})`}
          description="Manage categories for your store"
        />
        <Link
          href={`/${params.storeId}/categories/new`}
          onClick={() => loadingBar.start()}
        >
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add New
          </Button>
        </Link>
      </div>
      <Separator />
      <DataTable columns={columns} data={data} searchKey="name" />
      <Heading title="API" description="API calls for categories" />
      <Separator />
      <ApiList entityName="categories" entityIdName="categoryId" />
    </>
  );
};
export default CategoryClient;
