export interface WidgetConfig {
  apiUrl: string;
  token: string;
  projectId: string;
  primaryColor: string;
  wpApiUrl: string;
  wpApiKey: string;
  pageUrl: string;
  devMode?: boolean;
  siteName?: string;
}

export interface ElementDNA {
  selector: string;
  tag: string;
  text: string;
  fingerprint: string;
  dataId: string | null;
}

export interface Annotation {
  id: string;
  type: 'pin' | 'rect' | 'arrow' | 'draw';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  content: string;
  projectId?: string;
  pageUrl: string;
  elementDna: ElementDNA | null;
  anchorXPct: number;
  anchorYPct: number;
  widthPct: number | null;
  heightPct: number | null;
  endAnchorXPct: number | null;
  endAnchorYPct: number | null;
  endElementDna: ElementDNA | null;
  drawData: { pathD: string; points: Array<{ x: number; y: number }> } | null;
  viewportWidth: number;
  viewportHeight: number;
  device: string;
  createdBy: string;
  createdAt: string;
  replies: Reply[];
  media: AnnotationMedia[];
}

export interface Reply {
  id: string;
  content: string;
  createdBy: string;
  createdAt: string;
}

export interface AnnotationMedia {
  id: string;
  fileUrl: string;
  fileType: string;
  fileName: string;
}

export interface CreateAnnotationPayload {
  projectId: string;
  previewToken: string;
  type: 'pin' | 'rect' | 'arrow' | 'draw';
  content: string;
  pageUrl: string;
  selector: string | null;
  elementDna: ElementDNA | null;
  coordinatesX: number;
  coordinatesY: number;
  coordinatesXEnd: number | null;
  coordinatesYEnd: number | null;
  width: number | null;
  height: number | null;
  drawData: string | null;
  viewportWidth: number;
  viewportHeight: number;
  device: string;
  createdBy?: string;
  metaData: Record<string, unknown>;
  media?: AnnotationMedia[];
}

export type ToolMode = 'select' | 'pin' | 'rect' | 'arrow' | 'draw';
export type DeviceMode = 'desktop' | 'tablet' | 'mobile';
export type FilterMode = 'all' | 'open' | 'in_progress' | 'resolved' | 'pending';
