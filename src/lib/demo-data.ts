import type { Site, Project, FeedbackItem, FeedbackMedia } from "@/types";

export const DEMO_SITES: (Site & { feedback_counts: { new_count: number; in_progress_count: number; resolved_count: number } })[] = [
  {
    id: "demo-site-1",
    agency_id: "demo-agency",
    name: "Brighton Law Firm",
    url: "https://brightonlaw.com",
    wp_api_url: "https://brightonlaw.com/wp-json",
    wp_application_password: "****",
    wp_connected: true,
    created_at: "2026-05-15T10:00:00Z",
    feedback_counts: { new_count: 3, in_progress_count: 2, resolved_count: 18 },
  },
  {
    id: "demo-site-2",
    agency_id: "demo-agency",
    name: "Greenleaf Organics",
    url: "https://greenleaforganics.com",
    wp_api_url: "https://greenleaforganics.com/wp-json",
    wp_application_password: "****",
    wp_connected: true,
    created_at: "2026-05-12T08:30:00Z",
    feedback_counts: { new_count: 1, in_progress_count: 1, resolved_count: 9 },
  },
  {
    id: "demo-site-3",
    agency_id: "demo-agency",
    name: "Pinnacle Real Estate",
    url: "https://pinnaclerealty.com",
    wp_api_url: null,
    wp_application_password: null,
    wp_connected: false,
    created_at: "2026-05-10T14:00:00Z",
    feedback_counts: { new_count: 5, in_progress_count: 0, resolved_count: 3 },
  },
  {
    id: "demo-site-4",
    agency_id: "demo-agency",
    name: "Meridian Health",
    url: "https://meridianhealth.org",
    wp_api_url: "https://meridianhealth.org/wp-json",
    wp_application_password: "****",
    wp_connected: true,
    created_at: "2026-05-08T09:15:00Z",
    feedback_counts: { new_count: 0, in_progress_count: 0, resolved_count: 12 },
  },
  {
    id: "demo-site-5",
    agency_id: "demo-agency",
    name: "Apex Fitness",
    url: "https://apexfitness.com",
    wp_api_url: "https://apexfitness.com/wp-json",
    wp_application_password: "****",
    wp_connected: true,
    created_at: "2026-05-05T11:45:00Z",
    feedback_counts: { new_count: 2, in_progress_count: 1, resolved_count: 5 },
  },
  {
    id: "demo-site-6",
    agency_id: "demo-agency",
    name: "Harborview Restaurant",
    url: "https://harborview.com",
    wp_api_url: null,
    wp_application_password: null,
    wp_connected: false,
    created_at: "2026-05-03T16:00:00Z",
    feedback_counts: { new_count: 0, in_progress_count: 0, resolved_count: 0 },
  },
];

export const DEMO_PROJECTS: Project[] = [
  { id: "demo-proj-1", agency_id: "demo-agency", site_id: "demo-site-1", name: "Homepage Redesign", description: "Complete redesign of the law firm homepage", status: "active", created_at: "2026-05-16T10:00:00Z" },
  { id: "demo-proj-2", agency_id: "demo-agency", site_id: "demo-site-1", name: "Contact Form Update", description: "Replace old contact form with new multi-step form", status: "active", created_at: "2026-05-18T14:00:00Z" },
  { id: "demo-proj-3", agency_id: "demo-agency", site_id: "demo-site-2", name: "Product Page Overhaul", description: "New product catalog layout with filtering", status: "active", created_at: "2026-05-13T09:00:00Z" },
  { id: "demo-proj-4", agency_id: "demo-agency", site_id: "demo-site-3", name: "Property Search Feature", description: "Advanced property search with map integration", status: "active", created_at: "2026-05-11T11:00:00Z" },
  { id: "demo-proj-5", agency_id: "demo-agency", site_id: "demo-site-5", name: "Membership Launch", description: "New membership plans and registration flow", status: "active", created_at: "2026-05-06T10:00:00Z" },
  { id: "demo-proj-6", agency_id: "demo-agency", site_id: "demo-site-1", name: "Blog Migration", description: "Migrate blog from Medium to WordPress", status: "completed", created_at: "2026-05-01T08:00:00Z" },
];

const projectSiteMap: Record<string, string> = {};
DEMO_PROJECTS.forEach((p) => { projectSiteMap[p.id] = p.site_id; });

function getSiteId(projectId: string): string {
  return projectSiteMap[projectId] || "demo-site-1";
}

function siteName(siteId: string): string {
  return DEMO_SITES.find((s) => s.id === siteId)?.name || "Unknown";
}

export interface EnrichedFeedback extends FeedbackItem {
  project_name?: string;
  site_name?: string;
  site_id?: string;
  creator_name?: string;
  viewport_label?: string;
  media?: FeedbackMedia[];
  replies?: EnrichedFeedback[];
}

export const DEMO_FEEDBACK: EnrichedFeedback[] = [
  {
    id: "demo-fb-1", project_id: "demo-proj-1", parent_id: null, type: "pin",
    content: "The hero section image needs to be updated to the new brand photo. The current one has the old logo and the color tones don't match our new brand guidelines.",
    page_url: "/", selector: null,
    coordinates_x: 50, coordinates_y: 25, viewport_width: 1920, viewport_height: 1080,
    status: "open", assigned_to: "demo-dev-1", created_by: "demo-client-1", created_at: "2026-05-29T14:30:00Z",
  },
  {
    id: "demo-fb-2", project_id: "demo-proj-1", parent_id: null, type: "comment",
    content: "The contact form on the pricing page is not submitting properly. Tested on Chrome and Safari. Getting a 500 error after clicking submit.",
    page_url: "/pricing", selector: null,
    coordinates_x: null, coordinates_y: null, viewport_width: null, viewport_height: null,
    status: "in_progress", assigned_to: "demo-dev-1", created_by: "demo-client-1", created_at: "2026-05-28T11:15:00Z",
  },
  {
    id: "demo-fb-3", project_id: "demo-proj-1", parent_id: null, type: "voice",
    content: "Voice note explaining the animation requirements for the testimonial carousel. Client requested fade-in transitions with 3-second intervals.",
    page_url: "/testimonials", selector: null,
    coordinates_x: null, coordinates_y: null, viewport_width: null, viewport_height: null,
    status: "open", assigned_to: "demo-dev-2", created_by: "demo-client-1", created_at: "2026-05-28T09:45:00Z",
  },
  {
    id: "demo-fb-4", project_id: "demo-proj-2", parent_id: null, type: "media",
    content: "Attached reference images for the new multi-step contact form design showing the desired layout and field order.",
    page_url: "/contact", selector: null,
    coordinates_x: null, coordinates_y: null, viewport_width: null, viewport_height: null,
    status: "resolved", assigned_to: "demo-dev-1", created_by: "demo-client-1", created_at: "2026-05-26T16:00:00Z",
    media: [
      { id: "demo-media-1", feedback_item_id: "demo-fb-4", file_url: "https://brightonlaw.com/wp-content/uploads/feedspace/contact-form-reference-1.jpg", file_type: "image/jpeg", file_name: "contact-form-reference-1.jpg", file_size: 245000, storage_type: "wordpress", created_at: "2026-05-26T16:00:00Z" },
      { id: "demo-media-2", feedback_item_id: "demo-fb-4", file_url: "https://brightonlaw.com/wp-content/uploads/feedspace/contact-form-reference-2.jpg", file_type: "image/jpeg", file_name: "contact-form-reference-2.jpg", file_size: 312000, storage_type: "wordpress", created_at: "2026-05-26T16:00:00Z" },
    ],
  },
  {
    id: "demo-fb-5", project_id: "demo-proj-2", parent_id: null, type: "pin",
    content: "The footer links are pointing to the wrong pages. Privacy policy goes to /privacy instead of /privacy-policy. Terms link is 404.",
    page_url: "/", selector: null,
    coordinates_x: 50, coordinates_y: 92, viewport_width: 1440, viewport_height: 900,
    status: "resolved", assigned_to: "demo-dev-3", created_by: "demo-client-1", created_at: "2026-05-25T13:20:00Z",
  },
  {
    id: "demo-fb-6", project_id: "demo-proj-1", parent_id: null, type: "comment",
    content: "Mobile responsiveness needs work. The navigation menu overlaps with the logo on iPhone 14. Also the hamburger menu doesn't close on tap outside.",
    page_url: "/", selector: null,
    coordinates_x: null, coordinates_y: null, viewport_width: null, viewport_height: null,
    status: "in_progress", assigned_to: "demo-dev-1", created_by: "demo-client-1", created_at: "2026-05-24T10:00:00Z",
  },
  {
    id: "demo-fb-7", project_id: "demo-proj-3", parent_id: null, type: "media",
    content: "Uploaded brand style guide PDF for the new product page design. Includes color palette, typography, and spacing guidelines.",
    page_url: "/products", selector: null,
    coordinates_x: null, coordinates_y: null, viewport_width: null, viewport_height: null,
    status: "open", assigned_to: null, created_by: "demo-client-2", created_at: "2026-05-23T15:30:00Z",
    media: [
      { id: "demo-media-3", feedback_item_id: "demo-fb-7", file_url: "https://greenleaforganics.com/wp-content/uploads/feedspace/brand-style-guide.png", file_type: "image/png", file_name: "brand-style-guide.png", file_size: 890000, storage_type: "wordpress", created_at: "2026-05-23T15:30:00Z" },
    ],
  },
  {
    id: "demo-fb-8", project_id: "demo-proj-3", parent_id: null, type: "pin",
    content: "Product filtering sidebar is cut off on tablet viewports. The price range slider and category checkboxes are partially hidden.",
    page_url: "/products", selector: null,
    coordinates_x: 15, coordinates_y: 40, viewport_width: 768, viewport_height: 1024,
    status: "open", assigned_to: "demo-dev-4", created_by: "demo-client-2", created_at: "2026-05-22T11:00:00Z",
  },
  {
    id: "demo-fb-9", project_id: "demo-proj-4", parent_id: null, type: "comment",
    content: "Property search results page loads too slowly. Average load time is 4.2 seconds. Need to optimize the database queries and implement caching.",
    page_url: "/properties", selector: null,
    coordinates_x: null, coordinates_y: null, viewport_width: null, viewport_height: null,
    status: "open", assigned_to: "demo-dev-2", created_by: "demo-client-3", created_at: "2026-05-21T09:00:00Z",
  },
  {
    id: "demo-fb-10", project_id: "demo-proj-4", parent_id: null, type: "pin",
    content: "Map markers are not displaying correctly on the property map view. All markers show at the same location instead of their actual addresses.",
    page_url: "/properties/map", selector: null,
    coordinates_x: 65, coordinates_y: 55, viewport_width: 1920, viewport_height: 1080,
    status: "in_progress", assigned_to: "demo-dev-3", created_by: "demo-client-3", created_at: "2026-05-20T14:30:00Z",
  },
  {
    id: "demo-fb-11", project_id: "demo-proj-5", parent_id: null, type: "voice",
    content: "Voice note about the membership pricing table layout. Want to see a comparison table with 3 tiers side by side on desktop and stacked on mobile.",
    page_url: "/membership", selector: null,
    coordinates_x: null, coordinates_y: null, viewport_width: null, viewport_height: null,
    status: "open", assigned_to: null, created_by: "demo-client-4", created_at: "2026-05-19T16:45:00Z",
  },
  {
    id: "demo-fb-12", project_id: "demo-proj-5", parent_id: null, type: "comment",
    content: "The registration confirmation email is not sending. Checked Mailgun logs and there is a domain verification issue.",
    page_url: "/register", selector: null,
    coordinates_x: null, coordinates_y: null, viewport_width: null, viewport_height: null,
    status: "resolved", assigned_to: "demo-dev-1", created_by: "demo-client-4", created_at: "2026-05-18T10:15:00Z",
  },
  {
    id: "demo-fb-13", project_id: "demo-proj-1", parent_id: null, type: "pin",
    content: "CTA buttons on the hero section need more contrast. The current blue on light grey is hard to read. Suggested: white text on dark blue background.",
    page_url: "/", selector: null,
    coordinates_x: 50, coordinates_y: 35, viewport_width: 1920, viewport_height: 1080,
    status: "open", assigned_to: null, created_by: "demo-client-1", created_at: "2026-05-17T08:00:00Z",
    media: [
      { id: "demo-media-4", feedback_item_id: "demo-fb-13", file_url: "https://brightonlaw.com/wp-content/uploads/feedspace/current-cta-screenshot.jpg", file_type: "image/jpeg", file_name: "current-cta-screenshot.jpg", file_size: 180000, storage_type: "wordpress", created_at: "2026-05-17T08:00:00Z" },
    ],
  },
  {
    id: "demo-fb-14", project_id: "demo-proj-3", parent_id: null, type: "media",
    content: "Uploaded competitor analysis screenshots showing product page layouts that the client likes.",
    page_url: "/products", selector: null,
    coordinates_x: null, coordinates_y: null, viewport_width: null, viewport_height: null,
    status: "resolved", assigned_to: "demo-dev-4", created_by: "demo-client-2", created_at: "2026-05-16T13:00:00Z",
  },
];

export const DEMO_REPLIES: EnrichedFeedback[] = [
  {
    id: "demo-reply-1", project_id: "demo-proj-1", parent_id: "demo-fb-13", type: "comment",
    content: "James here - I checked the hero section. The current CTA uses #1e40af on #f1f5f9. I'll update it to white (#ffffff) on #1e3a5f per the suggestion. Should I also adjust the hover state?",
    page_url: "/", selector: null,
    coordinates_x: null, coordinates_y: null, viewport_width: null, viewport_height: null,
    status: "open", assigned_to: "demo-dev-1", created_by: "demo-dev-1", created_at: "2026-05-17T10:30:00Z",
  },
  {
    id: "demo-reply-2", project_id: "demo-proj-1", parent_id: "demo-fb-13", type: "comment",
    content: "Yes please! For hover, maybe a slightly lighter shade of the dark blue (#2a4a7f). Also make sure the button has 8px border-radius to match the rest of the site.",
    page_url: "/", selector: null,
    coordinates_x: null, coordinates_y: null, viewport_width: null, viewport_height: null,
    status: "open", assigned_to: null, created_by: "demo-client-1", created_at: "2026-05-17T11:00:00Z",
  },
  {
    id: "demo-reply-3", project_id: "demo-proj-1", parent_id: "demo-fb-1", type: "comment",
    content: "Updated the hero image with the new brand photo. Also adjusted the overlay gradient to match. Deployed to staging, please verify.",
    page_url: "/", selector: null,
    coordinates_x: null, coordinates_y: null, viewport_width: null, viewport_height: null,
    status: "in_progress", assigned_to: "demo-dev-1", created_by: "demo-dev-1", created_at: "2026-05-30T09:00:00Z",
  },
  {
    id: "demo-reply-4", project_id: "demo-proj-1", parent_id: "demo-fb-6", type: "comment",
    content: "The mobile nav issue was caused by a z-index conflict with the sticky header. Fixed by increasing the nav z-index to 60. Also added an overlay click handler to close the hamburger. Should be good now.",
    page_url: "/", selector: null,
    coordinates_x: null, coordinates_y: null, viewport_width: null, viewport_height: null,
    status: "in_progress", assigned_to: "demo-dev-1", created_by: "demo-dev-1", created_at: "2026-05-25T14:00:00Z",
  },
];

export function getFeedbackForSite(siteId: string): EnrichedFeedback[] {
  const projectIds = DEMO_PROJECTS.filter((p) => p.site_id === siteId).map((p) => p.id);
  const projectNames: Record<string, string> = {};
  DEMO_PROJECTS.forEach((p) => { projectNames[p.id] = p.name; });

  const enriched = DEMO_FEEDBACK
    .filter((f) => projectIds.includes(f.project_id))
    .map((f) => ({
      ...f,
      project_name: projectNames[f.project_id] || "Unknown",
      site_name: siteName(siteId),
      site_id: siteId,
      creator_name: getCreatorName(f.created_by),
      viewport_label: f.viewport_width && f.viewport_height
        ? `${f.viewport_width}x${f.viewport_height}`
        : undefined,
      replies: [] as EnrichedFeedback[],
    }));

  const replyMap: Record<string, EnrichedFeedback[]> = {};
  DEMO_REPLIES
    .filter((r) => projectIds.includes(r.project_id))
    .forEach((r) => {
      const parentId = r.parent_id || "";
      if (!replyMap[parentId]) replyMap[parentId] = [];
      replyMap[parentId].push({
        ...r,
        project_name: projectNames[r.project_id] || "Unknown",
        site_name: siteName(siteId),
        site_id: siteId,
        creator_name: getCreatorName(r.created_by),
      });
    });

  return enriched.map((f) => ({
    ...f,
    replies: replyMap[f.id] || [],
  }));
}

export function getFeedbackCounts(siteId: string) {
  const fb = getFeedbackForSite(siteId);
  return {
    new_count: fb.filter((f) => f.status === "open").length,
    in_progress_count: fb.filter((f) => f.status === "in_progress").length,
    resolved_count: fb.filter((f) => f.status === "resolved").length,
    total: fb.length,
  };
}

function getCreatorName(userId: string): string {
  const map: Record<string, string> = {
    "demo-client-1": "Michael Chen (Client)",
    "demo-client-2": "Jennifer Williams (Client)",
    "demo-client-3": "Robert Kim (Client)",
    "demo-client-4": "Lisa Thompson (Client)",
    "demo-dev-1": "James Chen",
    "demo-dev-2": "Maria Rodriguez",
    "demo-dev-3": "Alex Thompson",
    "demo-dev-4": "Priya Patel",
  };
  return map[userId] || "Client";
}

export interface TeamMemberInfo {
  user_id: string;
  full_name: string;
  email: string;
  position: string | null;
}

export const DEMO_TEAM_MEMBERS: TeamMemberInfo[] = [
  { user_id: "demo-dev-1", full_name: "James Chen", email: "james@skylineagency.com", position: "developer" },
  { user_id: "demo-dev-2", full_name: "Maria Rodriguez", email: "maria@skylineagency.com", position: "designer" },
  { user_id: "demo-dev-3", full_name: "Alex Thompson", email: "alex@skylineagency.com", position: "manager" },
  { user_id: "demo-dev-4", full_name: "Priya Patel", email: "priya@skylineagency.com", position: "developer" },
];

export function getTeamMembers(): TeamMemberInfo[] {
  return DEMO_TEAM_MEMBERS;
}

export function getTeamMemberName(userId: string | null): string | null {
  if (!userId) return null;
  return DEMO_TEAM_MEMBERS.find((m) => m.user_id === userId)?.full_name || null;
}

export function getClientFeedback(userId: string): EnrichedFeedback[] {
  const projectNames: Record<string, string> = {};
  const siteMap: Record<string, string> = {};
  DEMO_PROJECTS.forEach((p) => {
    projectNames[p.id] = p.name;
    siteMap[p.id] = p.site_id;
  });

  const enriched = DEMO_FEEDBACK
    .filter((f) => f.created_by === userId)
    .map((f) => ({
      ...f,
      project_name: projectNames[f.project_id] || "Unknown",
      site_name: siteName(siteMap[f.project_id] || ""),
      site_id: siteMap[f.project_id] || "",
      creator_name: getCreatorName(f.created_by),
      viewport_label: f.viewport_width && f.viewport_height
        ? `${f.viewport_width}x${f.viewport_height}`
        : undefined,
      replies: [] as EnrichedFeedback[],
    }));

  const replyMap: Record<string, EnrichedFeedback[]> = {};
  DEMO_REPLIES
    .filter((r) => r.parent_id && DEMO_FEEDBACK.some((f) => f.id === r.parent_id && f.created_by === userId))
    .forEach((r) => {
      const pid = r.parent_id || "";
      if (!replyMap[pid]) replyMap[pid] = [];
      replyMap[pid].push({
        ...r,
        project_name: projectNames[r.project_id] || "Unknown",
        site_name: siteName(siteMap[r.project_id] || ""),
        site_id: siteMap[r.project_id] || "",
        creator_name: getCreatorName(r.created_by),
      });
    });

  return enriched.map((f) => ({
    ...f,
    replies: replyMap[f.id] || [],
  }));
}

export function getAssignedFeedback(userId: string): EnrichedFeedback[] {
  const projectNames: Record<string, string> = {};
  DEMO_PROJECTS.forEach((p) => { projectNames[p.id] = p.name; });

  const enriched = DEMO_FEEDBACK
    .filter((f) => f.assigned_to === userId)
    .map((f) => ({
      ...f,
      project_name: projectNames[f.project_id] || "Unknown",
      site_name: siteName(getSiteId(f.project_id)),
      site_id: getSiteId(f.project_id),
      creator_name: getCreatorName(f.created_by),
      viewport_label: f.viewport_width && f.viewport_height
        ? `${f.viewport_width}x${f.viewport_height}`
        : undefined,
      replies: [] as EnrichedFeedback[],
    }));

  const replyMap: Record<string, EnrichedFeedback[]> = {};
  DEMO_REPLIES
    .filter((r) => r.assigned_to === userId || r.created_by === userId)
    .forEach((r) => {
      const parentId = r.parent_id || "";
      if (!replyMap[parentId]) replyMap[parentId] = [];
      replyMap[parentId].push({
        ...r,
        project_name: projectNames[r.project_id] || "Unknown",
        site_name: siteName(getSiteId(r.project_id)),
        site_id: getSiteId(r.project_id),
        creator_name: getCreatorName(r.created_by),
      });
    });

  return enriched.map((f) => ({
    ...f,
    replies: replyMap[f.id] || [],
  }));
}

export function getSiteName(siteId: string): string {
  return DEMO_SITES.find((s) => s.id === siteId)?.name || "Unknown Site";
}

export function getProjectsForSite(siteId: string): Project[] {
  return DEMO_PROJECTS.filter((p) => p.site_id === siteId);
}

export function getAllFeedbackGroupedBySite() {
  return DEMO_SITES.map((site) => ({
    ...site,
    feedback_counts: getFeedbackCounts(site.id),
    projects: getProjectsForSite(site.id),
  }));
}
