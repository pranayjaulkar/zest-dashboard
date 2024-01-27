import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { Size } from "@prisma/client";
import cloudinary from "@/cloudinary";

export async function GET(
  req: Request,
  { params }: { params: { sizeId: string } }
) {
  try {
    if (!params.sizeId) {
      return new NextResponse("Size id is required", { status: 400 });
    }
    const size = await prismadb.size.findUnique({
      where: { id: params.sizeId },
    });
    return NextResponse.json(size);
  } catch (error) {
    console.trace("[Size_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; sizeId: string } }
) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { name, value } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 404 });
    }
    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }
    if (!value) {
      return new NextResponse("Value is required", { status: 400 });
    }
    if (!params.sizeId) {
      return new NextResponse("Size id is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: { id: params.storeId, userId },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }
    const updatedSize = await prismadb.size.update({
      where: { id: params.sizeId },
      data: { name, value },
    });
    return NextResponse.json(updatedSize);
  } catch (error) {
    console.trace("[Size_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; sizeId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 404 });
    }
    if (!params.sizeId) {
      return new NextResponse("Size id is required", { status: 400 });
    }
    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }
    const storeByUserId = await prismadb.store.findFirst({
      where: { id: params.storeId, userId },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }
    const deletedSize = await prismadb.size.delete({
      where: { id: params.sizeId },
    });
    return NextResponse.json(deletedSize);
  } catch (error:any) {
    console.trace("[Size_DELETE]", error);
    if (error?.code === "P2014") {
      return new NextResponse(error.code, { status: 400 });
    }
    return new NextResponse("Internal error", { status: 500 });
  }
}
