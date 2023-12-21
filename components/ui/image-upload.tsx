"use client";

import { ImagePlus as ImagePlusIcon, Trash as TrashIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./button";
import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";
import { BillboardFormValue } from "@/app/(dashboard)/[storeId]/billboards/[billboardId]/(components)/BillboardForm";

interface ImageUploadProps {
  disabled: boolean;
  onChange: (value: BillboardFormValue["image"]) => void;
  onRemove: (value: string) => void;
  value: BillboardFormValue["image"];
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  disabled,
  onChange,
  onRemove,
  value,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const onUpload = (result: any) => {
    const filteredResult = {
      secure_url: result.info.secure_url as string,
      public_id: result.info.public_id as string,
      signature: result.info.signature as string,
    };
    onChange(filteredResult);
  };
  useEffect(() => {
    setIsMounted(true);
  }, []);
  if (!isMounted) {
    return null;
  }
  return (
    <div>
      <div className="mb-4 flex items-center gap-4">
        {value && value.secure_url && (
          <div
            key={value.secure_url}
            className="relative rounded-md overflow-hidden w-[200px] h-[200px]"
          >
            <div className="z-10 absolute top-2 right-2">
              <Button
                type="button"
                onClick={() => onRemove(value.secure_url)}
                variant="destructive"
                size="icon"
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
            <Image
              fill
              className="object-cover"
              alt="Image"
              src={value.secure_url}
            />
          </div>
        )}
      </div>
      <CldUploadWidget onUpload={onUpload} uploadPreset="x4jdqunx">
        {({ open }) => {
          const onClick = () => {
            open();
          };
          return (
            <Button
              type="button"
              disabled={disabled}
              variant="secondary"
              onClick={onClick}
            >
              <ImagePlusIcon className="h-4 w-4 mr-2" />
              Upload an Image
            </Button>
          );
        }}
      </CldUploadWidget>
    </div>
  );
};

export default ImageUpload;
