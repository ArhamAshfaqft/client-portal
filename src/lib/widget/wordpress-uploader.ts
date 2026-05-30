export async function uploadToWordPress(
  wpApiUrl: string,
  applicationPassword: string,
  file: File | Blob,
  fileName: string
): Promise<{ url: string; id: number }> {
  const auth = btoa(applicationPassword);
  const formData = new FormData();
  formData.append("file", file, fileName);

  const response = await fetch(`${wpApiUrl}/wp/v2/media`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`WordPress upload failed: ${response.statusText}`);
  }

  const data = await response.json();
  return { url: data.source_url, id: data.id };
}

export async function uploadToSupabaseFallback(
  supabaseUrl: string,
  supabaseAnonKey: string,
  file: File | Blob,
  fileName: string,
  projectId: string
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("projectId", projectId);
  formData.append("fileName", fileName);

  const response = await fetch(`/api/media/upload`, {
    method: "POST",
    headers: {
      apikey: supabaseAnonKey,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Upload failed");
  }

  const data = await response.json();
  return data.url;
}
