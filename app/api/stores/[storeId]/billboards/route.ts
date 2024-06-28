import prisma from "@/prisma/client";
import billboardSchema from "@/zod/billboardSchema";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { Image } from "@prisma/client";
import cloudinary from "@/cloudinary.config";

const deleteCloudinaryImages = (deletedImages: Image[] = []) => {
  if (deletedImages?.length) {
    const imagesPublicIdArray: string[] = [...deletedImages.map((image: Image) => image.cloudinaryPublicId)];
    cloudinary.api.delete_resources(imagesPublicIdArray, (err, res) => {
      if (err || !res?.deleted) {
        console.trace("[PRODUCT_PATCH]: Unsuccesfull Image Deletion", err || "");
      }
    });
  }
};

export async function GET(req: Request, { params }: { params: { storeId: string } }) {
  try {
    const billboards = await prisma.billboard.findMany({
      where: { storeId: params.storeId },
    });

    return NextResponse.json(billboards);
  } catch (error) {
    console.trace("[Bilboard_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { storeId: string } }) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { billboardData, deletedImages } = body;

    try {
      billboardSchema.parse(billboardData);
    } catch (error) {
      return NextResponse.json({ message: "Invalid billboard data" }, { status: 400 });
    }

    const { label, active, imageUrl, cloudinaryPublicId } = billboardData;

    deleteCloudinaryImages(deletedImages);

    const storeByUserId = await prisma.store.findUnique({
      where: { id: params.storeId, userId: userId! },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }
    const billboard = await prisma.billboard.create({
      data: {
        label,
        active,
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
