"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import {
  Palette,
  Globe,
  User,
  Save,
} from "lucide-react";

const DEMO_SETTINGS = {
  fullName: "Sarah Mitchell",
  primaryColor: "#2563eb",
  secondaryColor: "#64748b",
  customDomain: "feedback.skylineagency.com",
  logoUrl: "",
};

export default function SettingsPage() {
  const { profile, refreshProfile, isDemo } = useAuth();
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    primaryColor: "#2563eb",
    secondaryColor: "#64748b",
    customDomain: "",
    logoUrl: "",
  });

  useEffect(() => {
    if (isDemo) {
      setFormData(DEMO_SETTINGS);
      return;
    }
    if (!profile?.agency_id) return;
    fetchAgency();
    setFormData((prev) => ({ ...prev, fullName: profile.full_name }));
  }, [profile, isDemo]);

  const fetchAgency = async () => {
    if (!profile?.agency_id) return;
    try {
      const { data } = await supabase
        .from("agencies")
        .select("*")
        .eq("id", profile.agency_id)
        .single();
      if (data) {
        setFormData({
          fullName: profile?.full_name || "",
          primaryColor: data.primary_color,
          secondaryColor: data.secondary_color,
          customDomain: data.custom_domain || "",
          logoUrl: data.logo_url || "",
        });
      }
    } catch {
      setFormData(DEMO_SETTINGS);
    }
  };

  const handleSave = async () => {
    if (isDemo || !profile?.agency_id) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      return;
    }
    setSaving(true);
    setSaved(false);

    try {
      await supabase
        .from("agencies")
        .update({
          primary_color: formData.primaryColor,
          secondary_color: formData.secondaryColor,
          custom_domain: formData.customDomain || null,
          logo_url: formData.logoUrl || null,
        })
        .eq("id", profile.agency_id);

      await supabase
        .from("profiles")
        .update({ full_name: formData.fullName })
        .eq("user_id", profile.user_id);

      await refreshProfile();
    } catch {
      // silently fail in demo
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-muted-foreground" />
            <div>
              <h3 className="font-semibold text-foreground">Profile</h3>
              <p className="text-sm text-muted-foreground">
                Your personal information
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <Avatar name={formData.fullName || "User"} size="lg" />
            <div>
              <p className="font-medium text-foreground">
                {formData.fullName}
              </p>
              <p className="text-sm text-muted-foreground">
                {profile?.email || "sarah@skylineagency.com"}
              </p>
            </div>
          </div>
          <Input
            label="Full Name"
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Palette className="w-5 h-5 text-muted-foreground" />
            <div>
              <h3 className="font-semibold text-foreground">Branding</h3>
              <p className="text-sm text-muted-foreground">
                Customize your feedback widget colors
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">
                Primary Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      primaryColor: e.target.value,
                    })
                  }
                  className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      primaryColor: e.target.value,
                    })
                  }
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">
                Secondary Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.secondaryColor}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      secondaryColor: e.target.value,
                    })
                  }
                  className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={formData.secondaryColor}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      secondaryColor: e.target.value,
                    })
                  }
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
          </div>
          <Input
            label="Logo URL"
            placeholder="https://your-agency.com/logo.png"
            value={formData.logoUrl}
            onChange={(e) =>
              setFormData({ ...formData, logoUrl: e.target.value })
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-muted-foreground" />
            <div>
              <h3 className="font-semibold text-foreground">
                White-Label Domain
              </h3>
              <p className="text-sm text-muted-foreground">
                Use your own domain for client previews
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Custom Domain"
            placeholder="feedback.your-agency.com"
            value={formData.customDomain}
            onChange={(e) =>
              setFormData({ ...formData, customDomain: e.target.value })
            }
          />
          {formData.customDomain && (
            <div className="p-3 rounded-lg bg-accent">
              <p className="text-xs text-muted-foreground">
                Point a CNAME record from{" "}
                <span className="font-mono text-foreground">
                  {formData.customDomain}
                </span>{" "}
                to{" "}
                <span className="font-mono text-foreground">
                  feedspace.vercel.app
                </span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saved ? "Saved" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
