import { Color, Product, ProductVariation, Size, Image } from "@prisma/client";

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
