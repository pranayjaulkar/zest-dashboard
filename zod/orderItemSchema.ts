import * as z from "zod";

const orderItemSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  productId: z.string(),
  productVariationId: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export default orderItemSchema;
