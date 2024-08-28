import prisma from "@/prisma/client";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { Billboard } from "@prisma/client";
import cloudinary from "@/cloudinary.config";
import billboardSchema from "@/zod/billboardSchema";

const deleteCloudinaryImages = (deletedImages: { cloudinaryPublicId: string }[] = []) => {
  if (deletedImages?.length) {
    const imagesPublicIdArray: string[] = [...deletedImages.map((image) => image.cloudinaryPublicId)];

    cloudinary.api.delete_resources(imagesPublicIdArray, (err, res) => {
      if (err || !res?.deleted) {
        console.trace("[PRODUCT_PATCH]: Unsuccesfull Image Deletion", err || "");
      } else {
        console.trace("[PRODUCT_PATCH]: Succesfull Image Deletion", res || "");
      }
    });
  }
};

export async function GET(req: Request, { params }: { params: { billboardId: string } }) {
  try {
    if (!params.billboardId) {
      return new NextResponse("Billboard id is required", { status: 400 });
    }

    const billboard = await prisma.billboard.findUnique({
      where: { id: params.billboardId },
    });

    return NextResponse.json(billboard);
  } catch (error) {
    console.trace("[Bilboard_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { storeId: string; billboardId: string } }) {
  try {
    const { userId } = auth();
    const { billboardData, deletedImages } = await req.json();

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

    const updatedBillboard = await prisma.billboard.update({
      where: { id: params.billboardId },
      data: {
        label,
        active,
        imageUrl,
        cloudinaryPublicId,
      },
    });

    return NextResponse.json(updatedBillboard);
  } catch (error) {
    console.trace("[Bilboard_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { storeId: string; billboardId: string } }) {
  try {
    const { userId } = auth();

    const storeByUserId = await prisma.store.findUnique({
      where: { id: params.storeId, userId: userId! },
    });

    const billboard: Billboard | null = await prisma.billboard.findUnique({
      where: { id: params.billboardId },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }
    if (billboard) deleteCloudinaryImages([{ cloudinaryPublicId: billboard.cloudinaryPublicId }]);

    const deletedBillboard = await prisma.billboard.delete({
      where: { id: params.billboardId },
    });

    return NextResponse.json(deletedBillboard);
  } catch (error: any) {
    console.trace("[Bilboard_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
