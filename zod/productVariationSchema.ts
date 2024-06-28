import * as z from "zod";
import sizeSchema from "@/zod/sizeSchema";
import colorSchema from "@/zod/colorSchema";
import productSchema from "@/zod/productSchema";

const productVariationSchema = z.object({
  id: z.string().optional(),
  sizeId: z.string(),
  size: sizeSchema.optional(),
  colorId: z.string(),
  color: colorSchema.optional(),
  productId: z.string().optional(),
  name: z.string(),
  quantity: z.number(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export default productVariationSchema;
