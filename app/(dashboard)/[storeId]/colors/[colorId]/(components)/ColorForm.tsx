"use client";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Trash as TrashIcon } from "lucide-react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AlertModal } from "@/components/modals/alert-modal";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";

interface ColorFormProps {
  initialData: {
    id: string | undefined;
    value: string | undefined;
    name: string | undefined;
  };
}
const formSchema = z.object({
  name: z.string().min(1),
  value: z.string().min(1),
});
export type ColorFormValue = z.infer<typeof formSchema>;

const ColorForm: React.FC<ColorFormProps> = ({ initialData }) => {
  const params = useParams();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const form = useForm<ColorFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  const title = initialData?.id ? "Edit color" : "Create color";
  const description = initialData?.id ? "Edit a color" : "Add a new Color";
  const toastMessage = initialData?.id ? "Color updated" : "Color created";
  const action = initialData?.id ? "Save changes" : "Create color";
  const onSubmit = async (data: ColorFormValue) => {
    try {
      console.log("initialData: ", initialData);
      console.log("data: ", data);
      setLoading(true);
      if (initialData?.id) {
        await axios.patch(
          `/api/stores/${params.storeId}/colors/${params.colorId}`,
          data
        );
      } else {
        await axios.post(`/api/stores/${params.storeId}/colors`, data);
      }
      router.refresh();
      router.push(`/${params.storeId}/colors`);
      toast.success(toastMessage);
    } catch (error) {
      console.trace("error", error);
      toast.error("Something Went Wrong");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(
        `/api/stores/${params.storeId}/colors/${params.colorId}`
      );
      router.push(`/${params.storeId}/colors/`);
      router.refresh();

      toast.success("Color deleted");
    } catch (error) {
      console.log("error: ", error);
      toast.error("Make sure you removed all categories first using this color");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        setOpen={setOpen}
        onConfirm={onDelete}
        loading={loading}
      />
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />

        {initialData?.id && (
          <Button
            variant="destructive"
            color="icon"
            onClick={() => setOpen(true)}
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          <div className="grid grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Color Name"
                      onChange={(event) => field.onChange(event.target.value)}
                      value={field.value || ""}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Value</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Color Value"
                      onChange={(event) => field.onChange(event.target.value)}
                      value={field.value || ""}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};

export default ColorForm;
