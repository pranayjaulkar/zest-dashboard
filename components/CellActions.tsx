import toast from "react-hot-toast";
import { useParams, usePathname } from "next/navigation";
import { useLoadingBarStore } from "@/hooks/useLoadingBarStore";
import { Order } from "@prisma/client";
import axios from "axios";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Copy as CopyIcon,
  Edit as EditIcon,
  MoreHorizontal as MoreHorizontalIcon,
  Trash as TrashIcon,
  Check as CheckIcon,
} from "lucide-react";

interface CellActionsProps<TData> {
  row: TData;
  entityNamePlural: string;
  entityName: string;
  order?: boolean;
  onDelete: (id: string) => void;
  onMarkDelivered: (id: string) => void;
}

export default function CellActions<TData extends { id: string; label?: string; name?: string } | Order>({
  row,
  entityNamePlural,
  entityName,
  order,
  onDelete,
  onMarkDelivered,
}: CellActionsProps<TData>) {
  const params = useParams();
  const pathname = usePathname();
  const loadingBar = useLoadingBarStore();

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success(`${entityName} ID copied to the clipboard`);
  };

  const handleUpdate = (event: any) => {
    try {
      if (pathname !== `/${params.storeId}/${entityNamePlural}/${row.id}`) {
        loadingBar.start(event);
      }
    } catch (error) {
      loadingBar.done();

      console.trace(error);

      if (axios.isAxiosError(error))
        toast.error(
          error?.response?.status === 500 ? "Internal Server Error" : "Something went wrong. Please try again."
        );
      else toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-white border-[1px] border-border z-20 rounded-md" align="end">
          <DropdownMenuLabel className="py-1 px-2 m-1 min-w-[128px] font-bold">Actions</DropdownMenuLabel>
          <DropdownMenuItem
            className="flex justify-start rounded-md border-0  py-1 px-2 m-1 min-w-[128px] hover:bg-gray-100 cursor-pointer"
            onClick={() => handleCopy(row.id)}
          >
            <CopyIcon className="mr-2 h-4 w-4" />
            Copy ID
          </DropdownMenuItem>
          {!order && (
            <Link href={`/${params.storeId}/${entityNamePlural}/${row.id}`} onClick={handleUpdate}>
              <DropdownMenuItem className="flex justify-start border-0  rounded-md py-1 px-2 m-1 min-w-[128px] hover:bg-gray-100 cursor-pointer">
                <EditIcon className="mr-2 h-4 w-4" />
                Update
              </DropdownMenuItem>
            </Link>
          )}
          {order && (
            <DropdownMenuItem
              disabled={"delivered" in row && row.delivered ? true : false}
              className="flex justify-start border-0 rounded-md  py-1 px-2 m-1 min-w-[128px] hover:bg-gray-100 cursor-pointer"
              onClick={() => onMarkDelivered(row.id)}
            >
              <CheckIcon className="mr-2 h-4 w-4" />
              {"delivered" in row && row.delivered ? "Marked as Delivered" : "Mark as delivered"}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            className="flex justify-start border-0 rounded-md  py-1 px-2 m-1 min-w-[128px] hover:bg-gray-100 cursor-pointer"
            onClick={() => onDelete(row.id)}
          >
            <TrashIcon className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
