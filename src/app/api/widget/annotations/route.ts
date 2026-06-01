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

  // Fetch media for all feedback items in one query
  const itemIds = (data || []).map(d => d.id);
  let mediaByItem: Record<string, any[]> = {};
  if (itemIds.length > 0) {
    const { data: mediaData } = await supabase
      .from("feedback_media")
      .select("*")
      .in("feedback_item_id", itemIds);
    if (mediaData) {
      for (const m of mediaData) {
        if (!mediaByItem[m.feedback_item_id]) mediaByItem[m.feedback_item_id] = [];
        mediaByItem[m.feedback_item_id].push(m);
      }
    }
  }

  return NextResponse.json(
    data.map(item => mapFeedbackItem(item, mediaByItem[item.id] || [])),
    { headers: corsHeaders() }
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body._test) {
      return NextResponse.json(
        { ok: true, message: "Vercel endpoint reachable" },
        { status: 200, headers: corsHeaders() }
      );
    }

    const { projectId, previewToken, type, content, pageUrl, selector, elementDna, createdBy } = body;
    const { coordinatesX, coordinatesY, coordinatesXEnd, coordinatesYEnd, width, height, drawData } = body;
    const { viewportWidth, viewportHeight, device, metaData } = body;
    const { media } = body;
    const mirrorId: string | undefined = body.id;

    const hasContent = typeof content === "string" && content.trim().length > 0;
    const hasMedia = Array.isArray(media) && media.length > 0;
    if (!projectId || (!hasContent && !hasMedia)) {
      return NextResponse.json(
        { error: "Missing content or media" },
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
      // Check projects table first, then preview_links (for re-push of annotations
      // that were validated via preview token during original submission)
      const { data: project } = await supabase
        .from("projects")
        .select("id")
        .eq("id", projectId)
        .maybeSingle();

      if (!project) {
        const { data: link } = await supabase
          .from("preview_links")
          .select("project_id")
          .eq("project_id", projectId)
          .limit(1)
          .maybeSingle();

        if (!link) {
          return NextResponse.json(
            { error: "Invalid project ID" },
            { status: 403, headers: corsHeaders() }
          );
        }
      }
    }

    // Check for existing annotation by mirror_id to prevent duplicates
    if (mirrorId) {
      const { data: existing } = await supabase
        .from("feedback_items")
        .select("id")
        .eq("mirror_id", mirrorId)
        .maybeSingle();

      if (existing) {
        const { data: item } = await supabase
          .from("feedback_items")
          .select("*")
          .eq("id", existing.id)
          .single();
        return NextResponse.json(
          item ? mapFeedbackItem(item) : { id: existing.id },
          { status: 200, headers: corsHeaders() }
        );
      }
    }

    const { data: feedbackItem, error } = await supabase
      .from("feedback_items")
      .insert({
        project_id: projectId,
        type: type || "pin",
        content: content || "",
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
        mirror_id: mirrorId || null,
      })
      .select()
      .single();

    if (error || !feedbackItem) {
      return NextResponse.json(
        { error: error?.message || "Failed to create feedback" },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Insert media records if any
    let mediaRecords: any[] = [];
    if (hasMedia) {
      const mediaRows = media.map((m: any) => ({
        feedback_item_id: feedbackItem.id,
        file_url: m.fileUrl,
        file_type: m.fileType || "",
        file_name: m.fileName || "",
        storage_type: "wordpress",
      }));
      const { data: inserted, error: mediaError } = await supabase
        .from("feedback_media")
        .insert(mediaRows)
        .select();
      if (mediaError) {
        console.error("Failed to insert media:", mediaError.message);
      } else {
        mediaRecords = inserted || [];
      }
    }

    return NextResponse.json(
      mapFeedbackItem(feedbackItem, mediaRecords),
      { status: 201, headers: corsHeaders() }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}

function mapFeedbackItem(item: any, mediaRecords: any[] = []) {
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
    media: mediaRecords.map(m => ({
      id: m.id,
      fileUrl: m.file_url,
      fileType: m.file_type,
      fileName: m.file_name,
    })),
  };
}
