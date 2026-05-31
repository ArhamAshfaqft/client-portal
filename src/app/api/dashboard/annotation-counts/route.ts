import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

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
    return NextResponse.json({ open_feedback: 0, resolved_feedback: 0 });
  }

  const siteIds = [...new Set(projects.map((p: { site_id: string }) => p.site_id))];

  const { data: sites } = await supabase
    .from("sites")
    .select("id, wp_api_url, wp_application_password")
    .in("id", siteIds);

  if (!sites) {
    return NextResponse.json({ open_feedback: 0, resolved_feedback: 0 });
  }

  const wpSites = new Map(
    sites
      .filter((s: { wp_api_url: string | null }) => s.wp_api_url)
      .map((s: { id: string; wp_api_url: string; wp_application_password: string | null }) => [
        s.id,
        { url: s.wp_api_url.replace(/\/+$/, ""), key: s.wp_application_password || "" },
      ])
  );

  let totalOpen = 0;
  let totalResolved = 0;

  for (const project of projects as Array<{ id: string; site_id: string }>) {
    const wp = wpSites.get(project.site_id);
    if (!wp) continue;

    try {
      const res = await fetch(
        `${wp.url}/wp-json/feedspace/v1/annotations/counts?projectId=${encodeURIComponent(project.id)}`,
        { headers: { "X-Feedspace-Key": wp.key } }
      );
      if (res.ok) {
        const counts = await res.json();
        totalOpen += counts.open || 0;
        totalResolved += counts.resolved || 0;
      }
    } catch {
      // skip if WP unreachable
    }
  }

  return NextResponse.json({
    open_feedback: totalOpen,
    resolved_feedback: totalResolved,
  });
}
