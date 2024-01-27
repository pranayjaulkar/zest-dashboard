import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { Billboard } from "@prisma/client";
import cloudinary from "@/cloudinary";

export async function GET(
  req: Request,
  { params }: { params: { billboardId: string } }
) {
  try {
    if (!params.billboardId) {
      return new NextResponse("Billboard id is required", { status: 400 });
    }
    const billboard = await prismadb.billboard.findUnique({
      where: { id: params.billboardId },
    });
    return NextResponse.json(billboard);
  } catch (error) {
    console.trace("[Bilboard_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; billboardId: string } }
) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { label, image } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 404 });
    }
    if (!label) {
      return new NextResponse("Label is required", { status: 400 });
    }
    if (!image.url || !image.cloudinaryPublicId) {
      return new NextResponse("Image Url is required", { status: 400 });
    }
    if (!params.billboardId) {
      return new NextResponse("Billboard id is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: { id: params.storeId, userId },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }
    const updatedBillboard = await prismadb.billboard.updateMany({
      where: { id: params.billboardId },
      data: {
        label,
        imageUrl: image.url,
        imagePublicId: image.cloudinaryPublicId,
      },
    });
    return NextResponse.json(updatedBillboard);
  } catch (error) {
    console.trace("[Bilboard_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; billboardId: string } }
) {
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
    const storeByUserId = await prismadb.store.findFirst({
      where: { id: params.storeId, userId },
    });
    const billboard: Billboard | null = await prismadb.billboard.findUnique({
      where: { id: params.billboardId },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }
    let imageDeleteResponse;
    if (billboard && billboard.imagePublicId) {
      imageDeleteResponse = await cloudinary.uploader.destroy(
        billboard.imagePublicId
      );
    }
    if (
      imageDeleteResponse?.result === "ok" ||
      imageDeleteResponse?.result === "not found"
    ) {
      const deletedBillboard = await prismadb.billboard.delete({
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
