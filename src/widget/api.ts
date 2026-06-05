import type { Annotation, CreateAnnotationPayload } from './types';

export interface VerifyResult {
  valid: boolean;
  projectId?: string;
  primaryColor?: string;
  siteName?: string;
}

export function createApiClient(baseUrl: string, token: string, wpApiUrl?: string, wpApiKey?: string) {
  async function vercelRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${baseUrl.replace(/\/+$/, '')}/api${path}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    if (!res.ok) {
      throw new Error(`API error ${res.status}: ${await res.text()}`);
    }
    return res.json();
  }

  async function wpRequest<T>(method: string, path: string, body?: unknown): Promise<T> {
    const url = `${wpApiUrl!.replace(/\/+$/, '')}/wp-json/feedspace/v1${path}`;
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Feedspace-Key': wpApiKey!,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      throw new Error(`WordPress API error ${res.status}: ${await res.text()}`);
    }
    return res.json();
  }

  const useWp = !!(wpApiUrl && wpApiKey);

  return {
    verifyToken: (): Promise<VerifyResult> =>
      vercelRequest(`/widget/verify-token`, {
        method: 'POST',
        body: JSON.stringify({ token }),
      }),

    getAnnotations: (pageUrl: string, projectId: string): Promise<Annotation[]> => {
      if (useWp) {
        return wpRequest('GET', `/annotations?pageUrl=${encodeURIComponent(pageUrl)}&projectId=${encodeURIComponent(projectId)}`);
      }
      return vercelRequest(`/widget/annotations?token=${encodeURIComponent(token)}&pageUrl=${encodeURIComponent(pageUrl)}`);
    },

    getStatuses: (ids: string[]): Promise<Record<string, string>> => {
      return vercelRequest<{ statuses: Record<string, string> }>(`/widget/statuses?token=${encodeURIComponent(token)}&ids=${encodeURIComponent(ids.join(','))}`)
        .then(r => r.statuses);
    },

    getReplyIds: (pageUrl: string): Promise<string[]> => {
      return vercelRequest<{ replyIds: string[] }>(`/widget/reply-ids?token=${encodeURIComponent(token)}&pageUrl=${encodeURIComponent(pageUrl)}`)
        .then(r => r.replyIds);
    },

    createAnnotation: (payload: CreateAnnotationPayload): Promise<Annotation> => {
      if (useWp) {
        return wpRequest('POST', '/annotations', payload);
      }
      return vercelRequest(`/widget/annotations`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    updateAnnotation: (id: string, data: Partial<Annotation>): Promise<Annotation> => {
      if (useWp) {
        return wpRequest('PATCH', `/annotations/${id}`, data);
      }
      return vercelRequest(`/widget/annotations/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },

    deleteAnnotation: (id: string): Promise<void> => {
      if (useWp) {
        return wpRequest('DELETE', `/annotations/${id}`);
      }
      return vercelRequest(`/widget/annotations/${id}`, {
        method: 'DELETE',
      });
    },
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
