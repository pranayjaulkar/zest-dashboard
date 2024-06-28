"use client";

import axios from "axios";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useLoadingBarStore } from "@/hooks/useLoadingBarStore";
import { Color } from "@prisma/client";

import Heading from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Trash as TrashIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AlertModal } from "@/components/modals/AlertModal";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";

interface ColorFormProps {
  initialData: Color | null;
}

const formSchema = z.object({
  name: z.string().min(1),
  value: z.string().min(4).regex(/^#/, { message: "String must be a valid hex code. e.g #55bef2" }),
});

type ColorFormValue = z.infer<typeof formSchema>;

const ColorForm = ({ initialData }: ColorFormProps) => {
  const params = useParams();
  const loadingBar = useLoadingBarStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<ColorFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      value: "color?.value",
      name: "color?.name",
    },
  });

  const title = initialData ? "Edit color" : "Create color";
  const description = initialData ? "Edit a color" : "Add a new Color";
  const toastMessage = initialData ? "Color updated" : "Color created";
  const action = initialData ? "Save changes" : "Create color";

  const onSubmit = async (data: ColorFormValue, event: any) => {
    try {
      setLoading(true);
      loadingBar.start(event);

      if (initialData) {
        await axios.patch(`/api/stores/${params.storeId}/colors/${params.colorId}`, data);
      } else {
        await axios.post(`/api/stores/${params.storeId}/colors`, data);
      }

      toast.success(toastMessage);

      router.push(`/${params.storeId}/colors`);
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

      await axios.delete(`/api/stores/${params.storeId}/colors/${params.colorId}`);

      toast.success("Color deleted");

      router.push(`/${params.storeId}/colors/`);
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
          <Button variant="destructive" color="icon" onClick={() => setOpen(true)}>
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
                    <div className="flex items-center gap-x-4">
                      <Input
                        disabled={loading}
                        placeholder="Enter Hex Code"
                        onChange={(event) => field.onChange(event.target.value)}
                        value={field.value || ""}
                      />
                      <div className="border p-4 rounded-full" style={{ backgroundColor: field.value }} />
                    </div>
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
