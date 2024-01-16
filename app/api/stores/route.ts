import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";
import { SignedInAuthObject, SignedOutAuthObject } from "@clerk/nextjs/server";
type store = {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
  updateAt: Date;
} | null;

export async function POST(req: Request) {
  try {
    const { userId }: SignedInAuthObject | SignedOutAuthObject = auth();
    const { name } = await req.json();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    if (!name) {
      return new NextResponse("Name is Required", { status: 400 });
    }
    const store = await prismadb.store.create({
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
    const { storeId }: { storeId: string } = await req.json();
    if (!storeId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const store = await prismadb.store.findFirst({
      where: { id: storeId },
    });
    return NextResponse.json(store);
  } catch (error) {
    console.trace("api/stores/route.ts", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
