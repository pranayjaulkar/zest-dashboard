import prisma from "@/prisma/client";
import cloudinary from "@/cloudinary.config";
import productSchema from "@/zod/productSchema";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { Image, ProductVariation } from "@prisma/client";
import { getProductVariationsDiff } from "@/lib/utils";

const deleteCloudinaryImages = (images: Image[] = []) => {
  if (images?.length) {
    const imagesPublicIdArray: string[] = images.map((image) => image.cloudinaryPublicId);
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
      productSchema.parse(productData);
    } catch (error) {
      return NextResponse.json({ message: "Invalid Product data" }, { status: 400 });
    }

    const storeByUserId = await prisma.store.findUnique({
      where: { id: params.storeId, userId: userId! },
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
      deleteCloudinaryImages([...product.images, ...deletedImages]);

      let { newVars, deletedVars, existingVars } = getProductVariationsDiff(
        product.productVariations,
        productData.productVariations
      );

      let disconnectVariations: ProductVariation[] = [];

      if (deletedVars.length) {
        // get orderItems which are using product variations that are to be deleted
        const orderItems = await prisma.orderItem.findMany({
          where: { productVariationId: { in: deletedVars.map((pv) => pv.id) } },
          include: { order: true },
        });

        // if there are orderItems of this product variation then return error
        // because user can't delete variations with existing orders
        // it can be deleted only if the order is delivered or canceled
        if (orderItems?.length && orderItems.find((item) => !item.order.delivered)) {
          return NextResponse.json(
            { code: "P2014", message: "Product Variation cannot be deleted because it is used in an order" },
            { status: 400 }
          );
        }

        // if there are no orderItems of this product variation
        // then separate variations that are used by orderItems
        // from the ones that are to be deleted
        disconnectVariations = deletedVars.filter((v) => orderItems.find((item) => item.productVariationId === v.id));

        deletedVars = deletedVars.filter((v) => !orderItems.find((item) => item.productVariationId === v.id));
      }

      const updates = existingVars.map((v) => prisma.productVariation.update({ where: { id: v.id }, data: v }));

      Promise.all(updates).catch((error) => console.trace("[PRODUCT_PATCH]", error));

      const updatedProduct = await prisma.product.update({
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
            deleteMany: { id: { in: deletedVars.map((pv) => pv.id) } },
            createMany: { data: newVars },
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

    const storeByUserId = await prisma.store.findUnique({
      where: { id: params.storeId, userId: userId! },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const product = await prisma.product.findUnique({
      where: { id: params.productId },
      include: {
        images: true,
      },
    });

    // Delete all images from cloudinary database
    deleteCloudinaryImages(product?.images);

    const deletedProduct = await prisma.product.delete({
      where: { id: params.productId },
    });

    return NextResponse.json(deletedProduct);
  } catch (error: any) {
    console.trace("[PRODUCT_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
