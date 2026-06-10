import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyWebhookSignature, getWebhookSecret, computePlanStatus } from "@/lib/freemius";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-signature") || "";
    const isSuperAdminTest = request.headers.get("x-super-admin-test") === "true";

    let secret: string;
    try {
      secret = getWebhookSecret();
    } catch {
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    if (!isSuperAdminTest && !verifyWebhookSignature(rawBody, signature, secret)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    let event: { type: string; data?: any };
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const supabase = adminClient();
    const eventType = event.type || "";
    const data = event.data || {};

    const newPlanStatus = computePlanStatus(eventType, data);

    if (!newPlanStatus) {
      return NextResponse.json({ ok: true, action: "noop", eventType });
    }

    const freemiusUserId = data?.user_id || data?.user?.id || null;
    const freemiusSubscriptionId = data?.subscription_id || data?.subscription?.id || null;

    let match: { id: string; freemius_user_id: string | null; freemius_subscription_id: string | null } | null = null;

    // Try matching by freemius_user_id first
    if (freemiusUserId) {
      const { data: agency } = await supabase
        .from("agencies")
        .select("id, freemius_user_id, freemius_subscription_id")
        .eq("freemius_user_id", freemiusUserId)
        .maybeSingle();
      if (agency) match = agency;
    }

    // Try matching by freemius_subscription_id
    if (!match && freemiusSubscriptionId) {
      const { data: agency } = await supabase
        .from("agencies")
        .select("id, freemius_user_id, freemius_subscription_id")
        .eq("freemius_subscription_id", freemiusSubscriptionId)
        .maybeSingle();
      if (agency) match = agency;
    }

    // Try checkout metadata (custom affiliate/tracking data)
    if (!match && data?.metadata?.agency_id) {
      const { data: agency } = await supabase
        .from("agencies")
        .select("id, freemius_user_id, freemius_subscription_id")
        .eq("id", data.metadata.agency_id)
        .maybeSingle();
      if (agency) match = agency;
    }

    // Try matching by user email via profiles -> agency
    const userEmail = data?.user?.email || data?.customer_email || data?.email || null;
    if (!match && userEmail) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("agency_id")
        .eq("email", userEmail)
        .maybeSingle();
      if (profile) {
        const { data: agency } = await supabase
          .from("agencies")
          .select("id, freemius_user_id, freemius_subscription_id")
          .eq("id", profile.agency_id)
          .maybeSingle();
        if (agency) match = agency;
      }
    }

    if (!match) {
      return NextResponse.json(
        { ok: true, action: "skipped", reason: "No matching agency found" },
        { status: 200 }
      );
    }

    const updates: Record<string, any> = { plan_status: newPlanStatus };
    if (freemiusUserId && !match.freemius_user_id) {
      updates.freemius_user_id = freemiusUserId;
    }
    if (freemiusSubscriptionId && !match.freemius_subscription_id) {
      updates.freemius_subscription_id = freemiusSubscriptionId;
    }

    const { error } = await supabase
      .from("agencies")
      .update(updates)
      .eq("id", match.id);

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { ok: true, action: "updated", eventType, newPlanStatus, agencyId: match.id }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}
