import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { wpRestUrl, wpApiKey, action, data, _updateUrl } = body;

    // Special action: update the site's WP URL in Supabase
    if (_updateUrl) {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { cookies: { getAll: () => [], setAll: () => {} } }
      );
      let query = supabase.from("sites").update({ wp_api_url: _updateUrl, url: _updateUrl });
      if (body.siteId) {
        query = query.eq("id", body.siteId);
      } else if (wpApiKey) {
        query = query.eq("wp_api_key", wpApiKey);
      } else {
        return NextResponse.json({ error: "Missing siteId or wpApiKey" }, { status: 400, headers: corsHeaders });
      }
      const { error } = await query;
      if (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500, headers: corsHeaders });
      }
      return NextResponse.json({ ok: true, message: "Site URL updated to " + _updateUrl }, { headers: corsHeaders });
    }

    if (!wpRestUrl || !wpApiKey || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400, headers: corsHeaders });
    }

    const webhookUrl = `${wpRestUrl.replace(/\/+$/, "")}/wp-json/feedspace/v1/webhook`;
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Feedspace-Key": wpApiKey,
      },
      body: JSON.stringify({ action, data }),
    });

    const text = await res.text();
    return NextResponse.json(
      { ok: res.ok, status: res.status, body: text },
      { headers: corsHeaders }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
