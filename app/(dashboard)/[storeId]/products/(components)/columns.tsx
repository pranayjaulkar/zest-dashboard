"use client";

import { getColorsFromVariations, getSizesFromVariations } from "@/lib/utils";
import { Color, ProductVariation, Size } from "@prisma/client";

const columns = [
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
    accessorKey: "category.name",
    header: "Category",
  },
  {
    accessorKey: "size.value",
    header: "Size",
    cell: ({ row }: { row: any }) => {
      let sizes: Size[] = getSizesFromVariations(
        row.original.productVariations
      );
      return (
        <div className="flex items-center gap-x-2">
          {sizes.reduce(
            (sizesStr: string, size) =>
              sizesStr ? `${sizesStr}, ${size.name}` : size.name,
            ""
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "productVariations",
    header: "Color",
    cell: ({ row }: { row: any }) => {
      let colors: Color[] = getColorsFromVariations(
        row.original.productVariations
      );
      return (
        <div className="flex items-center gap-x-2">
          {colors.map((color: Color) => (
            <div key={color.id}>
              <div
                className="h-6 w-6 rounded-full border"
                style={{ backgroundColor: color.value }}
              ></div>
            </div>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "price",
    header: "Price",
  },
];
export default columns;
