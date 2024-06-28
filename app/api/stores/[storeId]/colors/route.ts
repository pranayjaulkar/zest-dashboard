import prisma from "@/prisma/client";
import colorSchema from "@/zod/colorSchema";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: { storeId: string; billboardId: string } }) {
  try {
    const { userId } = auth();
    const body = await req.json();

    try {
      colorSchema.parse(body);
    } catch (error) {
      return NextResponse.json({ message: "Invalid color data" }, { status: 400 });
    }

    const { name, value } = body;

    const storeByUserId = await prisma.store.findUnique({
      where: { id: params.storeId, userId: userId! },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const color = await prisma.color.create({
      data: {
        name,
        value,
        storeId: params.storeId,
      },
    });

    return NextResponse.json(color);
  } catch (error) {
    console.trace("[color_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(req: Request, { params }: { params: { storeId: string } }) {
  try {
    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const colors = await prisma.color.findMany({
      where: { storeId: params.storeId },
    });

    return NextResponse.json(colors);
  } catch (error) {
    console.trace("[color_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
