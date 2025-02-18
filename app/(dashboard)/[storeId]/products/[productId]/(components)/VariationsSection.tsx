import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductWithPriceTypeConverted, _ProductVariation } from "@/types";
import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Color, Size } from "@prisma/client";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CreateSizeOrColorModal from "@/components/modals/CreateSizeOrColorModal";

interface VariationsTableProps {
  initialData: ProductWithPriceTypeConverted | null;
  disabled: boolean;
  colors: Color[];
  setColors: React.Dispatch<React.SetStateAction<Color[]>>;
  setSizes: React.Dispatch<React.SetStateAction<Size[]>>;
  sizes: Size[];
  productVariations: _ProductVariation[];
  setProductVariations: React.Dispatch<
    React.SetStateAction<_ProductVariation[]>
  >;
  selectedColors: Color[];
  setSelectedColors: React.Dispatch<React.SetStateAction<Color[]>>;
  selectedSizes: Size[];
  setSelectedSizes: React.Dispatch<React.SetStateAction<Size[]>>;
}

export default function VariationsSection({
  initialData,
  disabled,
  colors,
  setColors,
  setSizes,
  sizes,
  productVariations,
  setProductVariations,
  selectedColors,
  setSelectedColors,
  selectedSizes,
  setSelectedSizes,
}: VariationsTableProps) {
  const [allChecked, SetAllChecked] = useState(false);
  const [isCreateColorModalOpen, setIsCreateColorModalOpen] = useState(false);
  const [createModalType, setCreateModalType] = useState<"color" | "size">(
    "color"
  );

  const colorColumns: ColumnDef<Color>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(!!value);
            if (value) setSelectedColors(colors);
            else setSelectedColors([]);
          }}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={
            initialData?.id
              ? !!selectedColors.find((s) => s.id === row.original.id)
              : row.getIsSelected()
          }
          onCheckedChange={(value) => {
            row.toggleSelected(!!value);
            if (value) setSelectedColors([...selectedColors, row.original]);
            else
              setSelectedColors(
                selectedColors.filter((c) => c.id !== row.original.id)
              );
          }}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Color",
    },
    {
      accessorKey: "value",
      header: "Value",
      cell: ({ row }) => (
        <div className="flex items-center gap-x-2">
          <div
            className="h-6 w-6 rounded-full border"
            style={{ backgroundColor: row.original.value }}
          ></div>
          <div className="w-16">{row.original.value}</div>
        </div>
      ),
    },
  ];

  const sizeColumns: ColumnDef<Size>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(!!value);
            if (value) setSelectedSizes(sizes);
            else setSelectedSizes([]);
          }}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={
            initialData?.id
              ? !!selectedSizes.find((s) => s.id === row.original.id)
              : row.getIsSelected()
          }
          onCheckedChange={(value) => {
            row.toggleSelected(!!value);
            if (value) setSelectedSizes([...selectedSizes, row.original]);
            else
              setSelectedSizes(
                selectedSizes.filter((s) => s.id !== row.original.id)
              );
          }}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Size",
    },
    { accessorKey: "value", header: "Value" },
  ];

  const onQuantityChange = (e: any, v: _ProductVariation) => {
    const newValue = Number(e.target.value);
    if (Number.isInteger(newValue))
      setProductVariations((prevArray) =>
        prevArray.map((variation) => {
          if (
            variation.colorId === v.colorId &&
            variation.sizeId === v.sizeId
          ) {
            return {
              ...variation,
              quantity: e.target.value ? newValue : e.target.value,
            };
          } else {
            return variation;
          }
        })
      );
  };

  const handleCreateColorOrSize = (type: "color" | "size") => {
    setCreateModalType(type);
    setIsCreateColorModalOpen(true);
  };

  const handleAddColorOrSize = (color: Color) => {
    setIsCreateColorModalOpen(false);
    if (createModalType === "color") {
      setColors((prev) => [...prev, color]);
    } else {
      setSizes((prev) => [...prev, color]);
    }
  };

  const onCheckedChange = (value: boolean, v: _ProductVariation) => {
    setProductVariations(
      productVariations.map((productVariation) => {
        return productVariation.sizeId === v.sizeId &&
          productVariation.colorId === v.colorId
          ? {
              ...productVariation,
              selected: value,
            }
          : productVariation;
      })
    );
  };

  const onAllCheckedChange = (value: any) => {
    SetAllChecked(!!value);
    setProductVariations(
      productVariations.map((variation) => ({
        ...variation,
        selected: value,
      }))
    );
  };

  return (
    <div className="w-full space-y-8">
      {isCreateColorModalOpen && (
        <CreateSizeOrColorModal
          onSubmit={handleAddColorOrSize}
          onClose={() => setIsCreateColorModalOpen(false)}
          type={createModalType}
        />
      )}
      <div className="flex flex-col">
        <label className="text-xl font-bold">Product Variations</label>
        <span className="text-sm">
          Select Variations and enter quantity of each selected variation
        </span>
      </div>
      <div className="grid grid-cols-2 gap-8">
        <div>
          <label>Colors</label>
          <DataTable
            columns={colorColumns}
            data={colors}
            searchKey="name"
            pagination={false}
            className="max-h-80 overflow-y-auto"
          />
          <div className="flex mt-4 items-center w-full">
            <Button
              onClick={() => handleCreateColorOrSize("color")}
              variant="outline"
              className="w-full flex items-center space-x-4"
            >
              <Plus className="size-5" /> <span>Add new Color</span>
            </Button>
          </div>
        </div>
        <div>
          <label>Sizes</label>
          <DataTable
            columns={sizeColumns}
            data={sizes}
            searchKey="name"
            pagination={false}
            className="max-h-80 overflow-y-auto"
          />
          <div className="flex mt-4 items-center w-full">
            <Button
              onClick={() => handleCreateColorOrSize("size")}
              variant="outline"
              className="w-full flex items-center space-x-4"
            >
              <Plus className="size-5" /> <span>Add new Size</span>
            </Button>
          </div>
        </div>
      </div>
      <Table
        className={`border rounded-md ${
          disabled ? "text-gray-300 cursor-not-allowed" : ""
        }`}
      >
        <TableHeader>
          <TableRow>
            <TableHead>
              <Checkbox
                disabled={disabled}
                checked={allChecked}
                onCheckedChange={onAllCheckedChange}
              />
            </TableHead>
            <TableHead className="w-[100px] text-inherit">Name</TableHead>
            <TableHead className="text-inherit">Size</TableHead>
            <TableHead className="text-inherit">Color</TableHead>
            <TableHead className="text-inherit">Quantity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {productVariations.map((v) => (
            <TableRow key={v.name}>
              <TableCell>
                <Checkbox
                  checked={v.selected}
                  onCheckedChange={(value: boolean) =>
                    onCheckedChange(!!value, v)
                  }
                />
              </TableCell>
              <TableCell className="font-medium">{v.name}</TableCell>
              <TableCell>{v.size.name}</TableCell>
              <TableCell>
                <div className="flex items-center gap-x-2">
                  <div
                    className="h-6 w-6 rounded-full border"
                    style={{ backgroundColor: v.color.value }}
                  ></div>
                  <div className="w-16">{v.color.name}</div>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <input
                  className="border-2 p-2 rounded-md w-32"
                  value={v.quantity}
                  onChange={(e) => onQuantityChange(e, v)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
