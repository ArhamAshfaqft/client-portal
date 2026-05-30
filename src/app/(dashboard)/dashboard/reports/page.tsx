"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Plus,
  Send,
  CalendarDays,
  Timer,
  Search,
} from "lucide-react";

const DEMO_REPORTS = [
  {
    id: "1",
    date: "2026-05-29",
    project: "Brighton Law Firm",
    summary: "Fixed hero section responsiveness issues. Updated navigation menu styling for mobile viewports. Tested cross-browser compatibility.",
    hours: 6,
  },
  {
    id: "2",
    date: "2026-05-29",
    project: "Apex Fitness",
    summary: "Implemented testimonial carousel animations. Added lazy loading for images on the products page.",
    hours: 3,
  },
  {
    id: "3",
    date: "2026-05-28",
    project: "Brighton Law Firm",
    summary: "Debugged contact form submission issue. Found CORS conflict with SMTP plugin. Applied fix and tested successfully.",
    hours: 5,
  },
  {
    id: "4",
    date: "2026-05-28",
    project: "Greenleaf Organics",
    summary: "Installed Feedspace connector plugin. Configured WordPress REST API credentials. Tested media upload flow.",
    hours: 2,
  },
];

export default function ReportsPage() {
  const { profile, isDemo } = useAuth();
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    project: "",
    summary: "",
    hours: "",
  });
  const [reports, setReports] = useState<typeof DEMO_REPORTS>(isDemo ? DEMO_REPORTS : []);
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState<string>("all");

  const projectOptions = useMemo(() => {
    const projects = new Set(reports.map((r) => r.project));
    return ["all", ...Array.from(projects)];
  }, [reports]);

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (projectFilter !== "all" && r.project !== projectFilter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        r.project.toLowerCase().includes(q) ||
        r.summary.toLowerCase().includes(q)
      );
    });
  }, [reports, search, projectFilter]);

  const handleSubmit = () => {
    const newReport = {
      id: String(Date.now()),
      date: new Date().toISOString().split("T")[0],
      project: formData.project,
      summary: formData.summary,
      hours: Number(formData.hours),
    };
    setReports([newReport, ...reports]);
    setFormData({ project: "", summary: "", hours: "" });
    setShowAdd(false);
  };

  const totalHoursThisWeek = reports
    .filter((r) => {
      const d = new Date(r.date);
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      return d >= startOfWeek;
    })
    .reduce((sum, r) => sum + r.hours, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Daily Reports
          </h2>
          <p className="text-sm text-muted-foreground">
            Log your hours and work summary
          </p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)}>
          <Plus className="w-4 h-4 mr-2" />
          Log Hours
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center">
                <Timer className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  This Week
                </p>
                <p className="text-xl font-bold text-foreground">
                  {totalHoursThisWeek}h
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Today
                </p>
                <p className="text-xl font-bold text-foreground">
                  {reports
                    .filter(
                      (r) =>
                        r.date ===
                        new Date().toISOString().split("T")[0]
                    )
                    .reduce((s, r) => s + r.hours, 0)}
                  h
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Reports Logged
                </p>
                <p className="text-xl font-bold text-foreground">
                  {reports.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {showAdd && (
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-foreground">
              Log Today&apos;s Work
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                label="Project"
                placeholder="Brighton Law Firm"
                value={formData.project}
                onChange={(e) =>
                  setFormData({ ...formData, project: e.target.value })
                }
              />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">
                  Work Summary
                </label>
                <textarea
                  placeholder="Describe what you worked on..."
                  value={formData.summary}
                  onChange={(e) =>
                    setFormData({ ...formData, summary: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>
              <Input
                label="Hours Worked"
                type="number"
                placeholder="6"
                min="0"
                max="24"
                step="0.5"
                value={formData.hours}
                onChange={(e) =>
                  setFormData({ ...formData, hours: e.target.value })
                }
              />
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowAdd(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search + filter */}
      <div className="flex items-center gap-3">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search reports..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          {projectOptions.map((p) => (
            <option key={p} value={p}>
              {p === "all" ? "All Projects" : p}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {filteredReports.length === 0 ? (
          <Card>
            <CardContent>
              <div className="text-center py-8 text-sm text-muted-foreground">
                {search ? "No matching reports" : "No reports yet"}
              </div>
            </CardContent>
          </Card>
        ) : filteredReports.map((report) => (
          <Card key={report.id}>
            <CardContent>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-foreground text-sm">
                      {report.project}
                    </span>
                    <Badge variant="default">
                      {report.hours}h
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {report.summary}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(report.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
