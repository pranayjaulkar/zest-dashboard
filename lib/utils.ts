import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { _ProductVariation } from "@/types";
import { Color, ProductVariation, Size } from "@prisma/client";

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
          quantity: relatedProductVariation?.quantity || "",
          size,
          color,
          selected: !!relatedProductVariation,
          name: color.name.split(" ").join("_") + "_" + size.name,
          id: relatedProductVariation?.id,
        },
      ];
    })
  );
  return variations;
};

export const getProductVariationsDiff = (
  oldProductVariations: ProductVariation[],
  updatedProductVariations: ProductVariation[]
) => {
  let newVars: ProductVariation[] = [];
  let existingVars: ProductVariation[] = [];
  let deletedVars: ProductVariation[] = oldProductVariations;

  // for each productVariation in updatedProductVariations loop through oldProductVariations
  // if any old productVariation is found equal to the new that means this updated variation
  // is not new and it already existed in the old variations. hence we add it to the
  // existing vars list and filter it from the deletedvars list.
  // if all old productVariation is not found equal to the updated productVariation that means
  // the updated product variation is a new one we add it to the list.
  updatedProductVariations.forEach((uptdPv) => {
    const v = oldProductVariations.find((oldPv) => oldPv.colorId === uptdPv.colorId && oldPv.sizeId === uptdPv.sizeId);

    // if uptdPv is new variation than v will be undefined
    if (!v) {
      newVars = [...newVars, uptdPv];
    }

    if (v) {
      existingVars = [...existingVars, { ...uptdPv, id: uptdPv.id }];
      deletedVars = deletedVars.filter(
        (variation) => !(variation.colorId === v.colorId && variation.sizeId === v.sizeId)
      );
    }
  });

  return { newVars, deletedVars, existingVars };
};
