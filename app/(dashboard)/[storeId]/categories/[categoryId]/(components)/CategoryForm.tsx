"use client";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Trash as TrashIcon } from "lucide-react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Billboard, Category } from "@prisma/client";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AlertModal } from "@/components/modals/AlertModal";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLoadingBarStore } from "@/hooks/useLoadingBarStore";

interface CategoryFormProps {
  initialData: Category | null;
  billboards: Billboard[];
}
const formSchema = z.object({
  name: z.string().min(1),
  billboardId: z.string().min(1),
});
export type CategoryFormValue = z.infer<typeof formSchema>;

const CategoryForm: React.FC<CategoryFormProps> = ({ initialData, billboards }) => {
  const params = useParams();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const loadingBar = useLoadingBarStore();
  const [loading, setLoading] = useState(false);
  const form = useForm<CategoryFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      billboardId: "",
    },
  });

  const title = initialData ? "Edit category" : "Create category";
  const description = initialData ? "Edit a category" : "Add a new Category";
  const toastMessage = initialData ? "Category updated" : "Category created";
  const action = initialData ? "Save changes" : "Create category";
  const onSubmit = async (data: CategoryFormValue, event: any) => {
    try {
      setLoading(true);
      loadingBar.start(event);
      if (initialData) {
        await axios.patch(`/api/stores/${params.storeId}/categories/${params.categoryId}`, data);
      } else {
        await axios.post(`/api/stores/${params.storeId}/categories`, data);
      }
      router.push(`/${params.storeId}/categories`);
      router.refresh();
      toast.success(toastMessage);
    } catch (error) {
      console.trace("error", error);
      loadingBar.done();
      toast.error("Something Went Wrong");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (event: any) => {
    try {
      setLoading(true);
      loadingBar.start(event);
      await axios.delete(`/api/stores/${params.storeId}/categories/${params.categoryId}`);
      router.push(`/${params.storeId}/categories/`);
      router.refresh();
      toast.success("Category deleted");
    } catch (error) {
      console.trace("error: ", error);
      loadingBar.done();
      toast.error("Something went wrong");
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
                    <Input disabled={loading} placeholder="Category Name" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="billboardId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Billboard</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a billboard" {...field} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {billboards.map((billboard) => (
                        <SelectItem key={billboard.id} value={billboard.id}>
                          {billboard.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

export default CategoryForm;
