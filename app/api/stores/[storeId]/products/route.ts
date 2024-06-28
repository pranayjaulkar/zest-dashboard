import cloudinary from "@/cloudinary.config";
import prisma from "@/prisma/client";
import productSchema from "@/zod/productSchema";
import { auth } from "@clerk/nextjs/server";
import { Image } from "@prisma/client";
import { NextResponse } from "next/server";

const deleteCloudinaryImages = (deletedImages: Image[] = []) => {
  if (deletedImages?.length) {
    const imagesPublicIdArray: string[] = [...deletedImages.map((image: Image) => image.cloudinaryPublicId)];
    cloudinary.api.delete_resources(imagesPublicIdArray, (err, res) => {
      if (err || !res?.deleted) {
        console.trace("[PRODUCT_PATCH]: Unsuccesfull Image Deletion", err || "");
      }
    });
  }
};

export async function GET(req: Request, { params }: { params: { storeId: string } }) {
  try {
    const url = new URL(req.url);

    const searchParams = new URLSearchParams(url.search);

    const categoryId = searchParams.get("categoryId") || undefined;
    const sizeId = searchParams.get("sizeId") || undefined;
    const colorId = searchParams.get("colorId") || undefined;
    const isFeatured = searchParams.get("isFeatured");
    const isArchived = searchParams.get("isArchived");

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const products = await prisma.product.findMany({
      where: {
        storeId: params.storeId,
        categoryId,
        isFeatured: isFeatured ? true : undefined,
        isArchived: isArchived ? true : undefined,
        productVariations:
          sizeId || colorId
            ? {
                some: {
                  OR: [{ sizeId }, { colorId }],
                },
              }
            : {},
      },
      include: {
        images: true,
        category: true,
        productVariations: { include: { size: true, color: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.trace("[PRODUCT_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { storeId: string } }) {
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

    deleteCloudinaryImages(deletedImages);

    const product = await prisma.product.create({
      data: {
        ...productData,
        storeId: params.storeId,
        images: {
          createMany: {
            data: productData.images,
          },
        },
        productVariations: {
          createMany: { data: productData.productVariations },
        },
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.trace("[PRODUCT_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
