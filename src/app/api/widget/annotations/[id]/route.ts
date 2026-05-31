import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

function anonClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

// Best-effort: push mutation back to the WordPress site
async function notifySiteWebhook(feedbackItemId: string, action: string, data: Record<string, any>) {
  try {
    const supabase = anonClient();
    const { data: item } = await supabase
      .from("feedback_items")
      .select("project_id")
      .eq("id", feedbackItemId)
      .single();
    if (!item) return;

    const { data: project } = await supabase
      .from("projects")
      .select("site_id")
      .eq("id", item.project_id)
      .single();
    if (!project) return;

    const { data: site } = await supabase
      .from("sites")
      .select("url, wp_api_url, wp_api_key")
      .eq("id", project.site_id)
      .single();
    if (!site) return;

    const wpRestUrl = site.wp_api_url || site.url;
    const wpApiKey = site.wp_api_key;
    if (!wpRestUrl || !wpApiKey) return;

    const webhookUrl = `${wpRestUrl.replace(/\/+$/, "")}/wp-json/feedspace/v1/webhook`;
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Feedspace-Key": wpApiKey },
      body: JSON.stringify({ action, data }),
    });
  } catch {
    // Webhook is best-effort, don't block the response
  }
}

function corsHeaders() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();

    if (body.previewToken) {
      const supabase = anonClient();
      const { data: link } = await supabase
        .from("preview_links")
        .select("project_id")
        .eq("token", body.previewToken)
        .single();

      if (!link) {
        return NextResponse.json(
          { error: "Invalid token" },
          { status: 403, headers: corsHeaders() }
        );
      }
    }

    const supabase = anonClient();
    const updates: Record<string, any> = {};

    if (body.content !== undefined) updates.content = body.content;
    if (body.status !== undefined) updates.status = body.status;
    if (body.selector !== undefined) updates.selector = body.selector;

    const { data, error } = await supabase
      .from("feedback_items")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message || "Not found" },
        { status: 404, headers: corsHeaders() }
      );
    }

    notifySiteWebhook(id, "update_status", { id, status: updates.status });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (token) {
    const supabase = anonClient();
    const { data: link } = await supabase
      .from("preview_links")
      .select("project_id")
      .eq("token", token)
      .single();

    if (!link) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 403, headers: corsHeaders() }
      );
    }
  }

  const supabase = anonClient();
  const { error } = await supabase
    .from("feedback_items")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: corsHeaders() }
    );
  }

  notifySiteWebhook(id, "delete", { id });

  return NextResponse.json({ deleted: true }, { headers: corsHeaders() });
}
