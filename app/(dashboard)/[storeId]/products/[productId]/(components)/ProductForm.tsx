"use client";
import * as z from "zod";
import toast from "react-hot-toast";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLoadingBarStore } from "@/hooks/useLoadingBarStore";
import VariationsSection from "./VariationsSection";
import { Category, Size, Color } from "@prisma/client";
import { _ProductVariation, ProductWithPriceTypeConverted } from "@/types";
import { AlertModal } from "@/components/modals/AlertModal";
import ImageUpload from "@/components/ui/imageUpload";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash as TrashIcon } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getProductVariations,
  getColorsFromVariations,
  getSizesFromVariations,
} from "@/lib/utils";

interface ProductFormProps {
  initialData: ProductWithPriceTypeConverted | null;
  categories: Category[];
  sizes: Size[];
  colors: Color[];
}

const formSchema = z.object({
  name: z.string().min(1),
  images: z
    .object({
      url: z.string().min(1),
      cloudinaryPublicId: z.string(),
    })
    .array()
    .nonempty(),
  categoryId: z.string().min(1),
  price: z.coerce.number().min(1),
  isFeatured: z.boolean().default(false).optional(),
  isArchived: z.boolean().default(false).optional(),
});

export type ProductFormValue = z.infer<typeof formSchema>;

const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  categories,
  colors,
  sizes,
}) => {
  const params = useParams();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [selectedColors, setSelectedColors] = useState<Color[]>(
    initialData?.id
      ? getColorsFromVariations(initialData.productVariations)
      : []
  );
  const [selectedSizes, setSelectedSizes] = useState<Size[]>(
    initialData?.id ? getSizesFromVariations(initialData.productVariations) : []
  );
  const [productVariations, setProductVariations] = useState<
    _ProductVariation[]
  >([]);
  const [loading, setLoading] = useState(false);
  const loadingBar = useLoadingBarStore();
  const title = initialData?.id ? "Edit product" : "Create product";
  const description = initialData?.id ? "Edit a product" : "Add a new Product";
  const toastMessage = initialData?.id ? "Product updated" : "Product created";
  const action = initialData?.id ? "Save changes" : "Create product";

  const form = useForm<ProductFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...initialData,
      price: parseFloat(String(initialData?.price)),
    } || {
      name: "",
      images: [],
      price: 0,
      productVariations: [],
      categoryId: "",
      isFeatured: false,
      isArchived: false,
    },
  });

  const onSubmit = async (data: ProductFormValue) => {
    try {
      setLoading(true);
      loadingBar.start();
      if (initialData?.id) {
        const variations = productVariations.map((v) => ({
          sizeId: v.sizeId,
          colorId: v.colorId,
          quantity: v.quantity,
          name: v.name,
        }));
        const newData = { ...data, productVariations: variations };
        await axios.patch(
          `/api/stores/${params.storeId}/products/${params.productId}`,
          newData
        );
      } else {
        const variations = productVariations.map((v) => ({
          sizeId: v.sizeId,
          colorId: v.colorId,
          quantity: v.quantity,
          name: v.name,
        }));
        const newData = { ...data, productVariations: variations };
        await axios.post(`/api/stores/${params.storeId}/products`, newData);
      }
      router.refresh();
      router.push(`/${params.storeId}/products`);
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
      loadingBar.start();
      await axios.delete(
        `/api/stores/${params.storeId}/products/${params.productId}`
      );
      router.push(`/${params.storeId}/products/`);
      router.refresh();

      toast.success("Product deleted");
    } catch (error) {
      console.trace("error: ", error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  useEffect(() => {
    setProductVariations(
      getProductVariations(
        selectedColors,
        selectedSizes,
        initialData?.productVariations
      )
    );
  }, [selectedColors, selectedSizes, initialData]);

  useEffect(() => {
    if (selectedColors.length && selectedSizes.length) {
      setDisabled(false);
    } else setDisabled(true);
  }, [selectedColors, selectedSizes]);

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
            size="icon"
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
          {/* Image */}

          <FormField
            control={form.control}
            name="images"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Upload Product Images</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value || []}
                    disabled={loading}
                    onChange={(updatedImages) => field.onChange(updatedImages)}
                    onRemove={(url) =>
                      field.onChange(
                        field.value.filter((image) => image.url !== url)
                      )
                    }
                  />
                </FormControl>
              </FormItem>
            )}
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
                      value={field.value || ""}
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
                      disabled={loading}
                      placeholder="Product Price"
                      onChange={(event) => field.onChange(event.target.value)}
                      value={field.value || ""}
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
                        <SelectValue
                          placeholder="Select a category"
                          {...field}
                        />
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
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <div className="space-y-l leading-none">
                    <FormLabel>Featured</FormLabel>
                    <FormDescription>
                      This product will appear on the homepage.
                    </FormDescription>
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
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <div className="space-y-l leading-none">
                    <FormLabel>Archived</FormLabel>
                    <FormDescription>
                      This product will not appear anywhere in the store.
                    </FormDescription>
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
