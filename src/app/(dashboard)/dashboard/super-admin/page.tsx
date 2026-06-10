"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  ShieldCheck,
  Database,
  Globe,
  Webhook,
  RefreshCw,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { PLAN_LABELS, PLAN_BADGE_COLORS } from "@/lib/freemius";
import type { PlanStatus } from "@/types";

const supabase = createClient();

interface AgencyRow {
  id: string;
  name: string;
  plan_status: PlanStatus;
  freemius_user_id: string | null;
  freemius_subscription_id: string | null;
  created_at: string;
}

export default function SuperAdminPage() {
  const { isSuperAdmin, isDemo } = useAuth();
  const [agencies, setAgencies] = useState<AgencyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [envStatus, setEnvStatus] = useState<Record<string, boolean>>({});
  const [webhookResult, setWebhookResult] = useState<string>("");
  const [webhookSending, setWebhookSending] = useState(false);

  // Webhook tester state
  const [whEvent, setWhEvent] = useState("subscription.created");
  const [whUserId, setWhUserId] = useState("");
  const [whSubId, setWhSubId] = useState("");
  const [whEmail, setWhEmail] = useState("");

  const fetchData = useCallback(async () => {
    if (isDemo) return;
    setLoading(true);

    const [{ data: agencies }, { data: counts }] = await Promise.all([
      supabase.from("agencies").select("id, name, plan_status, freemius_user_id, freemius_subscription_id, created_at").order("created_at", { ascending: false }),
      supabase.rpc("get_agency_stats", { agency_id_param: "00000000-0000-0000-0000-000000000000" }).maybeSingle(),
    ]);

    if (agencies) setAgencies(agencies as AgencyRow[]);
    if (counts) setStats(counts as any);

    // Quick DB stats
    const [sites, projects, feedback, profiles] = await Promise.all([
      supabase.from("sites").select("id", { count: "exact", head: true }),
      supabase.from("projects").select("id", { count: "exact", head: true }),
      supabase.from("feedback_items").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
    ]);
    setStats({
      agencies: agencies?.length || 0,
      sites: sites.count || 0,
      projects: projects.count || 0,
      feedback: feedback.count || 0,
      profiles: profiles.count || 0,
    });

    // Fetch env status from server
    try {
      const envRes = await fetch("/api/super-admin/env-check");
      const envData = await envRes.json();
      setEnvStatus(envData);
    } catch {
      // fallback
    }

    setLoading(false);
  }, [isDemo]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updatePlanStatus = async (agencyId: string, planStatus: PlanStatus) => {
    const { error } = await supabase
      .from("agencies")
      .update({ plan_status: planStatus })
      .eq("id", agencyId);

    if (!error) {
      setAgencies(prev => prev.map(a => a.id === agencyId ? { ...a, plan_status: planStatus } : a));
    }
  };

  const sendTestWebhook = async () => {
    setWebhookSending(true);
    setWebhookResult("");
    try {
      const payload = {
        type: whEvent,
        data: {
          id: whSubId || undefined,
          user_id: whUserId || undefined,
          subscription_id: whSubId || undefined,
          user: whEmail ? { email: whEmail } : undefined,
          customer_email: whEmail || undefined,
          metadata: {},
        },
      };
      const res = await fetch("/api/webhooks/freemius", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-signature": "test-mode" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setWebhookResult(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setWebhookResult("Error: " + err.message);
    } finally {
      setWebhookSending(false);
    }
  };

  if (!isSuperAdmin && !isDemo) {
    return <div className="text-center py-12 text-muted-foreground">Access denied.</div>;
  }

  const planOptions = [
    { value: "beta", label: "Beta" },
    { value: "trialing", label: "Trial" },
    { value: "active", label: "Active" },
    { value: "past_due", label: "Past Due" },
    { value: "canceled", label: "Canceled" },
    { value: "expired", label: "Expired" },
    { value: "lifetime", label: "Lifetime" },
  ];

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center gap-3">
        <ShieldCheck className="w-6 h-6 text-amber-500" />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">Super Admin</h1>
            <Badge variant="warning">Super Admin</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage agencies, test webhooks, and debug the platform
          </p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {Object.entries(stats).map(([key, val]) => (
          <Card key={key}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{val}</p>
              <p className="text-xs text-muted-foreground capitalize">{key}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-semibold text-foreground">Agencies</h3>
            </div>
            <Button variant="outline" size="sm" onClick={fetchData} loading={loading}>
              <RefreshCw className="w-3 h-3 mr-1" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-2 text-muted-foreground font-medium">Name</th>
                  <th className="text-left py-2 px-2 text-muted-foreground font-medium">Plan</th>
                  <th className="text-left py-2 px-2 text-muted-foreground font-medium">Freemius User</th>
                  <th className="text-left py-2 px-2 text-muted-foreground font-medium">Subscription</th>
                  <th className="text-left py-2 px-2 text-muted-foreground font-medium">Created</th>
                  <th className="text-right py-2 px-2 text-muted-foreground font-medium">Override</th>
                </tr>
              </thead>
              <tbody>
                {agencies.map((agency) => (
                  <tr key={agency.id} className="border-b border-border/50 hover:bg-accent/30">
                    <td className="py-2 px-2 font-medium text-foreground">{agency.name}</td>
                    <td className="py-2 px-2">
                      <Badge variant={
                        agency.plan_status === "active" || agency.plan_status === "lifetime" ? "success" :
                        agency.plan_status === "past_due" || agency.plan_status === "expired" ? "danger" :
                        agency.plan_status === "beta" ? "info" : "warning"
                      }>
                        {PLAN_LABELS[agency.plan_status] || agency.plan_status}
                      </Badge>
                    </td>
                    <td className="py-2 px-2 text-xs font-mono text-muted-foreground">
                      {agency.freemius_user_id || "—"}
                    </td>
                    <td className="py-2 px-2 text-xs font-mono text-muted-foreground">
                      {agency.freemius_subscription_id || "—"}
                    </td>
                    <td className="py-2 px-2 text-xs text-muted-foreground">
                      {new Date(agency.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-2 text-right">
                      <Select
                        value={agency.plan_status}
                        options={planOptions}
                        onChange={(e) => updatePlanStatus(agency.id, e.target.value as PlanStatus)}
                        className="w-32 text-xs"
                      />
                    </td>
                  </tr>
                ))}
                {agencies.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No agencies found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Webhook className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-semibold text-foreground">Webhook Tester</h3>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Simulate a Freemius webhook event. The "x-signature" check is bypassed when sent from the browser (testing convenience).
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Event Type" value={whEvent} options={[
              { value: "subscription.created", label: "subscription.created" },
              { value: "subscription.cancelled", label: "subscription.cancelled" },
              { value: "subscription.renewal.failed.last", label: "subscription.renewal.failed.last" },
              { value: "payment.created", label: "payment.created" },
              { value: "user.trial.started", label: "user.trial.started" },
              { value: "plan.lifetime.purchase", label: "plan.lifetime.purchase" },
            ]} onChange={(e) => setWhEvent(e.target.value)} />
            <Input label="Freemius User ID (optional)" placeholder="user_123" value={whUserId} onChange={(e) => setWhUserId(e.target.value)} />
            <Input label="Freemius Subscription ID (optional)" placeholder="sub_456" value={whSubId} onChange={(e) => setWhSubId(e.target.value)} />
            <Input label="User Email (for matching)" placeholder="agency@email.com" value={whEmail} onChange={(e) => setWhEmail(e.target.value)} />
          </div>
          <Button onClick={sendTestWebhook} loading={webhookSending}>
            <Webhook className="w-4 h-4 mr-2" />
            Send Test Webhook
          </Button>
          {webhookResult && (
            <pre className="p-3 rounded-lg bg-muted text-xs font-mono overflow-x-auto whitespace-pre-wrap">
              {webhookResult}
            </pre>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-semibold text-foreground">Environment</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(envStatus).filter(([k]) => k !== "SUPABASE_ERROR").map(([key, set]) => (
              <div key={key} className="flex items-center gap-2">
                {set ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span className="text-sm font-mono text-foreground">{key}</span>
                <span className="text-xs text-muted-foreground">{set ? "set" : "missing"}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
