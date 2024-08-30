"use client";
import * as z from "zod";
import toast from "react-hot-toast";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLoadingBarStore } from "@/hooks/useLoadingBarStore";
import { Category, Size, Color } from "@prisma/client";
import { _ProductVariation, ImageType, ProductWithPriceTypeConverted } from "@/types";
import { Trash as TrashIcon } from "lucide-react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { getProductVariations, getColorsFromVariations, getSizesFromVariations } from "@/lib/utils";

import VariationsSection from "./VariationsSection";
import Heading from "@/components/ui/heading";
import ImageUpload from "@/components/ui/image-upload";
import { AlertModal } from "@/components/modals/AlertModal";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProductFormProps {
  initialData: ProductWithPriceTypeConverted | null;
  categories: Category[];
  sizes: Size[];
  colors: Color[];
}

const formSchema = z.object({
  name: z.string().min(1),
  categoryId: z.string().min(1),
  price: z.coerce.number().min(1),
  isFeatured: z.boolean().default(false).optional(),
  isArchived: z.boolean().default(false).optional(),
});

type ProductFormValue = z.infer<typeof formSchema>;

const ProductForm = ({ initialData, categories, colors, sizes }: ProductFormProps) => {
  const params = useParams();
  const router = useRouter();
  const loadingBar = useLoadingBarStore();
  const [open, setOpen] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [deletedImages, setDeletedImages] = useState<ImageType[]>([]);
  const [images, setImages] = useState<ImageType[]>([]);
  const [productVariations, setProductVariations] = useState<_ProductVariation[]>([]);
  const [selectedColors, setSelectedColors] = useState<Color[]>(
    initialData ? getColorsFromVariations(initialData.productVariations) : []
  );
  const [selectedSizes, setSelectedSizes] = useState<Size[]>(
    initialData ? getSizesFromVariations(initialData.productVariations) : []
  );
  const title = initialData ? "Edit product" : "Create product";
  const description = initialData ? "Edit a product" : "Add a new Product";
  const toastMessage = initialData ? "Product updated" : "Product created";
  const action = initialData ? "Save changes" : "Create product";
  const defaultValues = initialData
    ? {
        ...initialData,
        price: parseFloat(String(initialData?.price)),
      }
    : {
        name: "",
        price: 0,
        productVariations: [],
        categoryId: "",
        isFeatured: false,
        isArchived: false,
      };

  const form = useForm<ProductFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (data: ProductFormValue, event: any) => {
    try {
      if (!images.length) {
        toast.error("No images. Please upload images");
      } else if (!productVariations.length) {
        toast.error("No product variants. Create product variant");
      } else if (!productVariations.find((pv) => pv.selected === true)) {
        toast.error("No product variants selected");
      } else {
        setLoading(true);
        loadingBar.start(event);

        const variations = productVariations
          .filter((v) => v.selected)
          .map((v) => ({
            sizeId: v.sizeId,
            colorId: v.colorId,
            productId: v.productId,
            quantity: v.quantity,
            name: v.name,
            id: v?.id,
          }));

        const newData = { productData: { ...data, images, productVariations: variations }, deletedImages };

        if (initialData) {
          await axios.patch(`/api/stores/${params.storeId}/products/${params.productId}`, newData);
        } else {
          await axios.post(`/api/stores/${params.storeId}/products`, newData);
        }

        toast.success(toastMessage);

        router.push(`/${params.storeId}/products`);
        router.refresh();
      }
    } catch (error) {
      loadingBar.done();
      setLoading(false);

      // console.trace("error", error);

      if (axios.isAxiosError(error))
        if (error?.response?.data?.code === "P2014") toast.error(error.response.data.message);
        else
          toast.error(
            error?.response?.status === 500 ? "Internal Server Error" : "Something went wrong. Please try again."
          );
      else toast.error("Something went wrong. Please try again.");
    }
  };

  const onDelete = async (event: any) => {
    try {
      setLoading(true);
      loadingBar.start(event);

      await axios.delete(`/api/stores/${params.storeId}/products/${params.productId}`);

      router.push(`/${params.storeId}/products/`);
      router.refresh();

      toast.success("Product deleted successfully.");
    } catch (error: any) {
      loadingBar.done();

      // console.trace("error: ", error);

      if (axios.isAxiosError(error))
        if (error?.response?.data?.code === "P2014") toast.error(error.response.data.message);
        else
          toast.error(
            error?.response?.status === 500 ? "Internal Server Error" : "Something went wrong. Please try again."
          );
      else toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  useEffect(() => {
    setProductVariations(getProductVariations(selectedColors, selectedSizes, initialData?.productVariations));
  }, [selectedColors, selectedSizes, initialData]);

  useEffect(() => {
    if (selectedColors.length && selectedSizes.length) {
      setDisabled(false);
    } else setDisabled(true);
  }, [selectedColors, selectedSizes]);

  useEffect(() => {
    if (initialData?.images)
      setImages(initialData.images.map((img) => ({ url: img.url, cloudinaryPublicId: img.cloudinaryPublicId })));
  }, []);

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
          {/* Image */}

          <ImageUpload
            multiple
            images={images}
            onUpload={(image) => setImages((prev) => [...prev, image])}
            onRemove={(url) => {
              setDeletedImages((prev) => [...prev, images.filter((img) => img.url === url)[0]]);
              setImages(images.filter((img) => img.url !== url));
            }}
          />

          {/* Name */}

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
                      placeholder="Product Name"
                      onChange={(event) => field.onChange(event.target.value)}
                      value={field.value}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Price  */}

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      disabled={loading}
                      placeholder="Product Price"
                      onChange={(event) => field.onChange(event.target.value)}
                      value={field.value}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Category  */}

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a category" {...field} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>

          {/* IsFeatured  */}

          <div className="grid grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="isFeatured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  <div className="space-y-2 leading-none">
                    <FormLabel>Featured</FormLabel>
                    <FormDescription>This product will appear on the homepage.</FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {/* IsArchived */}

            <FormField
              control={form.control}
              name="isArchived"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  <div className="space-y-2 leading-none">
                    <FormLabel>Archived</FormLabel>
                    <FormDescription>This product will not appear anywhere in the store.</FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
          <Separator />

          {/* Variation Tables */}

          <VariationsSection
            colors={colors}
            sizes={sizes}
            productVariations={productVariations}
            setProductVariations={setProductVariations}
            disabled={disabled}
            selectedColors={selectedColors}
            setSelectedColors={setSelectedColors}
            selectedSizes={selectedSizes}
            setSelectedSizes={setSelectedSizes}
            initialData={initialData}
          />
          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};

export default ProductForm;
