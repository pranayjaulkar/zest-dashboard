"use client";
import * as z from "zod";
import { Modal } from "@/components/ui/modals";
import { useStoreModal } from "@/hooks/useStoreModalStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({ name: z.string().min(1) });

export default function StoreModal() {
  const storeModal = useStoreModal();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "" },
  });
  return (
    <Modal
      title="Create Store"
      isOpen={storeModal.isOpen}
      onClose={storeModal.onClose}
      description="Add a new store to manage products and categories"
    ></Modal>
  );
}
