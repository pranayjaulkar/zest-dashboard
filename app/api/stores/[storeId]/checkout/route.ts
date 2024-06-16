import Stripe from "stripe";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/prisma/client";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

interface _OrderItem {
  productId: string;
  productVariationId: string;
}

export async function POST(req: Request, { params }: { params: { storeId: string } }) {
  try {
    let { orderItems }: { orderItems: _OrderItem[] } = await req.json();
    if (!orderItems || orderItems.length === 0) {
      return new NextResponse("Order Items are required", { status: 400 });
    }

    const productIds = orderItems.map((orderItem) => orderItem.productId);
    const variationIds = orderItems.map((orderItem) => orderItem.productVariationId);

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    const productVariations = await prisma.productVariation.findMany({
      where: { id: { in: variationIds } },
      include: { size: true, color: true },
    });

    const newOrderItems = orderItems.map((orderItem) => {
      const product = products.filter((product) => product.id === orderItem.productId)[0];
      const productVariation = productVariations.filter(
        (productVariation) => productVariation.id === orderItem.productVariationId
      )[0];
      return { product, productVariation };
    });

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    newOrderItems.forEach((orderItem) => {
      line_items.push({
        quantity: 1,
        price_data: {
          currency: "INR",
          product_data: {
            name: orderItem.product.name,
            description: `Size: ${orderItem.productVariation.size.name}, Color: ${orderItem.productVariation.color.name}`,
          },
          unit_amount: orderItem.product.price.toNumber() * 100,
        },
      });
    });

    const order = await prisma.order.create({
      data: {
        storeId: params.storeId,
        isPaid: false,
        orderItems: {
          create: newOrderItems.map((orderItem) => ({
            product: { connect: { id: orderItem.product.id } },
            productVariation: { connect: { id: orderItem.productVariation.id } },
          })),
        },
      },
    });

    await prisma.productVariation.updateMany({
      where: { id: { in: variationIds } },
      data: { quantity: { decrement: 1 } },
    });

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: "payment",
      billing_address_collection: "required",
      phone_number_collection: { enabled: true },
      success_url: `${process.env.SERVER_URL}/api/stores/${params.storeId}/orders/success?orderId=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_STORE_URL}/cart?cancel=1`,
      metadata: { orderId: order.id },
    });

    return NextResponse.json({ url: session.url }, { headers: corsHeaders });
  } catch (error) {
    console.trace("[ORDER_GET]", error);
    return NextResponse.json("Internal Error", { status: 500 });
  }
}
