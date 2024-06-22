import prisma from "@/prisma/client";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { Product, Image, ProductVariation } from "@prisma/client";
import cloudinary from "@/cloudinary.config";
import { getDeletedProductVariations, getNewProductVariations } from "@/lib/utils";
import { ProductSchema } from "@/types";

const deleteCloudinaryImages = (images: Image[], deletedImages: Image[]) => {
  if (images.length) {
    const imagesPublicIdArray: string[] = [
      ...images.map((image) => image.cloudinaryPublicId),
      ...deletedImages.map((image: Image) => image.cloudinaryPublicId),
    ];
    cloudinary.api.delete_resources(imagesPublicIdArray, (err, res) => {
      if (err || !res?.deleted) {
        console.trace("[PRODUCT_PATCH]: Unsuccesfull Image Deletion", err || "");
      }
    });
  }
};

export async function GET(req: Request, { params }: { params: { productId: string } }) {
  try {
    if (!params.productId) {
      return new NextResponse("Product id is required", { status: 400 });
    }
    const product = await prisma.product.findUnique({
      where: { id: params.productId },
      include: {
        category: true,
        images: true,
        productVariations: { include: { color: true, size: true } },
      },
    });
    return NextResponse.json(product);
  } catch (error) {
    console.trace("[PRODUCT_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { storeId: string; productId: string } }) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { productData, deletedImages } = body;
    try {
      ProductSchema.parse(productData);
    } catch (error) {
      return NextResponse.json({ message: "Invalid Product data", error });
    }

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 404 });
    }

    const storeByUserId = await prisma.store.findFirst({
      where: { id: params.storeId, userId },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const product = await prisma.product.findUnique({
      where: { id: params.productId },
      include: { images: true, productVariations: true },
    });
    if (product) {
      //delete all deleted images in cloudinary database
      deleteCloudinaryImages(product.images, deletedImages);

      // get newly create variations
      const newProductVariations = getNewProductVariations(product.productVariations, productData.productVariations);

      // get deleted variations
      let deletedProductVariations = getDeletedProductVariations(
        product.productVariations,
        productData.productVariations
      );

      let disconnectVariations: ProductVariation[] = [];

      if (deletedProductVariations.length) {
        // get orderItems which are using product variations that are to be deleted
        const orderItems = await prisma.orderItem.findMany({
          where: { productVariationId: { in: deletedProductVariations.map((pv) => pv.id) } },
          include: { order: true },
        });

        // if there are orderItems then return error
        if (orderItems?.length && orderItems.find((item) => !item.order.delivered)) {
          return new NextResponse("Product Variation cannot be deleted because it is used in an order", {
            status: 400,
          });
        }

        // if not then separate variations that are used by orderItems
        // from the ones that are to be deleted
        disconnectVariations = deletedProductVariations.filter((v) =>
          orderItems.find((item) => item.productVariationId === v.id)
        );

        deletedProductVariations = deletedProductVariations.filter(
          (v) => !orderItems.find((item) => item.productVariationId === v.id)
        );
      }

      let updatedProduct = null;

      updatedProduct = await prisma.product.update({
        where: { id: params.productId },
        data: {
          ...productData,
          images: {
            //delete every image records
            deleteMany: {},
            //recreate new images records
            createMany: {
              data: productData.images,
            },
          },
          productVariations: {
            disconnect: disconnectVariations.map((v) => ({ id: v.id })),
            deleteMany: { id: { in: deletedProductVariations.map((pv) => pv.id) } },
            createMany: { data: newProductVariations },
          },
        },
      });

      return NextResponse.json(updatedProduct);
    } else {
      return new NextResponse(`Product with ID ${params.productId} not found`, { status: 404 });
    }
  } catch (error) {
    console.trace("[PRODUCT_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { storeId: string; productId: string } }) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 404 });
    }
    if (!params.productId) {
      return new NextResponse("Product id is required", { status: 400 });
    }
    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }
    const storeByUserId = await prisma.store.findFirst({
      where: { id: params.storeId, userId },
    });
    const product: (Product & { images: Image[] }) | null = await prisma.product.findUnique({
      where: { id: params.productId },
      include: {
        images: true,
      },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }
    const imagesPublicIdArray: string[] | undefined = product?.images.map((image) => image.cloudinaryPublicId);
    let imageDeleteResponse;
    // Delete all images from cloudinary database
    if (product?.images.length) {
      imageDeleteResponse = await cloudinary.api.delete_resources(imagesPublicIdArray || []);
      if (imageDeleteResponse?.deleted) {
        // Delete all corresponding image records from database
        await prisma.image.deleteMany({
          where: { productId: params.productId },
        });

        // Delete all corresponding product variations
        await prisma.productVariation.deleteMany({
          where: { productId: params.productId },
        });
        const deletedProduct = await prisma.product.delete({
          where: { id: params.productId },
        });
        return NextResponse.json(deletedProduct);
      } else {
        console.trace("[PRODUCT_DELETE]", "imageDeleteResponse: ", imageDeleteResponse);
        return new NextResponse("Something went wrong", { status: 500 });
      }
    } else {
      await prisma.productVariation.deleteMany({
        where: { productId: params.productId },
      });
      const deletedProduct = await prisma.product.delete({
        where: { id: params.productId },
      });
      return NextResponse.json(deletedProduct);
    }
  } catch (error: any) {
    console.trace("[PRODUCT_DELETE]", error);
    if (error?.code === "P2014") {
      return new NextResponse(error.code, { status: 400 });
    }
    return new NextResponse("Internal error", { status: 500 });
  }
}
