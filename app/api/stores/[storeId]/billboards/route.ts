import prisma from "@/prisma/client";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: { storeId: string } }) {
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
    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }
    const storeByUserId = await prisma.store.findFirst({
      where: { id: params.storeId, userId },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }
    const billboard = await prisma.billboard.create({
      data: {
        label,
        imageUrl,
        cloudinaryPublicId,
        storeId: params.storeId,
      },
    });
    return NextResponse.json(billboard);
  } catch (error) {
    console.trace("[Bilboard_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(req: Request, { params }: { params: { storeId: string } }) {
  try {
    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const billboards = await prisma.billboard.findMany({
      where: { storeId: params.storeId },
    });
    return NextResponse.json(billboards);
  } catch (error) {
    console.trace("[Bilboard_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
