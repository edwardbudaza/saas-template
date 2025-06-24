import crypto from "crypto";
import { db } from "~/server/db";
import { calculateCreditsFromAmount } from "~/lib/lemonsqueezy";

export const config = {
  api: { bodyParser: false },
};

// 🧾 Get raw body from Request
async function getRawBody(req: Request): Promise<string> {
  const buffer = await req.arrayBuffer();
  return new TextDecoder().decode(buffer);
}

// 🔒 Verify LemonSqueezy webhook signature
function verifySignature(rawBody: string, signature: string, secret: string): boolean {
  try {
    const expected = crypto
      .createHmac("sha256", secret)
      .update(rawBody, "utf8")
      .digest("hex");

    const incoming = signature.startsWith("sha256=")
      ? signature.slice(7)
      : signature;

    return crypto.timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(incoming, "hex")
    );
  } catch (err) {
    console.error("Signature verification error:", err);
    return false;
  }
}

export async function POST(req: Request) {
  const signature = req.headers.get("x-signature");
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

  if (!signature || !secret) {
    return new Response("Missing signature or secret", { status: 400 });
  }

  const rawBody = await getRawBody(req);
  const isValid = verifySignature(rawBody, signature, secret);

  if (!isValid) {
    return new Response("Invalid signature", { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch (err) {
    console.error("Webhook payload parse error:", err);
    return new Response("Invalid JSON", { status: 400 });
  }

  const event = payload.meta?.event_name;
  if (!event) {
    return new Response("Missing event_name in meta", { status: 400 });
  }

  try {
    switch (event) {
      case "order_created":
        return await handleOrderCreated(payload);
      case "order_refunded":
        return await handleOrderRefunded(payload);
      default:
        console.log("Unhandled event:", event);
        return new Response("Ignored", { status: 200 });
    }
  } catch (err) {
    console.error("Webhook handling failed:", err);
    return new Response("Webhook error", { status: 500 });
  }
}

// ✅ Handle LemonSqueezy "order_created" event
async function handleOrderCreated(payload: any) {
  console.log("📦 Webhook payload from Lemon:", payload);

  const order = payload.data;
  const attributes = order.attributes;

  // ✅ FIX: Extract userId from meta.custom_data
  const userId = payload.meta?.custom_data?.user_id;

  if (!userId) {
    console.error("❌ Missing user_id in payload.meta.custom_data");
    return new Response("Missing user_id", { status: 400 });
  }

  // Prevent duplicates
  const existing = await db.lemonSqueezyOrder.findUnique({
    where: { orderId: order.id.toString() },
  });

  if (existing) {
    console.log(`ℹ️ Duplicate order received: ${order.id}`);
    return new Response("Duplicate order", { status: 200 });
  }

  const user = await db.user.findUnique({ where: { id: userId } });

  if (!user) {
    console.error(`❌ User ${userId} not found`);
    return new Response("User not found", { status: 404 });
  }

  const amount = parseInt(attributes.total);
  const credits = calculateCreditsFromAmount(amount);

  if (credits <= 0) {
    console.error(`❌ Invalid credit amount for order ${order.id}`);
    return new Response("Invalid credit amount", { status: 400 });
  }

  try {
    const result = await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { credits: { increment: credits } },
      });

      const newOrder = await tx.lemonSqueezyOrder.create({
        data: {
          userId,
          orderId: order.id.toString(),
          productId: attributes.first_order_item?.product_id?.toString() || "unknown",
          credits,
          orderTotal: amount,
          status: attributes.status || "paid",
          customerEmail: attributes.user_email || user.email || "",
        },
      });

      return newOrder;
    });

    console.log(`✅ Processed order ${order.id} for user ${userId}, +${credits} credits`);
    return new Response("Order processed", { status: 200 });
  } catch (error) {
    console.error("🔥 Error processing order:", error);
    return new Response("Order processing failed", { status: 500 });
  }
}

// ✅ Handle LemonSqueezy "order_refunded" event
async function handleOrderRefunded(payload: any) {
  const order = payload.data;
  const attributes = order.attributes;

  const existing = await db.lemonSqueezyOrder.findUnique({
    where: { orderId: order.id.toString() },
    include: { user: true },
  });

  if (!existing) {
    return new Response("Order not found", { status: 404 });
  }

  try {
    await db.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: existing.userId },
        select: { credits: true },
      });

      const creditsToDeduct = Math.min(existing.credits, user?.credits ?? 0);

      await tx.user.update({
        where: { id: existing.userId },
        data: { credits: { decrement: creditsToDeduct } },
      });

      await tx.lemonSqueezyOrder.update({
        where: { orderId: order.id.toString() },
        data: { status: "refunded" },
      });
    });

    console.log(`✅ Refunded order ${order.id}`);
    return new Response("Refund processed", { status: 200 });
  } catch (err) {
    console.error("🔥 Refund error:", err);
    return new Response("Refund failed", { status: 500 });
  }
}
