import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { Billboard } from "@prisma/client";
import cloudinary from "@/cloudinary";

export async function GET(
  req: Request,
  { params }: { params: { billboardId: string } }
) {
  try {
    if (!params.billboardId) {
      return new NextResponse("Billboard id is required", { status: 400 });
    }
    const billboard = await prismadb.billboard.findUnique({
      where: { id: params.billboardId },
    });
    return NextResponse.json(billboard);
  } catch (error) {
    console.log("[Bilboard_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; billboardId: string } }
) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { label, imageUrl } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 404 });
    }
    if (!label) {
      return new NextResponse("Label is required", { status: 400 });
    }
    if (!imageUrl) {
      return new NextResponse("Image Url is required", { status: 400 });
    }
    if (!params.billboardId) {
      return new NextResponse("Billboard id is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: { id: params.storeId, userId },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }
    const updatedBillboard = await prismadb.billboard.updateMany({
      where: { id: params.billboardId },
      data: { label, imageUrl },
    });
    return NextResponse.json(updatedBillboard);
  } catch (error) {
    console.log("[Bilboard_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; billboardId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 404 });
    }
    if (!params.billboardId) {
      return new NextResponse("Billboard id is required", { status: 400 });
    }
    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }
    const storeByUserId = await prismadb.store.findFirst({
      where: { id: params.storeId, userId },
    });
    const billboard: Billboard | null = await prismadb.billboard.findUnique({
      where: { id: params.billboardId },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }
    let imageDeleteResponse;
    try {
      if (billboard && billboard.imagePublicId) {
        imageDeleteResponse = await cloudinary.uploader.destroy(
          billboard.imagePublicId,
        );
      }
    } catch (error) {
      console.log("error", error);
    }

    if (imageDeleteResponse?.result !== "ok") {
      return new NextResponse("Something went wrong", { status: 500 });
    }
    const deletedBillboard = await prismadb.billboard.delete({
      where: { id: params.billboardId },
    });
    return NextResponse.json({res:"adfhgh"});
  } catch (error) {
    console.log("[Bilboard_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
