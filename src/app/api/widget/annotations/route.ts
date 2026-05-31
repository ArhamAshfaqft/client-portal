import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const pageUrl = searchParams.get("pageUrl");

  if (!token || !pageUrl) {
    return NextResponse.json(
      { error: "Missing token or pageUrl" },
      { status: 400, headers: corsHeaders() }
    );
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );

  const { data: link } = await supabase
    .from("preview_links")
    .select("project_id")
    .eq("token", token)
    .single();

  if (!link) {
    return NextResponse.json(
      { error: "Invalid token" },
      { status: 404, headers: corsHeaders() }
    );
  }

  const { data, error } = await supabase
    .from("feedback_items")
    .select("*")
    .eq("project_id", link.project_id)
    .eq("page_url", pageUrl)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: corsHeaders() }
    );
  }

  return NextResponse.json(
    data.map(mapFeedbackItem),
    { headers: corsHeaders() }
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { projectId, previewToken, type, content, pageUrl, selector, elementDna, createdBy } = body;
    const { coordinatesX, coordinatesY, coordinatesXEnd, coordinatesYEnd, width, height, drawData } = body;
    const { viewportWidth, viewportHeight, device, metaData } = body;
    const mirrorId: string | undefined = body.id;

    if (!projectId || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400, headers: corsHeaders() }
      );
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    );

    if (previewToken) {
      const { data: link } = await supabase
        .from("preview_links")
        .select("project_id")
        .eq("token", previewToken)
        .eq("project_id", projectId)
        .single();

      if (!link) {
        return NextResponse.json(
          { error: "Invalid preview token" },
          { status: 403, headers: corsHeaders() }
        );
      }
    } else {
      const { data: project } = await supabase
        .from("projects")
        .select("id")
        .eq("id", projectId)
        .single();

      if (!project) {
        return NextResponse.json(
          { error: "Invalid project ID" },
          { status: 403, headers: corsHeaders() }
        );
      }
    }

    const { data: feedbackItem, error } = await supabase
      .from("feedback_items")
      .insert({
        project_id: projectId,
        type: type || "pin",
        content,
        page_url: pageUrl || "",
        selector: selector || null,
        coordinates_x: coordinatesX ?? null,
        coordinates_y: coordinatesY ?? null,
        coordinates_x_end: coordinatesXEnd ?? null,
        coordinates_y_end: coordinatesYEnd ?? null,
        width: width ?? null,
        height: height ?? null,
        draw_data: drawData || null,
        element_dna: elementDna || null,
        meta_data: metaData || null,
        viewport_width: viewportWidth ?? null,
        viewport_height: viewportHeight ?? null,
        device: device || "desktop",
        status: "open",
        created_by: createdBy || "widget-client",
        ...(mirrorId ? { mirror_id: mirrorId } : {}),
      })
      .select()
      .single();

    if (error || !feedbackItem) {
      return NextResponse.json(
        { error: error?.message || "Failed to create feedback" },
        { status: 400, headers: corsHeaders() }
      );
    }

    return NextResponse.json(
      mapFeedbackItem(feedbackItem),
      { status: 201, headers: corsHeaders() }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}

function mapFeedbackItem(item: any) {
  return {
    id: item.id,
    type: item.type,
    status: item.status,
    content: item.content,
    pageUrl: item.page_url,
    elementDna: item.element_dna,
    anchorXPct: item.coordinates_x ?? 50,
    anchorYPct: item.coordinates_y ?? 50,
    widthPct: item.width,
    heightPct: item.height,
    endAnchorXPct: item.coordinates_x_end,
    endAnchorYPct: item.coordinates_y_end,
    endElementDna: null,
    drawData: item.draw_data ? JSON.parse(item.draw_data) : null,
    viewportWidth: item.viewport_width || 0,
    viewportHeight: item.viewport_height || 0,
    device: item.device || "desktop",
    createdBy: item.created_by || "Anonymous",
    createdAt: item.created_at,
    replies: [],
    media: [],
  };
}
