import * as z from "zod";

const storeSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  name: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export default storeSchema;
