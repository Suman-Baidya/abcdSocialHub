import crypto from "crypto";

export interface CreateOrderParams {
  amountInPaise: number; // e.g. 49900 for ₹499
  currency?: string;     // default INR
  receipt: string;       // order or workspace reference
  notes?: Record<string, string>;
}

export interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

/**
 * Creates an order on Razorpay using official REST API
 * VERIFY: Razorpay Orders API v1 documentation (https://razorpay.com/docs/api/orders/)
 */
export async function createRazorpayOrder(
  keyId: string,
  keySecret: string,
  params: CreateOrderParams
): Promise<RazorpayOrderResponse> {
  const credentials = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${credentials}`,
    },
    body: JSON.stringify({
      amount: params.amountInPaise,
      currency: params.currency || "INR",
      receipt: params.receipt,
      notes: params.notes || {},
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Razorpay order creation failed (${response.status}): ${errorBody}`);
  }

  return response.json();
}

/**
 * Verifies Razorpay payment signature after client-side checkout
 * Formula: HMAC-SHA256(order_id + "|" + razorpay_payment_id, secret)
 */
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string,
  keySecret: string
): boolean {
  const generatedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(generatedSignature, "utf-8"),
    Buffer.from(signature, "utf-8")
  );
}

/**
 * Verifies Razorpay webhook signature
 * Formula: HMAC-SHA256(raw_body, webhook_secret)
 */
export function verifyWebhookSignature(
  rawBody: string,
  receivedSignature: string,
  webhookSecret: string
): boolean {
  const generatedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(generatedSignature, "utf-8"),
    Buffer.from(receivedSignature, "utf-8")
  );
}

/**
 * Supported Plans and Pricing configuration
 */
export const ABCD_PLANS = {
  starter: {
    id: "starter",
    name: "Starter",
    priceInRupees: 499,
    priceInPaise: 49900,
    credits: 30,
    features: [
      "30 AI Creative Posters / mo",
      "1 Brand Kit & Logo Watermark",
      "Facebook Page & Instagram Auto-Publish",
      "Bengali & English Neural Voiceover",
      "Mobile 1-Tap Magic-Link Approvals",
    ],
  },
  growth: {
    id: "growth",
    name: "Growth",
    priceInRupees: 999,
    priceInPaise: 99900,
    credits: 100,
    features: [
      "100 AI Creative Posters / mo",
      "3 Brand Kits (Multiple Outlets)",
      "All 4 Channels (FB, IG, LinkedIn, X)",
      "Priority High-Speed Generation Queue",
      "Automated Daily Autopilot Reports",
      "Priority WhatsApp Support",
    ],
  },
  topup_50: {
    id: "topup_50",
    name: "50 Extra Credits Top-Up",
    priceInRupees: 299,
    priceInPaise: 29900,
    credits: 50,
    features: [
      "50 On-Demand Creative Credits",
      "Never Expire with Active Plan",
      "Instant Balance Replenishment",
    ],
  },
} as const;

export type PlanKey = keyof typeof ABCD_PLANS;
