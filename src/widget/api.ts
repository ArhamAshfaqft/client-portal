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
      let qs = `&token=${encodeURIComponent(token)}`;
      if (useWp && wpApiKey) {
        qs += `&wpApiKey=${encodeURIComponent(wpApiKey)}`;
      }
      const fullPath = `/widget/statuses?ids=${encodeURIComponent(ids.join(','))}${qs}`;
      const fullUrl = `${baseUrl.replace(/\/+$/, '')}/api${fullPath}`;
      if ((window as any).__feedspaceDebug?.push) {
        (window as any).__feedspaceDebug.push({ msg: 'getStatuses URL', data: fullUrl.replace(wpApiKey || '', '***'), time: Date.now() });
      }
      console.log('[Feedspace] Fetching statuses from', fullUrl.replace(wpApiKey || '', '***'));
      return vercelRequest<{ statuses: Record<string, string> }>(fullPath)
        .then(r => {
          console.log('[Feedspace] Statuses response keys:', Object.keys(r.statuses).length);
          return r.statuses;
        });
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
