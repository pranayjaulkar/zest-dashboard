import prisma from "@/prisma/client";
import categorySchema from "@/zod/categorySchema";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { categoryId: string } }) {
  try {
    if (!params.categoryId) {
      return new NextResponse("Category id is required", { status: 400 });
    }
    const category = await prisma.category.findUnique({
      where: { id: params.categoryId },
      include: { billboard: true },
    });
    return NextResponse.json(category);
  } catch (error) {
    console.trace("[Category_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { storeId: string; categoryId: string } }) {
  try {
    const { userId } = auth();
    const body = await req.json();

    try {
      categorySchema.parse(body);
    } catch (error) {
      return NextResponse.json({ message: "Invalid category data" }, { status: 400 });
    }

    const { name, billboardId } = body;

    const storeByUserId = await prisma.store.findUnique({
      where: { id: params.storeId, userId: userId! },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }
    const updatedCategory = await prisma.category.update({
      where: { id: params.categoryId },
      data: { name, billboardId },
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.trace("[Category_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { storeId: string; categoryId: string } }) {
  try {
    const { userId } = auth();

    const storeByUserId = await prisma.store.findUnique({
      where: { id: params.storeId, userId: userId! },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }
    const deletedCategory = await prisma.category.delete({
      where: { id: params.categoryId },
    });

    return NextResponse.json(deletedCategory);
  } catch (error: any) {
    console.trace("[Category_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
