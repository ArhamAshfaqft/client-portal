import { NextResponse } from "next/server";

const FREEMIUS_CHECKOUT_BASE = "https://checkout.freemius.com";

const PLANS: Record<string, { pricingId: string; productId: string }> = {
  pro: { pricingId: "68134", productId: "31679" },
  agency: { pricingId: "68135", productId: "31679" },
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { plan, agencyId, userEmail } = body;

    if (!plan || !PLANS[plan]) {
      return NextResponse.json(
        { error: "Invalid plan. Use 'pro' or 'agency'." },
        { status: 400 }
      );
    }

    const config = PLANS[plan];
    const params = new URLSearchParams();
    params.set("product_id", config.productId);
    params.set("plan_id", config.pricingId);
    params.set("pricing_id", config.pricingId);

    if (agencyId) {
      params.set("metadata_agency_id", agencyId);
    }
    if (userEmail) {
      params.set("user_email", userEmail);
    }

    const checkoutUrl = `${FREEMIUS_CHECKOUT_BASE}/mode/dialog/product/${config.productId}/plan/${config.pricingId}/`;
    const fullUrl = `${checkoutUrl}?${params.toString()}`;

    return NextResponse.json({ url: fullUrl });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}
