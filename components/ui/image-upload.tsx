"use client";
import { ImagePlus as ImagePlusIcon, Trash as TrashIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./button";
import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";
import { ImageType } from "@/types";

interface ImageUploadProps {
  multiple?: boolean;
  onUpload: (value: ImageType) => void;
  onRemove: (value: string) => void;
  images: ImageType[];
}

const ImageUpload = ({ multiple = false, onUpload, onRemove, images }: ImageUploadProps) => {
  const [isMounted, setIsMounted] = useState(false);

  const handleImageUpload = (result: any) => {
    const image = {
      url: result.info.secure_url as string,
      cloudinaryPublicId: result.info.public_id as string,
    };
    onUpload(image);
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
        {images?.map((image, i) => (
          <div key={i} className="relative rounded-md overflow-hidden w-[200px] h-[200px]">
            <div className="z-10 absolute top-2 right-2">
              <Button type="button" onClick={() => onRemove(image.url)} variant="destructive" size="icon">
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
            <Image fill className="object-cover" alt="Image" src={image.url} />
          </div>
        ))}
      </div>
      <CldUploadWidget onSuccess={handleImageUpload} uploadPreset="x4jdqunx" options={{ multiple, folder: "Zest" }}>
        {({ open, isLoading }) => {
          return (
            <Button
              type="button"
              disabled={isLoading}
              variant="secondary"
              onClick={() => {
                if (!isLoading) open();
              }}
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
