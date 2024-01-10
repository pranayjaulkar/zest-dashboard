import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { Product, Image } from "@prisma/client";
import cloudinary from "@/cloudinary";

export async function GET(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    if (!params.productId) {
      return new NextResponse("Product id is required", { status: 400 });
    }
    const product = await prismadb.product.findUnique({
      where: { id: params.productId },
    });
    return NextResponse.json(product);
  } catch (error) {
    console.log("[product_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; productId: string } }
) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const productData = body;

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
    if (!productData.colorId) {
      return new NextResponse("Color is required", { status: 400 });
    }
    if (!productData.sizeId) {
      return new NextResponse("Size is required", { status: 400 });
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

    const storeByUserId = await prismadb.store.findFirst({
      where: { id: params.storeId, userId },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }
    const updatedProduct = await prismadb.product.update({
      where: { id: params.productId },
      data: { ...productData },
    });
    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.log("[product_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; productId: string } }
) {
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
    const storeByUserId = await prismadb.store.findFirst({
      where: { id: params.storeId, userId },
    });
    const product: (Product & { images: Image[] }) | null =
      await prismadb.product.findUnique({
        where: { id: params.productId },
        include: {
          images: true,
        },
      });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }
    const imagesPublicIdArray: string[] | undefined = product?.images.map(
      (image) => image.publicId
    );
    let imageDeleteResponse;
    if (product && product?.images.length) {
      imageDeleteResponse = await cloudinary.api.delete_resources(
        imagesPublicIdArray || []
      );
    }
    if (
      imageDeleteResponse?.result === "ok" ||
      imageDeleteResponse?.result === "not found"
    ) {
      const deletedProduct = await prismadb.product.delete({
        where: { id: params.productId },
      });
      return NextResponse.json(deletedProduct);
    } else {
      return new NextResponse("Something went wrong", { status: 500 });
    }
  } catch (error) {
    console.log("[product_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
