import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export type PlanStatus = "beta" | "trialing" | "active" | "past_due" | "canceled" | "expired" | "lifetime";

export const ACTIVE_PLAN_STATUSES: PlanStatus[] = ["beta", "trialing", "active", "lifetime"];

export function getWebhookSecret(): string {
  const secret = process.env.FREEMIUS_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("FREEMIUS_WEBHOOK_SECRET is not set");
  }
  return secret;
}

export function verifyWebhookSignature(rawBody: string, signature: string, secret: string): boolean {
  const hash = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(signature, "hex"));
  } catch {
    return false;
  }
}

export function computePlanStatus(eventType: string, data: any): PlanStatus | null {
  const statusMap: Record<string, PlanStatus> = {
    "subscription.created": "active",
    "payment.created": "active",
    "user.trial.started": "trialing",
    "plan.lifetime.purchase": "lifetime",
    "subscription.cancelled": "canceled",
    "subscription.renewal.failed.last": "past_due",
  };

  return statusMap[eventType] || null;
}

export const PLAN_LABELS: Record<PlanStatus, string> = {
  beta: "Beta",
  trialing: "Trial",
  active: "Active",
  past_due: "Past Due",
  canceled: "Canceled",
  expired: "Expired",
  lifetime: "Lifetime",
};

export const PLAN_BADGE_COLORS: Record<PlanStatus, string> = {
  beta: "bg-purple-100 text-purple-800 border-purple-200",
  trialing: "bg-blue-100 text-blue-800 border-blue-200",
  active: "bg-green-100 text-green-800 border-green-200",
  past_due: "bg-red-100 text-red-800 border-red-200",
  canceled: "bg-gray-100 text-gray-800 border-gray-200",
  expired: "bg-gray-100 text-gray-800 border-gray-200",
  lifetime: "bg-amber-100 text-amber-800 border-amber-200",
};

export async function resolveAgencyPlanStatus(projectId: string): Promise<PlanStatus | null> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data } = await supabase
    .from("projects")
    .select("sites(agencies(plan_status))")
    .eq("id", projectId)
    .maybeSingle();

  const agency = (data as any)?.sites?.agencies;
  return agency?.plan_status || null;
}
