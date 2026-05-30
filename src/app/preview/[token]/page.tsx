"use client";

import { useEffect, useState, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { FeedbackWidget } from "@/components/feedback/feedback-widget";
import { Loader2 } from "lucide-react";
import { DEMO_SITES } from "@/lib/demo-data";

interface PreviewData {
  projectId: string;
  targetUrl: string;
  isValid: boolean;
  primaryColor: string;
  wpUrl?: string;
  wpApiKey?: string;
}

const DEMO_PREVIEW_LINKS: Record<string, { project_id: string; target_url: string; site_id: string }> = {
  "demo-preview-token-1": { project_id: "demo-proj-1", target_url: "https://brightonlaw.preview.feedspace.io", site_id: "demo-site-1" },
  "demo-preview-token-3": { project_id: "demo-proj-3", target_url: "https://greenleaf.preview.feedspace.io", site_id: "demo-site-2" },
  "demo-preview-token-5": { project_id: "demo-proj-5", target_url: "https://pinnacle.preview.feedspace.io", site_id: "demo-site-3" },
};

export default function PreviewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const supabase = createClient();
  const [data, setData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWidget, setShowWidget] = useState(false);

  useEffect(() => {
    const fetchPreview = async () => {
      if (token.startsWith("demo-")) {
        const demoLink = DEMO_PREVIEW_LINKS[token];
        if (!demoLink) {
          setError("Preview link not found or has expired");
          setLoading(false);
          return;
        }
        const site = DEMO_SITES.find((s) => s.id === demoLink.site_id);
        setData({
          projectId: demoLink.project_id,
          targetUrl: demoLink.target_url,
          isValid: true,
          primaryColor: "#2563eb",
          wpUrl: site?.wp_api_url || undefined,
          wpApiKey: site?.wp_application_password || undefined,
        });
        setShowWidget(true);
        setLoading(false);
        return;
      }

      const { data: link, error: linkError } = await supabase
        .from("preview_links")
        .select("*, projects!inner(*)")
        .eq("token", token)
        .eq("is_active", true)
        .single();

      if (linkError || !link) {
        setError("Preview link not found or has expired");
        setLoading(false);
        return;
      }

      if (link.expires_at && new Date(link.expires_at) < new Date()) {
        setError("This preview link has expired");
        setLoading(false);
        return;
      }

      const { data: agency } = await supabase
        .from("agencies")
        .select("primary_color")
        .eq("id", link.projects.agency_id)
        .single();

      const { data: project } = await supabase
        .from("projects")
        .select("site_id")
        .eq("id", link.project_id)
        .single();

      let wpUrl: string | undefined;
      let wpApiKey: string | undefined;
      if (project) {
        const { data: site } = await supabase
          .from("sites")
          .select("wp_api_url, wp_application_password")
          .eq("id", project.site_id)
          .single();
        if (site?.wp_api_url) {
          wpUrl = site.wp_api_url;
          wpApiKey = site.wp_application_password || undefined;
        }
      }

      setData({
        projectId: link.project_id,
        targetUrl: link.target_url,
        isValid: true,
        primaryColor: agency?.primary_color || "#2563eb",
        wpUrl,
        wpApiKey,
      });

      setShowWidget(true);
      setLoading(false);
    };

    fetchPreview();
  }, [token, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Loading preview session...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 rounded-2xl bg-danger/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-danger">!</span>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            {error}
          </h2>
          <p className="text-sm text-muted-foreground">
            Please contact the agency to request a new preview link.
          </p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="relative min-h-screen bg-white">
      <iframe
        src={data.targetUrl}
        className="w-full h-screen border-0"
        title="Preview"
        sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
      />

      {showWidget && (
        <FeedbackWidget
          projectId={data.projectId}
          previewToken={token}
          primaryColor={data.primaryColor}
          wpUrl={data.wpUrl}
          wpApiKey={data.wpApiKey}
        />
      )}

      <div className="fixed top-0 left-0 right-0 z-[9995] bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            You are in preview mode. Your feedback helps improve this site.
          </p>
          <p className="text-xs text-muted-foreground">
            <span
              className="inline-block w-2 h-2 rounded-full bg-success mr-1.5"
            />
            Secure connection
          </p>
        </div>
      </div>
    </div>
  );
}
