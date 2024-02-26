"use client";
const columns = [
  {
    accessorKey: "name",
    header: "Name",
  },

  {
    accessorKey: "value",
    header: "HexCode",
    cell: ({ row }: { row: any }) => (
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
];

export default columns;
