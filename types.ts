import { Color, Product, ProductVariation, Size, Image } from "@prisma/client";
import * as z from "zod";

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
  productId?: string;
  size: Size;
  color: Color;
  name: string;
  selected?: boolean;
};

export type ProductWithVarsAndImages = Product & { images: Image[] } & {
  productVariations: ProductVariation[];
};

export const ProductSchema = z.object({
  id: z.string().optional(),
  storeId: z.string().optional(),
  categoryId: z.string(),
  name: z.string(),
  price: z.number(),
  images: z
    .array(
      z.object({
        id: z.string().optional(),
        productId: z.string().optional(),
        url: z.string(),
        cloudinaryPublicId: z.string(),
        createdAt: z.date().optional(),
        updatedAt: z.date().optional(),
      })
    )
    .nonempty()
    .optional(),
  isFeatured: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  productVariations: z
    .array(
      z.object({
        id: z.string().optional(),
        sizeId: z.string(),
        colorId: z.string(),
        productId: z.string().optional(),
        name: z.string(),
        quantity: z.number(),
        createdAt: z.date().optional(),
        updatedAt: z.date().optional(),
      })
    )
    .nonempty()
    .optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
