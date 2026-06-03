export type UserRole = "owner" | "developer" | "client";

export type FeedbackType = "pin" | "comment" | "voice" | "media" | "rect" | "arrow" | "draw";
export type FeedbackStatus = "open" | "in_progress" | "resolved" | "closed";
export type ProjectStatus = "draft" | "active" | "completed" | "archived";
export type MediaStorageType = "wordpress" | "supabase";

export interface Agency {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  custom_domain: string | null;
  created_at: string;
}

export type PositionType = "manager" | "developer" | "designer" | "custom";

export interface Profile {
  id: string;
  user_id: string;
  agency_id: string;
  role: UserRole;
  full_name: string;
  avatar_url: string | null;
  email: string;
  position: string | null;
  permissions: string[];
  created_at: string;
}

export interface Site {
  id: string;
  agency_id: string;
  name: string;
  url: string;
  wp_api_url: string | null;
  wp_api_key: string | null;
  wp_application_password: string | null;
  wp_connected: boolean;
  created_at: string;
}

export interface Project {
  id: string;
  agency_id: string;
  site_id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  created_at: string;
}

export interface PreviewLink {
  id: string;
  project_id: string;
  token: string;
  target_url: string;
  created_by: string;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface FeedbackItem {
  id: string;
  project_id: string;
  parent_id: string | null;
  type: FeedbackType;
  content: string;
  page_url: string;
  selector: string | null;
  coordinates_x: number | null;
  coordinates_y: number | null;
  coordinates_x_end: number | null;
  coordinates_y_end: number | null;
  width: number | null;
  height: number | null;
  draw_data: string | null;
  element_dna: Record<string, unknown> | null;
  meta_data: Record<string, unknown> | null;
  viewport_width: number | null;
  viewport_height: number | null;
  device: string | null;
  mirror_id: string | null;
  status: FeedbackStatus;
  assigned_to: string | null;
  created_by: string;
  created_at: string;
}

export const DEFAULT_FEEDBACK_FIELDS = {
  coordinates_x_end: null,
  coordinates_y_end: null,
  width: null,
  height: null,
  draw_data: null,
  element_dna: null,
  meta_data: null,
  device: null,
  mirror_id: null,
};

export interface SiteFeedbackCounts {
  site_id: string;
  new_count: number;
  in_progress_count: number;
  resolved_count: number;
  total: number;
}

export interface FeedbackMedia {
  id: string;
  feedback_item_id: string;
  file_url: string;
  file_type: string;
  file_name: string;
  file_size: number;
  storage_type: MediaStorageType;
  created_at: string;
}

export interface TeamMember {
  id: string;
  agency_id: string;
  profile: Profile;
  project_count: number;
  last_active: string | null;
  created_at: string;
}

export interface SiteMember {
  id: string;
  site_id: string;
  user_id: string;
  agency_id: string;
  assigned_by: string | null;
  message: string | null;
  created_at: string;
}

export interface DevReport {
  id: string;
  developer_id: string;
  project_id: string;
  date: string;
  summary: string;
  hours_logged: number;
  created_at: string;
}

export interface DashboardStats {
  total_sites: number;
  active_projects: number;
  open_feedback: number;
  team_members: number;
  resolved_feedback: number;
  feedback_by_status: { status: string; count: number }[];
  recent_activity: FeedbackItem[];
}
