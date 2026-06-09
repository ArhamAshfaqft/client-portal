export interface UploadResult {
  id: string;
  url: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

export async function uploadToWordPress(
  wpApiUrl: string,
  wpApiKey: string,
  file: File,
  projectId: string
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  if (projectId) formData.append('project_id', projectId);

  const baseUrl = wpApiUrl.replace(/\/+$/, '');
  const res = await fetch(`${baseUrl}/wp-json/feeddash/v1/media`, {
    method: 'POST',
    headers: { 'X-FeedDash-Key': wpApiKey },
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`WordPress upload failed: ${res.status}`);
  }

  return res.json();
}

export function getFileTypeCategory(file: File): string {
  const type = file.type;
  if (type.startsWith('image/')) return 'image';
  if (type.startsWith('video/')) return 'video';
  if (type.startsWith('audio/')) return 'audio';
  return 'document';
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}
