import * as z from "zod";
import orderItemSchema from "@/zod/orderItemSchema";

const orderSchema = z.object({
  id: z.string().optional(),
  storeId: z.string().optional(),
  address: z.string(),
  phone: z.string(),
  isPaid: z.boolean(),
  delivered: z.boolean(),
  orderItems: orderItemSchema.array().nonempty().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export default orderSchema;
