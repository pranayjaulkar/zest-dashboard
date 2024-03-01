import { Order } from "@prisma/client";

export const isOrder = (obj: any): obj is Order => {
  return (
    typeof obj.phone === "string" &&
    typeof obj.address === "string" &&
    typeof obj.storeId === "string" &&
    typeof obj.isPaid === "boolean" &&
    obj.createdAt instanceof Date &&
    obj.updatedAt instanceof Date &&
    typeof obj.id === "string"
  );
};
