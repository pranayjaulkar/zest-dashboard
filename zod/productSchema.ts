import * as z from "zod";
import productVariationSchema from "@/zod/productVariationSchema";

const imageSchema = z.object({
  id: z.string().optional(),
  productId: z.string().optional(),
  url: z.string(),
  cloudinaryPublicId: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

const productSchema = z.object({
  id: z.string().optional(),
  storeId: z.string().optional(),
  categoryId: z.string(),
  name: z.string(),
  price: z.number(),
  images: imageSchema.array().nonempty().optional(),
  isFeatured: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  productVariations: productVariationSchema.array().nonempty().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export default productSchema;
