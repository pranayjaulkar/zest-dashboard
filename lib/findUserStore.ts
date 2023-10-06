import prismadb from "./prismadb";
import { store } from "@/types";

export const findUserStore = async (storeId: string) => {
  const store: store | null = await prismadb.store.findFirst({
    where: {
      id: storeId,
    },
  });
  return store;
};
