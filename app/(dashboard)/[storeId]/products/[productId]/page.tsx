import prismadb from "@/lib/prismadb";
import ProductForm from "./(components)/ProductForm";

export default async function ProductPage({
  params,
}: {
  params: { productId: string; storeId: string };
}) {
  const product = await prismadb.product.findUnique({
    where: {
      id: params.productId,
    },
    include: {
      images: true,
    },
  });

  const categories = await prismadb.category.findMany({
    where: { storeId: params.storeId },
  });
  const sizes = await prismadb.size.findMany({
    where: { storeId: params.storeId },
  });
  const colors = await prismadb.color.findMany({
    where: { storeId: params.storeId },
  });
  let productWithPriceNumber;
  if (product) {
    productWithPriceNumber = {
      ...product,
      price: product.price.toNumber(),
    };
  } else {
    productWithPriceNumber = product;
  }
  return (
    <div className="flex-col max-w-screen-xl mx-auto">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductForm
          initialData={productWithPriceNumber}
          categories={categories}
          colors={colors}
          sizes={sizes}
        />
      </div>
    </div>
  );
}
