import * as z from "zod";

const colorSchema = z.object({
  id: z.string().optional(),
  storeId: z.string().optional(),
  name: z.string(),
  value: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export default colorSchema;
