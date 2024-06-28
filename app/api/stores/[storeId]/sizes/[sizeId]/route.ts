import prisma from "@/prisma/client";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import sizeSchema from "@/zod/sizeSchema";

export async function GET(req: Request, { params }: { params: { sizeId: string } }) {
  try {
    if (!params.sizeId) {
      return new NextResponse("Size id is required", { status: 400 });
    }
    
    const size = await prisma.size.findUnique({
      where: { id: params.sizeId },
    });

    return NextResponse.json(size);
  } catch (error) {
    console.trace("[SIZE_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { storeId: string; sizeId: string } }) {
  try {
    const { userId } = auth();
    const body = await req.json();

    try {
      sizeSchema.parse(body);
    } catch (error) {
      return NextResponse.json({ message: "Invalid Size data" }, { status: 400 });
    }

    const { name, value } = body;

    if (!params.sizeId) {
      return new NextResponse("Size id is required", { status: 400 });
    }

    const storeByUserId = await prisma.store.findUnique({
      where: { id: params.storeId, userId: userId! },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }
    const updatedSize = await prisma.size.update({
      where: { id: params.sizeId },
      data: { name, value },
    });
    return NextResponse.json(updatedSize);
  } catch (error) {
    console.trace("[SIZE_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { storeId: string; sizeId: string } }) {
  try {
    const { userId } = auth();

    const storeByUserId = await prisma.store.findUnique({
      where: { id: params.storeId, userId: userId! },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }
    const deletedSize = await prisma.size.delete({
      where: { id: params.sizeId },
    });
    return NextResponse.json(deletedSize);
  } catch (error: any) {
    console.trace("[SIZE_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
