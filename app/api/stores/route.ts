import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/prisma/client";
type store = {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
  updateAt: Date;
} | null;

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const { name } = await req.json();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    if (!name) {
      return new NextResponse("Name is Required", { status: 400 });
    }
    const store = await prisma.store.create({
      data: { name, userId },
    });
    return NextResponse.json(store);
  } catch (error) {
    console.trace("api/stores/route.ts", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
export async function GET(req: Request) {
  try {
    const store = await prisma.store.findMany({ include: { products: { include: { images: true } } } });
    return NextResponse.json(store);
  } catch (error) {
    console.trace("api/stores/route.ts", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
