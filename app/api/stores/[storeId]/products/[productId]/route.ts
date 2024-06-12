import prisma from "@/prisma/client";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { Product, Image, ProductVariation } from "@prisma/client";
import cloudinary from "@/cloudinary.config";

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
    const productData: Product & { images: Image[] } & {
      productVariations: ProductVariation[];
    } = body;
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 404 });
    }
    if (!productData.name) {
      return new NextResponse("Name is required", { status: 400 });
    }
    if (!productData.price) {
      return new NextResponse("Price is required", { status: 400 });
    }
    if (!productData.categoryId) {
      return new NextResponse("Category is required", { status: 400 });
    }
    if (!productData.images || !productData.images.length) {
      return new NextResponse("Images are required", { status: 400 });
    }
    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }
    if (!params.productId) {
      return new NextResponse("Product id is required", { status: 400 });
    }

    const storeByUserId = await prisma.store.findFirst({
      where: { id: params.storeId, userId },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }
    const product = await prisma.product.findUnique({
      where: { id: params.productId },
      include: { images: true },
    });
    //delete all images in cloudinary database
    if (product && product?.images.length) {
      const imagesPublicIdArray: string[] | undefined = product?.images.map((image) => image.cloudinaryPublicId);
      const imageDeleteResponse = await cloudinary.api.delete_resources(imagesPublicIdArray || []);
      if (!imageDeleteResponse?.deleted) console.trace("[PRODUCT_PATCH]: Unsuccesfull Image Deletion");
    }

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
          //delete every variation records
          deleteMany: {},
          //recreate variation records
          createMany: { data: productData.productVariations },
        },
      },
    });
    return NextResponse.json(updatedProduct);
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
