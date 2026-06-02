import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function POST(request: Request) {
  try {
    const { token, apiKey, wpUrl } = await request.json();
    if (!token || !apiKey) {
      return NextResponse.json({ error: "Missing token or apiKey" }, { status: 400 });
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    );

    const { data: site, error } = await supabase
      .from("sites")
      .select("id")
      .eq("id", token)
      .maybeSingle();

    if (error || !site) {
      return NextResponse.json({ error: "Invalid site token" }, { status: 404 });
    }

    const { error: updateError } = await supabase
      .from("sites")
      .update({ wp_api_key: apiKey, wp_api_url: wpUrl || null, wp_connected: true })
      .eq("id", site.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ connected: true, siteId: site.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
