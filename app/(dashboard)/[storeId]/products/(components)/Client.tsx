"use client";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Plus as PlusIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/dataTable";
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./CellAction";
import { Category, Color, Product, Size } from "@prisma/client";
import { useState } from "react";
import { format } from "date-fns";
import ApiList from "@/components/ui/apiList";
import { formatter } from "@/lib/utils";
import { ProductWithCategorySizeColor } from "@/lib/prismadb";

export type ProductColumn = {
  id: string;
  name: string;
  isFeatured: boolean;
  isArchived: boolean;
  price: string;
  category: string;
  size: string;
  color: string;
  createdAt: string;
};

interface ProductClientProps {
  products: (Product & { size: Size } & { color: Color } & {
    category: Category;
  })[];
}

export const ProductClient: React.FC<ProductClientProps> = ({ products }) => {
  const router = useRouter();
  const params = useParams();
  const [data, setData] = useState<ProductColumn[]>(
    products.map((item) => ({
      id: item.id,
      name: item.name,
      isFeatured: item.isFeatured,
      isArchived: item.isArchived,
      price: formatter.format(item.price.toNumber()),
      category: item.category.name,
      size: item.size.value,
      color: item.color.value,
      createdAt: format(item.createdAt, "dd-MM-yyy"),
    }))
  );

  const columns: ColumnDef<ProductColumn>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "createdAt",
      header: "Date",
    },
    {
      accessorKey: "isArchived",
      header: "Archived",
    },
    {
      accessorKey: "isFeatured",
      header: "Featured",
    },
    {
      accessorKey: "price",
      header: "Price",
    },
    {
      accessorKey: "category",
      header: "Category",
    },
    {
      accessorKey: "size",
      header: "Size",
    },
    {
      accessorKey: "color",
      header: "Color",
      cell: ({ row }) => (
        <div className="flex items-center gap-x-2">
          <div className="w-16">{row.original.color}</div>
          <div
            className="h-6 w-6 rounded-full border"
            style={{ backgroundColor: row.original.color }}
          ></div>
        </div>
      ),
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
          title={`Products (${data.length})`}
          description="Manage products for your store"
        />
        <Button onClick={() => router.push(`/${params.storeId}/products/new`)}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>
      <Separator />
      <DataTable columns={columns} data={data} searchKey="name" />
      <Heading title="API" description="API calls for products" />
      <Separator />
      <ApiList entityName="products" entityIdName="productId" />
    </>
  );
};

export default ProductClient;
