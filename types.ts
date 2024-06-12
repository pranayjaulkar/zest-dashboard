import { Color, Order, Product, ProductVariation, Size, Image } from "@prisma/client";

export const isOrder = (obj: any): obj is Order => {
  return (
    typeof obj.phone === "string" &&
    typeof obj.address === "string" &&
    typeof obj.storeId === "string" &&
    typeof obj.isPaid === "boolean" &&
    obj.createdAt instanceof Date &&
    obj.updatedAt instanceof Date &&
    typeof obj.id === "string"
  );
};

export type ImageType = {
  id?: string;
  productId?: string;
  storeId?: string;
  product?: Product;
  createdAt?: Date;
  updatedAt?: Date;
  url: string;
  cloudinaryPublicId: string;
};

export type ProductWithPriceTypeConverted =
  | Omit<Product, "price"> & { price: number } & {
      productVariations: (ProductVariation & { size: Size } & {
        color: Color;
      })[];
    } & {
      images: Image[];
    };

export type _ProductVariation = {
  sizeId: string;
  colorId: string;
  quantity: number;
  size: Size;
  color: Color;
  name: string;
  selected?: boolean;
};
