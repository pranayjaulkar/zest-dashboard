"use client";

import { useEffect, useState } from "react";
import { Modal } from "../ui/modals";
import { Button } from "../ui/button";

interface AlertModalProps {
  isOpen: boolean;
  setOpen:React.Dispatch<React.SetStateAction<boolean>>;
  onConfirm: () => void;
  loading: boolean;
}
export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  setOpen,
  onConfirm,
  loading,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  console.log("isOpen: ", isOpen);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <Modal
      title="Are you sure?"
      description="This action cannot be undone."
      isOpen={isOpen}
      setOpen={setOpen}
    >
      <div className="pt-6 space-x-2 flex items-center justify-end w-full">
        <Button
          disabled={loading}
          variant="outline"
          onClick={() => setOpen(false)}
        >
          Cancel
        </Button>
        <Button disabled={loading} variant="destructive" onClick={onConfirm}>
          Continue
        </Button>
      </div>
    </Modal>
  );
};
