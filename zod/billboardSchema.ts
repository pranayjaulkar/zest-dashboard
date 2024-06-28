import * as z from "zod";

const billboardSchema = z.object({
  id: z.string().optional(),
  storeId: z.string().optional(),
  label: z.string(),
  active: z.boolean(),
  imageUrl: z.string().url(),
  cloudinaryPublicId: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export default billboardSchema;
