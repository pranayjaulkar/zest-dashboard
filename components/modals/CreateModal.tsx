"use client";
import * as z from "zod";
import axios from "axios";
import { useCreateModalStore } from "@/hooks/useCreateModalStore";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useLoadingBarStore } from "@/hooks/useLoadingBarStore";

import Modal from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";

const formSchema = z.string().min(1);

export default function CreateModal() {
  const createModal = useCreateModalStore();
  const loadingBar = useLoadingBarStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleCreateStore = async (event: any) => {
    try {
      event?.preventDefault();
      if (formSchema.safeParse(name).success) {
        setError("");
        setLoading(true);
        loadingBar.start(event);
        const res = await axios.post("/api/stores", { name });
        toast.success("Created store successfully");
        createModal.close();
        router.push(`/${res.data.id}`);
        router.refresh();
        setLoading(false);
      } else {
        setError("Name is required.");
      }
    } catch (err) {
      console.trace(err);
      if (axios.isAxiosError(error))
        toast.error(
          error?.response?.status === 500 ? "Internal Server Error" : "Something went wrong. Please try again."
        );
      else toast.error("Something went wrong. Please try again.");
    }
  };

  const handleCancel = () => {
    createModal.close();
  };

  useEffect(() => {
    if (!createModal.isOpen) {
      setName("");
      setError("");
    }
  }, [createModal.isOpen]);

  return (
    <Modal
      title="Create Store"
      isOpen={createModal.isOpen}
      setOpen={createModal.close}
      description="Add a new store to manage products and categories"
    >
      <div>
        <div className="space-y-4 py-2 pb-4">
          <form onSubmit={handleCreateStore}>
            <Input
              disabled={loading}
              placeholder="E-Commerce"
              value={name}
              onChange={(event) => setName(event?.target.value)}
            />
            {error && <p className="text-red-500 my-2 text-sm">{error}</p>}

            <div className="pt-6 space-x-2 flex items-center justify-end">
              {createModal.cancel && (
                <Button type="button" disabled={loading} variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              )}
              <Button disabled={loading} type="submit">
                Continue
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
}
