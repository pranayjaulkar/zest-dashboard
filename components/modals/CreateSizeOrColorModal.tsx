import { Loader, X } from "lucide-react";
import { Input } from "../ui/input";
import { ChangeEventHandler, useState } from "react";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { useParams } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { Color, Size } from "@prisma/client";

export default function CreateSizeOrColorModal({
  type = "color",
  onClose,
  onSubmit,
}: {
  type: "color" | "size";
  onClose: () => void;
  onSubmit: (color: Color | Size) => void;
}) {
  const params = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [color, setColor] = useState({ name: "", value: "" });

  const handleColorChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setColor((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleCreate = async () => {
    setIsLoading(true);
    try {
      const url = `/api/stores/${params.storeId}/${type}s`;

      const res = await axios.post(url, color);
      if (res.data) {
        onSubmit(res.data);
      }
    } catch (error) {
      console.log("error: ", error);
      toast.error("Something went wrong. Please try again");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed z-30 top-0 left-0 flex w-screen h-screen items-center justify-center bg-[rgba(0,0,0,0.2)]">
      <div className="rounded-md flex flex-col bg-white border p-4 relative min-w-80 min-h-72">
        <div className="flex items-center justify-between">
          <span className="text-lg font-medium">
            Create a {type === "color" ? "Color" : "Size"}
          </span>
          <button>
            <X onClick={onClose} />
          </button>
        </div>

        <div className="flex mt-4 flex-col space-y-4">
          <Label>Name</Label>
          <Input onChange={handleColorChange} name="name" value={color.name} />

          <Label>Value</Label>
          <Input
            onChange={handleColorChange}
            name="value"
            value={color.value}
          />
          <Button onClick={handleCreate}>
            {isLoading ? <Loader /> : "Create"}
          </Button>
        </div>
      </div>
    </div>
  );
}
