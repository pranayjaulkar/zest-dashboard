"use client";
import axios from "axios";
import Heading from "@/components/ui/heading";
import toast from "react-hot-toast";
import ImageUpload from "@/components/ui/image-upload";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Trash as TrashIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useParams, useRouter } from "next/navigation";
import { AlertModal } from "@/components/modals/AlertModal";
import { useLoadingBarStore } from "@/hooks/useLoadingBarStore";
import { Billboard } from "@prisma/client";
import { ImageType } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";

interface BillboardFormProps {
  initialData: Billboard | null;
}
const billboardSchema = z.object({
  label: z.string().min(1),
  imageUrl: z.string().min(1),
  cloudinaryPublicId: z.string().min(1),
});

const BillboardForm: React.FC<BillboardFormProps> = ({ initialData }) => {
  const params = useParams();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [active, setActive] = useState(false);
  const [images, setImages] = useState<ImageType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const title = initialData?.id ? "Edit billboard" : "Create billboard";
  const description = initialData?.id ? "Edit a billboard" : "Add a new Billboard";
  const toastMessage = initialData?.id ? "Billboard updated" : "Billboard created";
  const action = initialData?.id ? "Save changes" : "Create billboard";
  const loadingBar = useLoadingBarStore();

  const handleSubmit = async (event: any) => {
    try {
      event.preventDefault();
      const data = { active, imageUrl: images[0].url, cloudinaryPublicId: images[0].cloudinaryPublicId, label };
      if (billboardSchema.safeParse(data).success) {
        setError("");
        setLoading(true);
        loadingBar.start();
        if (initialData?.id) {
          await axios.patch(`/api/stores/${params.storeId}/billboards/${params.billboardId}`, data);
        } else {
          await axios.post(`/api/stores/${params.storeId}/billboards`, data);
        }
        toast.success(toastMessage);
        router.push(`/${params.storeId}/billboards`);
        router.refresh();
      } else {
        setError("Label is required.");
      }
    } catch (err) {
      alert(err);
      loadingBar.done();
      toast.error("Something Went Wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      loadingBar.start();
      await axios.delete(`/api/stores/${params.storeId}/billboards/${params.billboardId}`);
      router.push(`/${params.storeId}/billboards/`);
      router.refresh();
      toast.success("Billboard deleted");
    } catch (err) {
      console.trace("error: ", err);
      loadingBar.done();
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  useEffect(() => {
    if (initialData) {
      setLabel(initialData.label);
      setImages([{ url: initialData.imageUrl, cloudinaryPublicId: initialData.cloudinaryPublicId }]);
      setActive(initialData.active || false);
    }
  }, []);

  return (
    <>
      <AlertModal isOpen={open} setOpen={setOpen} onConfirm={handleDelete} loading={loading} />
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />

        {initialData?.id && (
          <Button variant="destructive" size="icon" onClick={() => setOpen(true)}>
            <TrashIcon className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <form action="" onSubmit={handleSubmit} className="space-y-8 w-full">
        <ImageUpload images={images} onUpload={(image) => setImages([image])} onRemove={() => setImages([])} />
        <div className="flex flex-col space-y-8">
          <div className="flex flex-col w-60 space-y-2">
            <Input
              disabled={loading}
              placeholder="Billboard Label"
              onChange={(event) => setLabel(event.target.value)}
              value={label}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <div>
            <div className="flex items-center w-60 space-x-4">
              <Checkbox checked={active} onCheckedChange={() => setActive((prev) => !prev)} />
              <label htmlFor="">Active</label>
            </div>
            <span className="text-sm mt-2 text-slate-500">Active bilboards will be shown on the home page</span>
          </div>
        </div>
        <Button disabled={loading} className="ml-auto" type="submit">
          {action}
        </Button>
      </form>
    </>
  );
};

export default BillboardForm;
