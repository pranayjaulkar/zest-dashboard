import * as z from "zod";

export const categorySchema = z.object({
  id: z.string().optional(),
  storeId: z.string().optional(),
  billboardId: z.string(),
  name: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export default categorySchema;
