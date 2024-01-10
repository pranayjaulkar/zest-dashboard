"use client";

import { ImagePlus as ImagePlusIcon, Trash as TrashIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./button";
import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";
import { BillboardFormValue } from "@/app/(dashboard)/[storeId]/billboards/[billboardId]/(components)/BillboardForm";

type ImageType = {
  secureUrl: string;
  publicId: string;
};
interface ImageUploadProps {
  disabled: boolean;
  onChange: (value: ImageType[]) => void;
  onRemove: (value: string) => void;
  value: ImageType[];
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
      secureUrl: result.info.secure_url as string,
      publicId: result.info.public_id as string,
    };
    if (value?.length) {
      onChange([...value, filteredResult]);
    } else {
      onChange([filteredResult]);
    }
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
        {value &&value.map((image, i) => (
          <div
            key={i}
            className="relative rounded-md overflow-hidden w-[200px] h-[200px]"
          >
            <div className="z-10 absolute top-2 right-2">
              <Button
                type="button"
                onClick={() => onRemove(image.secureUrl)}
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
              src={image.secureUrl || ""}
            />
          </div>
        ))}
      </div>
      <CldUploadWidget onUpload={onUpload} uploadPreset="x4jdqunx">
        {({ open, isLoading }) => {
          const onClick = () => {
            if (!isLoading) open();
          };

          return (
            <Button
              type="button"
              disabled={isLoading}
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
