import Stripe from "stripe";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/prisma/client";
import { Color, Product, ProductVariation, Size } from "@prisma/client";

interface _OrderItem {
  productId: string;
  product: Product;
  productVariationId: string;
  productVariation: ProductVariation & { size: Size } & { color: Color };
}

export async function POST(req: Request, { params }: { params: { storeId: string } }) {
  try {
    let { orderItems }: { orderItems: _OrderItem[] } = await req.json();

    if (!orderItems || orderItems.length === 0) {
      return new NextResponse("Order Items are required", { status: 400 });
    }

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    orderItems.forEach((orderItem) => {
      line_items.push({
        quantity: 1,
        price_data: {
          currency: "INR",
          product_data: {
            name: orderItem.product.name,
            description: `Size: ${orderItem.productVariation.size.name}, Color: ${orderItem.productVariation.color.name}`,
          },
          unit_amount: Number(orderItem.product.price) * 100,
        },
      });
    });

    const order = await prisma.order.create({
      data: {
        storeId: params.storeId,
        isPaid: false,
        orderItems: {
          create: orderItems.map((orderItem) => ({
            product: { connect: { id: orderItem.product.id } },
            productVariation: { connect: { id: orderItem.productVariation.id } },
          })),
        },
      },
    });

    prisma.productVariation
      .updateMany({
        where: { id: { in: orderItems.map((orderItem) => orderItem.productVariationId) } },
        data: { quantity: { decrement: 1 } },
      })
      .catch((error) => {
        console.trace(error);
      });

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: "payment",
      billing_address_collection: "required",
      phone_number_collection: { enabled: true },
      success_url: `${process.env.SERVER_URL}/api/stores/${params.storeId}/orders/success?orderId=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_FRONTEND_STORE_URL}/stores/${params.storeId}/cart?cancel=1`,
      metadata: { orderId: order.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.trace("[ORDER_GET]", error);
    return NextResponse.json("Internal Error", { status: 500 });
  }
}
