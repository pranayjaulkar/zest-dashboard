import prisma from "@/prisma/client";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";



export async function GET(req: Request, { params }: { params: { storeId: string; orderId: string } }) {
  try {
    // const { userId } = auth();
    
    // if (!userId) {
    //   return new NextResponse("User not found", { status: 403 });
    // }
    if (!params.orderId) {
      return new NextResponse("Order id is required", { status: 400 });
    }
    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    // const storeByUserId = await prisma.store.findFirst({
    //   where: { id: params.storeId, userId },
    // });

    // if (!storeByUserId) {
    //   return new NextResponse("Unauthorized", { status: 403 });
    // }

    const order = await prisma.order.findUnique({
      where: { id: params.orderId },
      include: {
        orderItems: { include: { product: true, productVariation: true } },
      },
    });
    console.log("order: ", order);
    return NextResponse.json(order, );
  } catch (error) {
    console.trace("[ORDER_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { storeId: string; orderId: string } }) {
  try {
    // const { userId } = auth();
    const body = await req.json();
    const orderData = body;
    console.log('orderData: ', orderData);

    // if (!userId) {
    //   return new NextResponse("User not found", { status: 403 });
    // }
    if (!params.orderId) {
      return new NextResponse("Order id is required", { status: 400 });
    }
    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }
    if (!orderData.orderItems) {
      return new NextResponse("Order Items are required", { status: 400 });
    }

    if (!orderData.phone || !orderData.address) {
      return new NextResponse("Order details are required", { status: 400 });
    }

    // const storeByUserId = await prisma.store.findFirst({
    //   where: { id: params.storeId, userId },
    // });

    // if (!storeByUserId) {
    //   return new NextResponse("Unauthorized", { status: 403 });
    // }

    const updatedOrder = await prisma.order.update({
      where: { id: params.orderId },
      data: orderData,
    });

    console.log('updatedOrder: ', updatedOrder);
    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.trace("[ORDER_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { storeId: string; orderId: string } }) {
  try {
    // const { userId } = auth();
    // if (!userId) {
    //   return new NextResponse("Unauthorized", { status: 404 });
    // }
    if (!params.orderId) {
      return new NextResponse("Order id is required", { status: 400 });
    }
    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }
    // const storeByUserId = await prisma.store.findFirst({
    //   where: { id: params.storeId, userId },
    // });
    // if (!storeByUserId) {
    //   return new NextResponse("Unauthorized", { status: 403 });
    // }
    const deletedOrder = await prisma.order.delete({
      where: { id: params.orderId },
    });
    return NextResponse.json(deletedOrder);
  } catch (error: any) {
    console.trace("[ORDER_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
