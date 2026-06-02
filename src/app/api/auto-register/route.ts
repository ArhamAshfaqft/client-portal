import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function GET() {
  return NextResponse.json({ ok: true, message: "auto-register endpoint reachable" });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { agencyToken, siteName, siteUrl, apiKey } = body;

    if (!agencyToken || !siteName || !siteUrl || !apiKey) {
      return NextResponse.json(
        { error: "Missing required fields: agencyToken, siteName, siteUrl, apiKey" },
        { status: 400 }
      );
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    );

    const { data: agency, error: agencyError } = await supabase
      .from("agencies")
      .select("id")
      .eq("agency_token", agencyToken)
      .maybeSingle();

    if (agencyError || !agency) {
      return NextResponse.json(
        { error: "Invalid agency token" },
        { status: 404 }
      );
    }

    const { data: site, error: siteError } = await supabase
      .from("sites")
      .insert({
        agency_id: agency.id,
        name: siteName,
        url: siteUrl,
        wp_api_key: apiKey,
        wp_api_url: siteUrl,
        wp_connected: true,
      })
      .select("id")
      .single();

    if (siteError || !site) {
      return NextResponse.json(
        { error: siteError?.message || "Failed to create site" },
        { status: 500 }
      );
    }

    return NextResponse.json({ connected: true, siteId: site.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
