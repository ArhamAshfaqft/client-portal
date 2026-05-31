import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const formData = await request.formData();

  const projectId = formData.get("projectId") as string;
  const type = formData.get("type") as string;
  const content = formData.get("content") as string;
  const pageUrl = formData.get("pageUrl") as string;
  const coordinatesX = formData.get("coordinatesX")
    ? Number(formData.get("coordinatesX"))
    : null;
  const coordinatesY = formData.get("coordinatesY")
    ? Number(formData.get("coordinatesY"))
    : null;
  const viewportWidth = formData.get("viewportWidth")
    ? Number(formData.get("viewportWidth"))
    : null;
  const viewportHeight = formData.get("viewportHeight")
    ? Number(formData.get("viewportHeight"))
    : null;

  // New annotation fields
  const coordinatesXEnd = formData.get("coordinatesXEnd")
    ? Number(formData.get("coordinatesXEnd"))
    : null;
  const coordinatesYEnd = formData.get("coordinatesYEnd")
    ? Number(formData.get("coordinatesYEnd"))
    : null;
  const width = formData.get("width")
    ? Number(formData.get("width"))
    : null;
  const height = formData.get("height")
    ? Number(formData.get("height"))
    : null;
  const drawData = formData.get("drawData") as string | null;
  const elementDnaRaw = formData.get("elementDna") as string | null;
  const metaDataRaw = formData.get("metaData") as string | null;
  const selector = formData.get("selector") as string | null;
  const device = formData.get("device") as string | null;

  const mediaFiles = formData.getAll("media") as File[];
  const mediaUrlsRaw = formData.get("mediaUrls") as string | null;
  const storageTypeFromWidget = formData.get("storageType") as string | null;

  const previewToken = formData.get("previewToken") as string;
  const isDemo = previewToken?.startsWith("demo-");

  let createdBy = "";
  if (!isDemo) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      createdBy = user.id;
    }
  }

  let elementDna = null;
  let metaData = null;
  if (elementDnaRaw) try { elementDna = JSON.parse(elementDnaRaw); } catch { }
  if (metaDataRaw) try { metaData = JSON.parse(metaDataRaw); } catch { }

  const { data: feedbackItem, error: fbError } = await supabase
    .from("feedback_items")
    .insert({
      project_id: projectId,
      type,
      content,
      page_url: pageUrl,
      selector,
      coordinates_x: coordinatesX,
      coordinates_y: coordinatesY,
      coordinates_x_end: coordinatesXEnd,
      coordinates_y_end: coordinatesYEnd,
      width,
      height,
      draw_data: drawData,
      element_dna: elementDna,
      meta_data: metaData,
      viewport_width: viewportWidth,
      viewport_height: viewportHeight,
      device: device || "desktop",
      status: "open",
      created_by: createdBy || undefined,
    })
    .select()
    .single();

  if (fbError || !feedbackItem) {
    return NextResponse.json(
      { error: fbError?.message || "Failed to create feedback" },
      { status: 400 }
    );
  }

  if (mediaUrlsRaw) {
    const urls: string[] = JSON.parse(mediaUrlsRaw);
    for (const url of urls) {
      await supabase.from("feedback_media").insert({
        feedback_item_id: feedbackItem.id,
        file_url: url,
        file_type: "",
        file_name: url.split("/").pop() || "",
        file_size: 0,
        storage_type: storageTypeFromWidget || "wordpress",
      });
    }
  } else if (mediaFiles.length > 0) {
    const { data: siteData } = await supabase
      .from("projects")
      .select("sites!inner(*)")
      .eq("id", projectId)
      .single();

    const site = (siteData as unknown as { sites: { wp_api_url: string | null; wp_application_password: string | null } })?.sites;

    for (const file of mediaFiles) {
      let fileUrl = "";
      let storageType = "supabase";

      if (site?.wp_api_url && site?.wp_application_password) {
        try {
          const auth = btoa(site.wp_application_password);
          const wpFormData = new FormData();
          wpFormData.append("file", file, file.name);

          const wpRes = await fetch(
            `${site.wp_api_url}/wp/v2/media`,
            {
              method: "POST",
              headers: { Authorization: `Basic ${auth}` },
              body: wpFormData,
            }
          );

          if (wpRes.ok) {
            const wpData = await wpRes.json();
            fileUrl = wpData.source_url;
            storageType = "wordpress";
          }
        } catch {
          // fallback to Supabase storage
        }
      }

      if (!fileUrl) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("feedback-media")
          .upload(
            `${projectId}/${Date.now()}-${file.name}`,
            file
          );

        if (uploadError) continue;

        const { data: publicUrl } = supabase.storage
          .from("feedback-media")
          .getPublicUrl(uploadData.path);

        fileUrl = publicUrl.publicUrl;
        storageType = "supabase";
      }

      await supabase.from("feedback_media").insert({
        feedback_item_id: feedbackItem.id,
        file_url: fileUrl,
        file_type: file.type,
        file_name: file.name,
        file_size: file.size,
        storage_type: storageType,
      });
    }
  }

  return NextResponse.json(feedbackItem);
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("agency_id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const { data: projects } = await supabase
    .from("projects")
    .select("id, site_id")
    .eq("agency_id", profile.agency_id);

  if (!projects || projects.length === 0) {
    return NextResponse.json([]);
  }

  const siteIds = [...new Set(projects.map((p: { site_id: string }) => p.site_id))];

  const { data: sites } = await supabase
    .from("sites")
    .select("id, wp_api_url, wp_application_password")
    .in("id", siteIds);

  const wpSiteMap = new Map(
    (sites || [])
      .filter((s: { wp_api_url: string | null }) => s.wp_api_url)
      .map((s: { id: string; wp_api_url: string; wp_application_password: string | null }) => [
        s.id,
        { url: s.wp_api_url.replace(/\/+$/, ""), key: s.wp_application_password || "" },
      ])
  );

  const wpProjectIds = new Set<string>();
  const supabaseProjectIds: string[] = [];

  for (const p of projects) {
    if (wpSiteMap.has(p.site_id)) {
      wpProjectIds.add(p.id);
    } else {
      supabaseProjectIds.push(p.id);
    }
  }

  const wpAnnotations: any[] = [];
  const projectSiteMap = new Map(projects.map((p: { id: string; site_id: string }) => [p.id, p.site_id]));

  for (const projectId of wpProjectIds) {
    const siteId = projectSiteMap.get(projectId)!;
    const wp = wpSiteMap.get(siteId)!;
    try {
      const res = await fetch(
        `${wp.url}/wp-json/feedspace/v1/annotations?projectId=${encodeURIComponent(projectId)}`,
        { headers: { "X-Feedspace-Key": wp.key } }
      );
      if (res.ok) {
        const annotations = await res.json();
        for (const a of annotations) {
          wpAnnotations.push({
            id: a.id,
            project_id: projectId,
            type: a.type,
            content: a.content,
            status: a.status,
            page_url: a.pageUrl,
            coordinates_x: a.anchorXPct,
            coordinates_y: a.anchorYPct,
            width: a.widthPct,
            height: a.heightPct,
            coordinates_x_end: a.endAnchorXPct,
            coordinates_y_end: a.endAnchorYPct,
            draw_data: a.drawData,
            element_dna: a.elementDna,
            viewport_width: a.viewportWidth,
            viewport_height: a.viewportHeight,
            device: a.device,
            created_by: a.createdBy,
            created_at: a.createdAt,
            creator: null,
          });
        }
      }
    } catch {
      // skip unreachable WP
    }
  }

  let supabaseData: any[] = [];

  if (supabaseProjectIds.length > 0) {
    const { data } = await supabase
      .from("feedback_items")
      .select("*, creator:profiles!created_by(full_name, avatar_url)")
      .in("project_id", supabaseProjectIds)
      .order("created_at", { ascending: false });

    supabaseData = data || [];
  }

  const merged = [...wpAnnotations, ...supabaseData];
  merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return NextResponse.json(merged);
}
