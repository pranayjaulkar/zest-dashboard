"use client";
import { useStoreModal } from "@/hooks/useStoreModalStore";
import { useEffect } from "react";
import { Store } from "@prisma/client";
type Props = {
  store: Store | null;
};
export default function Content({ store }: Props) {
  const storeState = useStoreModal();
 
  useEffect(() => {
    storeState.onClose();
  }, []);
  return (
    <div>
      <p>{store?.name}</p>
      <p>{store?.userId}</p>
    </div>
  );
}
