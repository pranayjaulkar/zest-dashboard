import prisma from "@/prisma/client";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { Billboard } from "@prisma/client";
import cloudinary from "@/cloudinary.config";

export async function GET(req: Request, { params }: { params: { billboardId: string } }) {
  try {
    if (!params.billboardId) {
      return new NextResponse("Billboard id is required", { status: 400 });
    }
    const billboard = await prisma.billboard.findUnique({
      where: { id: params.billboardId },
    });
    return NextResponse.json(billboard);
  } catch (error) {
    console.trace("[Bilboard_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { storeId: string; billboardId: string } }) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { label, imageUrl, cloudinaryPublicId } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 404 });
    }
    if (!label) {
      return new NextResponse("Label is required", { status: 400 });
    }
    if (!imageUrl || !cloudinaryPublicId) {
      return new NextResponse("Image Url is required", { status: 400 });
    }
    if (!params.billboardId) {
      return new NextResponse("Billboard id is required", { status: 400 });
    }

    const storeByUserId = await prisma.store.findFirst({
      where: { id: params.storeId, userId },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }
    const updatedBillboard = await prisma.billboard.update({
      where: { id: params.billboardId },
      data: {
        label,
        imageUrl,
        cloudinaryPublicId,
      },
    });
    return NextResponse.json(updatedBillboard);
  } catch (error) {
    console.trace("[Bilboard_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { storeId: string; billboardId: string } }) {
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
    const storeByUserId = await prisma.store.findFirst({
      where: { id: params.storeId, userId },
    });
    const billboard: Billboard | null = await prisma.billboard.findUnique({
      where: { id: params.billboardId },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }
    let imageDeleteResponse;
    if (billboard && billboard.cloudinaryPublicId) {
      imageDeleteResponse = await cloudinary.uploader.destroy(billboard.cloudinaryPublicId);
    }
    if (imageDeleteResponse?.result === "ok" || imageDeleteResponse?.result === "not found") {
      const deletedBillboard = await prisma.billboard.delete({
        where: { id: params.billboardId },
      });
      return NextResponse.json(deletedBillboard);
    } else {
      return new NextResponse("Something went wrong", { status: 500 });
    }
  } catch (error: any) {
    console.trace("[Bilboard_DELETE]", error);
    if (error?.code === "P2014") {
      return new NextResponse(error.code, { status: 400 });
    }
    return new NextResponse("Internal error", { status: 500 });
  }
}
