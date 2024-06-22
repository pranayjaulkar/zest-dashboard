import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/prisma/client";

export async function GET(req: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const session_id = searchParams.get("session_id");
    const orderId = searchParams.get("orderId");
    if (session_id && orderId) {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      const customer = session.customer_details;
      if (customer) {
        const postal_code = customer.address?.postal_code ? customer.address.postal_code + ", " : "";
        const line1 = customer.address?.line1 ? customer.address.line1 + ", " : "";
        const line2 = customer.address?.line2 ? customer.address.line2 + ", " : "";
        const city = customer.address?.city ? customer.address.city + ", " : "";
        const state = customer.address?.state ? customer.address.state + ", " : "";
        const country = customer.address?.country ? customer.address.country : "";
        await prisma.order.update({
          where: { id: orderId },
          data: {
            isPaid: true,
            phone: customer.phone || "",
            address: `${line1}${line2}${city}${postal_code}${state}${country}`,
          },
        });
        return NextResponse.redirect(
          new URL(`${process.env.NEXT_PUBLIC_FRONTEND_STORE_URL}/stores/${params.storeId}/cart?success=1`)
        );
      }
    }
    return NextResponse.redirect(
      new URL(`${process.env.NEXT_PUBLIC_FRONTEND_STORE_URL}/stores/${params.storeId}/cart?cancel=1`)
    );
  } catch (error) {
    console.trace("[ORDER_GET]", error);
    return NextResponse.json("Internal Error", { status: 500 });
  }
}
