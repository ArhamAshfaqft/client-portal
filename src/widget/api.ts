import type { Annotation, CreateAnnotationPayload } from './types';

export interface VerifyResult {
  valid: boolean;
  projectId?: string;
  primaryColor?: string;
  siteName?: string;
}

export function createApiClient(baseUrl: string, token: string) {
  async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
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

  return {
    verifyToken: (): Promise<VerifyResult> =>
      request(`/widget/verify-token`, {
        method: 'POST',
        body: JSON.stringify({ token }),
      }),

    getAnnotations: (pageUrl: string): Promise<Annotation[]> =>
      request(`/widget/annotations?token=${encodeURIComponent(token)}&pageUrl=${encodeURIComponent(pageUrl)}`),

    createAnnotation: (payload: CreateAnnotationPayload): Promise<Annotation> =>
      request(`/widget/annotations`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    updateAnnotation: (id: string, data: Partial<Annotation>): Promise<Annotation> =>
      request(`/widget/annotations/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),

    deleteAnnotation: (id: string): Promise<void> =>
      request(`/widget/annotations/${id}`, {
        method: 'DELETE',
      }),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
