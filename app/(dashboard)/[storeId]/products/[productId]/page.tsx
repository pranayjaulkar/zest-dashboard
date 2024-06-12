import prisma from "@/prisma/client";
import ProductForm from "./(components)/ProductForm";
import { ProductWithPriceTypeConverted } from "@/types";

export default async function ProductPage({ params }: { params: { productId: string; storeId: string } }) {
  const product = await prisma.product.findUnique({
    where: {
      id: params.productId,
    },
    include: {
      images: true,
      productVariations: { include: { size: true, color: true } },
    },
  });

  const categories = await prisma.category.findMany({
    where: { storeId: params.storeId },
  });

  const sizes = await prisma.size.findMany({
    where: { storeId: params.storeId },
  });

  const colors = await prisma.color.findMany({
    where: { storeId: params.storeId },
  });

  let productPriceTypeConverted: ProductWithPriceTypeConverted | null = null;

  if (product?.id) {
    // if updating product
    // convert price from decimal to number
    productPriceTypeConverted = {
      ...product,
      price: product.price.toNumber(),
    };
  }

  return (
    <div className="flex-col max-w-screen-xl mx-auto">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductForm initialData={productPriceTypeConverted} categories={categories} colors={colors} sizes={sizes} />
      </div>
    </div>
  );
}
