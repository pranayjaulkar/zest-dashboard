"use client";
import axios from "axios";
import toast from "react-hot-toast";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLoadingBarStore } from "@/hooks/useLoadingBarStore";

import Heading from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Trash as TrashIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AlertModal } from "@/components/modals/AlertModal";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Size } from "@prisma/client";

interface SizeFormProps {
  initialData: Size | null;
}

const formSchema = z.object({
  name: z.string().min(1),
  value: z.string().min(1),
});

type SizeFormValue = z.infer<typeof formSchema>;

const SizeForm = ({ initialData }: SizeFormProps) => {
  const params = useParams();
  const loadingBar = useLoadingBarStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<SizeFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      value: "",
    },
  });

  const title = initialData ? "Edit size" : "Create size";
  const description = initialData ? "Edit a size" : "Add a new Size";
  const toastMessage = initialData ? "Size updated" : "Size created";
  const action = initialData ? "Save changes" : "Create size";

  const onSubmit = async (data: SizeFormValue, event: any) => {
    try {
      setLoading(true);
      loadingBar.start(event);

      if (initialData) {
        await axios.patch(`/api/stores/${params.storeId}/sizes/${params.sizeId}`, data);
      } else {
        await axios.post(`/api/stores/${params.storeId}/sizes`, data);
      }

      toast.success(toastMessage);

      router.push(`/${params.storeId}/sizes`);
      router.refresh();
    } catch (error) {
      loadingBar.done();

      console.trace("error", error);

      if (axios.isAxiosError(error))
        toast.error(
          error?.response?.status === 500 ? "Internal Server Error" : "Something went wrong. Please try again."
        );
      else toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (event: any) => {
    try {
      setLoading(true);
      loadingBar.start(event);

      await axios.delete(`/api/stores/${params.storeId}/sizes/${params.sizeId}`);

      toast.success("Size deleted");

      router.push(`/${params.storeId}/sizes/`);
      router.refresh();
    } catch (error) {
      loadingBar.done();

      console.trace("error: ", error);

      if (axios.isAxiosError(error))
        toast.error(
          error?.response?.status === 500 ? "Internal Server Error" : "Something went wrong. Please try again."
        );
      else toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertModal isOpen={open} setOpen={setOpen} onConfirm={onDelete} loading={loading} />
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button variant="destructive" size="icon" onClick={() => setOpen(true)}>
            <TrashIcon className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
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
                      placeholder="Size Name"
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
                      placeholder="Size Value"
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

export default SizeForm;
