export interface ActivityEntry {
  id: string;
  type: "assigned" | "status_change" | "replied" | "feedback_submitted" | "site_assigned";
  actor: string;
  description: string;
  site_name?: string;
  feedback_id?: string;
  created_at: string;
}

export const DEMO_ACTIVITIES: ActivityEntry[] = [
  {
    id: "act-1", type: "assigned", actor: "Sarah Mitchell",
    description: "Assigned CTA button contrast issue to James Chen",
    site_name: "Brighton Law Firm", feedback_id: "demo-fb-13",
    created_at: "2026-05-30T09:15:00Z",
  },
  {
    id: "act-2", type: "replied", actor: "James Chen",
    description: "Replied on CTA button feedback: 'I will update colors to white on dark blue'",
    site_name: "Brighton Law Firm", feedback_id: "demo-fb-13",
    created_at: "2026-05-30T08:30:00Z",
  },
  {
    id: "act-3", type: "status_change", actor: "James Chen",
    description: "Marked contact form reference images as resolved",
    site_name: "Brighton Law Firm", feedback_id: "demo-fb-4",
    created_at: "2026-05-29T16:00:00Z",
  },
  {
    id: "act-4", type: "feedback_submitted", actor: "Michael Chen",
    description: "Submitted feedback: CTA buttons lack contrast on hero section",
    site_name: "Brighton Law Firm", feedback_id: "demo-fb-13",
    created_at: "2026-05-29T14:00:00Z",
  },
  {
    id: "act-5", type: "assigned", actor: "Sarah Mitchell",
    description: "Assigned Greenleaf Organics site to Maria Rodriguez",
    site_name: "Greenleaf Organics",
    created_at: "2026-05-29T10:00:00Z",
  },
  {
    id: "act-6", type: "status_change", actor: "James Chen",
    description: "Started working on mobile navigation issue",
    site_name: "Brighton Law Firm", feedback_id: "demo-fb-6",
    created_at: "2026-05-28T14:30:00Z",
  },
  {
    id: "act-7", type: "feedback_submitted", actor: "Jennifer Williams",
    description: "Submitted feedback about product page filtering sidebar",
    site_name: "Greenleaf Organics", feedback_id: "demo-fb-8",
    created_at: "2026-05-28T11:00:00Z",
  },
  {
    id: "act-8", type: "replied", actor: "Michael Chen",
    description: "Replied on CTA feedback: 'Yes, please also add 8px border-radius'",
    site_name: "Brighton Law Firm", feedback_id: "demo-fb-13",
    created_at: "2026-05-28T09:00:00Z",
  },
  {
    id: "act-9", type: "status_change", actor: "Priya Patel",
    description: "Marked competitor analysis screenshots as resolved",
    site_name: "Greenleaf Organics", feedback_id: "demo-fb-14",
    created_at: "2026-05-27T15:00:00Z",
  },
  {
    id: "act-10", type: "assigned", actor: "Sarah Mitchell",
    description: "Assigned property search feedback to Alex Thompson",
    site_name: "Pinnacle Real Estate", feedback_id: "demo-fb-10",
    created_at: "2026-05-27T11:00:00Z",
  },
];
