import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { _ProductVariation } from "@/types";
import { Color, ProductVariation, Size } from "@prisma/client";
import cloudinary from "@/cloudinary.config";
import { Image } from "@prisma/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "INR",
});

export function getRandomNumber(min: number, max: number) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}

export const getProductVariations = (
  colors: Color[],
  sizes: Size[],
  existingProductVariations:
    | (ProductVariation & { color: Color } & {
        size: Size;
      })[]
    | undefined
) => {
  let variations: _ProductVariation[] = [];
  colors.forEach((color) =>
    sizes.forEach((size) => {
      const relatedProductVariation = existingProductVariations?.find(
        (pv) => pv.colorId === color.id && pv.sizeId === size.id
      );
      variations = [
        ...variations,
        {
          sizeId: size.id,
          colorId: color.id,
          productId: relatedProductVariation?.productId || undefined,
          quantity: existingProductVariations?.find((pv) => pv.name === color.name + "_" + size.name)?.quantity || 0,
          size,
          color,
          selected: !!relatedProductVariation,
          name: color.name + "_" + size.name,
        },
      ];
    })
  );
  return variations;
};

export const getColorsFromVariations = (variations: (ProductVariation & { size: Size } & { color: Color })[]) => {
  let colorsArray: Color[] = [];
  variations.forEach((v) => {
    if (!colorsArray.find((c) => c.id === v.color.id)) {
      colorsArray = [...colorsArray, v.color];
    }
  });
  return colorsArray;
};

export const getSizesFromVariations = (variations: (ProductVariation & { size: Size } & { color: Color })[]) => {
  let sizesArray: Size[] = [];
  variations.forEach((v) => {
    if (!sizesArray.find((s) => s.id === v.size.id)) {
      sizesArray = [...sizesArray, v.size];
    }
  });
  return sizesArray;
};

export const getNewProductVariations = (
  oldProductVariations: ProductVariation[],
  newProductVariations: ProductVariation[]
) => {
  let variations: ProductVariation[] = [];
  newProductVariations.forEach((v1) => {
    const v = oldProductVariations.find((v2) => v2.colorId === v1.colorId && v2.sizeId === v1.sizeId);
    if (!v) {
      variations = [...variations, v1];
    }
  });
  return variations;
};

export const getDeletedProductVariations = (
  oldProductVariations: ProductVariation[],
  newProductVariations: ProductVariation[]
) => {
  let deletedVariations: ProductVariation[] = oldProductVariations;

  newProductVariations.forEach((v1) => {
    let pv = oldProductVariations.find((v2) => v2.colorId === v1.colorId && v2.sizeId === v1.sizeId);
    if (pv) {
      deletedVariations = deletedVariations.filter((v) => !(v.colorId === pv.colorId && v.sizeId === pv.sizeId));
    }
  });

  return deletedVariations;
};