import prisma from "@/prisma/client";
import sizeSchema from "@/zod/sizeSchema";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { storeId: string } }) {
  try {
    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const sizes = await prisma.size.findMany({
      where: { storeId: params.storeId },
    });

    return NextResponse.json(sizes);
  } catch (error) {
    console.trace("[size_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { storeId: string; billboardId: string } }) {
  try {
    const { userId } = auth();
    const body = await req.json();

    try {
      sizeSchema.parse(body);
    } catch (error) {
      return NextResponse.json({ message: "Invalid Size data" }, { status: 400 });
    }

    const { name, value } = body;

    const storeByUserId = await prisma.store.findUnique({
      where: { id: params.storeId, userId: userId! },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }
    const size = await prisma.size.create({
      data: {
        name,
        value,
        storeId: params.storeId,
      },
    });

    return NextResponse.json(size);
  } catch (error) {
    console.trace("[size_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
