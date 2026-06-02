import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
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

    if (body.agencyToken) {
      return handleAutoRegister(body);
    }

    if (body._test) {
      return NextResponse.json(
        { ok: true, message: "Vercel endpoint reachable" },
        { status: 200, headers: corsHeaders() }
      );
    }

    const siteToken = request.headers.get("X-Site-Token");
    const wpApiKey = request.headers.get("X-WP-API-Key");
    let isMirror = false;

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    );

    let siteAgencyId: string | null = null;
    if (siteToken && wpApiKey) {
      const { data: site } = await supabase
        .from("sites")
        .select("wp_api_key, agency_id")
        .eq("id", siteToken)
        .eq("wp_connected", true)
        .maybeSingle();
      if (site && site.wp_api_key === wpApiKey) {
        isMirror = true;
        siteAgencyId = site.agency_id;
      }
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

    if (!isMirror) {
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
    }

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

    // Notify the agency about the new feedback. Resolve the owning site/agency
    // from the project chain (project -> site -> agency) using the service-role
    // client so this works for EVERY synced pin — not just ones whose WP
    // credentials happen to match the strict "mirror" check above.
    {
      const admin = adminClient();
      let resolvedAgencyId: string | null = siteAgencyId;
      let resolvedSiteId: string | null = siteToken || null;
      let resolvedSiteName = "your site";

      const { data: proj } = await admin
        .from("projects")
        .select("site_id, sites(id, name, agency_id)")
        .eq("id", projectId)
        .maybeSingle();

      const site = (proj as any)?.sites;
      if (site) {
        resolvedSiteId = site.id;
        resolvedSiteName = site.name || resolvedSiteName;
        resolvedAgencyId = site.agency_id || resolvedAgencyId;
      } else if (resolvedSiteId) {
        // Fall back to the site referenced by the WP X-Site-Token header.
        const { data: s } = await admin
          .from("sites")
          .select("id, name, agency_id")
          .eq("id", resolvedSiteId)
          .maybeSingle();
        if (s) {
          resolvedSiteName = s.name || resolvedSiteName;
          resolvedAgencyId = s.agency_id || resolvedAgencyId;
        }
      }

      if (resolvedAgencyId) {
        void admin.from("notifications").insert({
          agency_id: resolvedAgencyId,
          type: "new_feedback",
          title: `New feedback on ${resolvedSiteName}`,
          message: content ? `"${content.substring(0, 100)}"` : "New feedback with media",
          feedback_id: feedbackItem.id,
          site_id: resolvedSiteId,
        });
      }
    }

    let mediaRecords: any[] = [];
    if (hasMedia) {
      const mediaRows = media.map((m: any) => ({
        feedback_item_id: feedbackItem.id,
        file_url: m.fileUrl,
        file_type: m.fileType || "",
        file_name: m.fileName || "",
        storage_type: "wordpress",
      }));
      const { error: mediaError } = await supabase
        .from("feedback_media")
        .insert(mediaRows);
      if (mediaError) {
        console.error("Failed to insert media:", mediaError.message);
      } else {
        mediaRecords = mediaRows.map((r: any) => ({
          id: r.feedback_item_id + "_media",
          file_url: r.file_url,
          file_type: r.file_type,
          file_name: r.file_name,
        }));
      }
    }

    return NextResponse.json(
      { ...mapFeedbackItem(feedbackItem, mediaRecords), _mediaCount: mediaRecords.length, _hasMedia: hasMedia },
      { status: 201, headers: corsHeaders() }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}

async function handleAutoRegister(body: any) {
  const { agencyToken, siteName, siteUrl, apiKey } = body;
  if (!agencyToken || !siteName || !siteUrl || !apiKey) {
    return NextResponse.json(
      { error: "Missing required fields: agencyToken, siteName, siteUrl, apiKey" },
      { status: 400, headers: corsHeaders() }
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: agency, error: agencyError } = await supabase
    .from("agencies")
    .select("id")
    .eq("agency_token", agencyToken)
    .maybeSingle();

  if (agencyError || !agency) {
    return NextResponse.json(
      { error: "Invalid agency token" },
      { status: 404, headers: corsHeaders() }
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
      { status: 500, headers: corsHeaders() }
    );
  }

  return NextResponse.json(
    { connected: true, siteId: site.id },
    { headers: corsHeaders() }
  );
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
