"use client";

import { ImagePlus as ImagePlusIcon, Trash as TrashIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./button";
import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";

// type ImageType = {
//   type: "product" | "billboard";
//   url?: string;
//   cloudinaryPublicId?: string;
//   imageUrl?: string;
//   publicId?: string;
// };

type ImageType = {
  url: string;
  cloudinaryPublicId: string;
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
      url: result.info.secure_url as string,
      cloudinaryPublicId: result.info.public_id as string,
    };
    onChange([...value, filteredResult]);
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
        {value &&
          value.map((image, i) => (
            <div
              key={i}
              className="relative rounded-md overflow-hidden w-[200px] h-[200px]"
            >
              <div className="z-10 absolute top-2 right-2">
                <Button
                  type="button"
                  onClick={() => onRemove(image.url || "")}
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
                src={image.url || ""}
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
