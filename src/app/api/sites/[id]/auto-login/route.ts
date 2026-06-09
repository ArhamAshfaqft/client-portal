import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: siteId } = await params;

    const cookieStore = await cookies();
    const authClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );

    const { data: { user } } = await authClient.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await authClient
      .from("profiles")
      .select("user_id, full_name, role, agency_id")
      .eq("user_id", user.id)
      .single();

    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const { data: site } = await authClient
      .from("sites")
      .select("id, name, url, wp_api_key, agency_id")
      .eq("id", siteId)
      .single();

    if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });
    if (site.agency_id !== profile.agency_id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    if (!site.wp_api_key) return NextResponse.json({ error: "Site has no WP API key configured. Connect via FeedDash Connector plugin first." }, { status: 400 });

    const now = Math.floor(Date.now() / 1000);
    const payload = Buffer.from(JSON.stringify({
      sub: profile.user_id,
      name: profile.full_name,
      sid: siteId,
      iat: now,
      exp: now + 86400,
    })).toString("base64url");

    const sig = crypto.createHmac("sha256", site.wp_api_key).update(payload).digest("base64url");
    const token = payload + "." + sig;

    const wpUrl = (site.url || "").replace(/\/+$/, "");
    const loginUrl = `${wpUrl}/wp-json/feeddash/v1/auto-login?token=${encodeURIComponent(token)}`;

    return NextResponse.json({ url: loginUrl });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}
