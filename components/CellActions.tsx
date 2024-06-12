import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Copy as CopyIcon,
  Edit as EditIcon,
  MoreHorizontal as MoreHorizontalIcon,
  Trash as TrashIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { useParams, usePathname } from "next/navigation";
import { useLoadingBarStore } from "@/hooks/useLoadingBarStore";
import Link from "next/link";

interface CellActionsProps<TData> {
  row: TData;
  entityNamePlural: string;
  entityName: string;
  onDelete: (id: string) => void;
}

export default function CellActions<TData extends { id: string; label?: string; name?: string }>({
  row,
  entityNamePlural,
  entityName,
  onDelete,
}: CellActionsProps<TData>) {
  const params = useParams();
  const pathname = usePathname();
  const loadingBar = useLoadingBarStore();

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success(`${entityName} ID copied to the clipboard`);
  };

  const handleUpdate = () => {
    try {
      if (pathname !== `/${params.storeId}/${entityNamePlural}/${row.id}`) {
        loadingBar.start();
      }
    } catch (error) {
      loadingBar.done();
      console.trace(error);
      toast.error("Something went wrong");
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
          <Link href={`/${params.storeId}/${entityNamePlural}/${row.id}`} onClick={handleUpdate}>
            <DropdownMenuItem className="flex justify-start border-0  rounded-md py-1 px-2 m-1 min-w-[128px] hover:bg-gray-100 cursor-pointer">
              <EditIcon className="mr-2 h-4 w-4" />
              Update
            </DropdownMenuItem>
          </Link>
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
