import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Copy as CopyIcon,
  Edit as EditIcon,
  MoreHorizontal as MoreHorizontalIcon,
  Trash as TrashIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import axios from "axios";
import { AlertModal } from "@/components/modals/alert-modal";
import { BillboardColumn } from "./Client";

interface CellActionProps {
  data: BillboardColumn;
  setData: React.Dispatch<React.SetStateAction<BillboardColumn[]>>;
}

export const CellAction: React.FC<CellActionProps> = ({ data, setData }) => {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const onCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success("Billboard ID copied to the clipboard");
  };
  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/stores/${params.storeId}/billboards/${data.id}`);
      setLoading(false);
      setOpen(false);
      setData((previousData) =>
        previousData.filter((element) => element.id !== data.id)
      );
      toast.success("Billboard deleted");
    } catch (error: any) {
      console.trace("error: ", error);
      if (error.response.data === "P2014")
        toast.error("This Billboard is in use with a category");
      else toast.error("Something Went Wrong");
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
        <DropdownMenuContent
          className="bg-white border-[1px] border-border z-20 rounded-md"
          align="end"
        >
          <DropdownMenuLabel className="py-1 px-2 m-1 min-w-[128px] font-bold">
            Actions
          </DropdownMenuLabel>
          <DropdownMenuItem
            className="flex justify-start rounded-md border-0  py-1 px-2 m-1 min-w-[128px] hover:bg-gray-100 cursor-pointer"
            onClick={() => onCopy(data.id)}
          >
            <CopyIcon className="mr-2 h-4 w-4" />
            Copy ID
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex justify-start border-0  rounded-md py-1 px-2 m-1 min-w-[128px] hover:bg-gray-100 cursor-pointer"
            onClick={() => {
              router.push(`/${params.storeId}/billboards/${data.id}`);
            }}
          >
            <EditIcon className="mr-2 h-4 w-4" />
            Update
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex justify-start border-0 rounded-md  py-1 px-2 m-1 min-w-[128px] hover:bg-gray-100 cursor-pointer"
            onClick={() => onDelete()}
          >
            <TrashIcon className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
