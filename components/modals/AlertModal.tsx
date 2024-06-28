"use client";

import Modal from "../ui/modal";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";

interface AlertModalProps {
  isOpen: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onConfirm: (event: any) => void;
  loading: boolean;
}
export const AlertModal = ({ isOpen, setOpen, onConfirm, loading }: AlertModalProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <Modal title="Are you sure?" description="This action cannot be undone." isOpen={isOpen} setOpen={setOpen}>
      <div className="pt-6 space-x-2 flex items-center justify-end w-full">
        <Button disabled={loading} variant="outline" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button disabled={loading} variant="destructive" onClick={onConfirm}>
          Continue
        </Button>
      </div>
    </Modal>
  );
};
