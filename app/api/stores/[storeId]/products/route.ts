import cloudinary from "@/cloudinary.config";
import prisma from "@/prisma/client";
import { ProductSchema } from "@/types";
import { auth } from "@clerk/nextjs/server";
import { Product, Image } from "@prisma/client";
import { NextResponse } from "next/server";

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
    const { product: productData, deletedImages } = body;
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

    const imagesPublicIdArray: string[] = [
      ...productData?.images.map((image: Image) => image.cloudinaryPublicId),
      ...deletedImages?.map((image: Image) => image.cloudinaryPublicId),
    ];

    cloudinary.api.delete_resources(imagesPublicIdArray, (err, res) => {
      if (err || !res?.deleted) {
        console.trace("[PRODUCT_PATCH]: Unsuccesfull Image Deletion", err || "");
      }
    });

    const product: Product = await prisma.product.create({
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
