import prisma from "@/prisma/client";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { Color } from "@prisma/client";
import cloudinary from "@/cloudinary.config";
import colorSchema from "@/zod/colorSchema";

export async function GET(req: Request, { params }: { params: { colorId: string } }) {
  try {
    if (!params.colorId) {
      return new NextResponse("Color id is required", { status: 400 });
    }

    const color = await prisma.color.findUnique({
      where: { id: params.colorId },
    });

    return NextResponse.json(color);
  } catch (error) {
    console.trace("[Color_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { storeId: string; colorId: string } }) {
  try {
    const { userId } = auth();
    const body = await req.json();

    try {
      colorSchema.parse(body);
    } catch (error) {
      return NextResponse.json({ message: "Invalid color data" }, { status: 400 });
    }

    const { name, value } = body;

    if (!params.colorId) {
      return new NextResponse("Color id is required", { status: 400 });
    }

    const storeByUserId = await prisma.store.findUnique({
      where: { id: params.storeId, userId: userId! },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const updatedColor = await prisma.color.update({
      where: { id: params.colorId },
      data: { name, value },
    });

    return NextResponse.json(updatedColor);
  } catch (error) {
    console.trace("[Color_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { storeId: string; colorId: string } }) {
  try {
    const { userId } = auth();

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const storeByUserId = await prisma.store.findUnique({
      where: { id: params.storeId, userId: userId! },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const deletedColor = await prisma.color.delete({
      where: { id: params.colorId },
    });

    return NextResponse.json(deletedColor);
  } catch (error: any) {
    console.trace("[Color_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
