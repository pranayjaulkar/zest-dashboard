import prisma from "@/prisma/client";
import orderSchema from "@/zod/orderSchema";
import { auth } from "@clerk/nextjs/server";
import { ProductVariation } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { storeId: string; orderId: string } }) {
  try {
    const { userId } = auth();

    const storeByUserId = await prisma.store.findUnique({
      where: { id: params.storeId, userId: userId! },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const order = await prisma.order.findUnique({
      where: { id: params.orderId },
      include: {
        orderItems: { include: { product: true, productVariation: true } },
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.trace("[ORDER_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { storeId: string; orderId: string } }) {
  try {
    const { userId } = auth();
    const body = await req.json();

    try {
      orderSchema.parse(body);
    } catch (error) {
      console.log("error: ", error);
      return NextResponse.json({ message: "Invalid Order data" }, { status: 400 });
    }

    const orderData = body;

    const storeByUserId = await prisma.store.findUnique({
      where: { id: params.storeId, userId: userId! },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: params.orderId },
      data: orderData,
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.trace("[ORDER_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { storeId: string; orderId: string } }) {
  try {
    const { userId } = auth();

    const storeByUserId = await prisma.store.findUnique({
      where: { id: params.storeId, userId: userId! },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const order = await prisma.order.findUnique({
      where: { id: params.orderId },
      include: { orderItems: { include: { productVariation: true } } },
    });

    if (order?.orderItems.length && order.delivered) {
      prisma.orderItem
        .findMany({
          where: {
            orderId: { not: order.id },
            productVariationId: { in: order.orderItems.map((item) => item.productVariationId) },
          },
          include: { productVariation: true },
        })
        .then((otherOrderItems) => {
          let variationsNotUsedInOtherOrders: ProductVariation[] = [];

          if (otherOrderItems.length) {
            order.orderItems.forEach((currentOrderItem) => {
              const item = otherOrderItems.find(
                (otherOrderItem) => currentOrderItem.productVariationId === otherOrderItem.productVariationId
              );

              if (!item) {
                variationsNotUsedInOtherOrders.push(currentOrderItem.productVariation);
              }
            });
          }

          if (variationsNotUsedInOtherOrders.length) {
            return prisma.productVariation.deleteMany({
              where: {
                id: {
                  in: variationsNotUsedInOtherOrders.filter((v) => !v.productId).map((v) => v.id),
                },
              },
            });
          } else {
            return undefined;
          }
        })
        .catch((error) => console.trace("[ORDER_DELETE]", error));
    }

    const deletedOrder = await prisma.order.delete({
      where: { id: params.orderId },
    });

    return NextResponse.json(deletedOrder);
  } catch (error: any) {
    console.trace("[ORDER_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
