export interface WordPressConfig {
  apiUrl: string;
  applicationPassword: string;
}

export async function uploadMediaToWordPress(
  config: WordPressConfig,
  file: File | Blob,
  fileName: string
): Promise<{ url: string; id: number } | null> {
  try {
    const auth = btoa(config.applicationPassword);
    const formData = new FormData();
    formData.append("file", file, fileName);

    const response = await fetch(`${config.apiUrl}/wp/v2/media`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("WordPress upload failed:", errorText);
      return null;
    }

    const data = await response.json();
    return {
      url: data.source_url,
      id: data.id,
    };
  } catch (error) {
    console.error("WordPress upload error:", error);
    return null;
  }
}

export async function deleteMediaFromWordPress(
  config: WordPressConfig,
  mediaId: number
): Promise<boolean> {
  try {
    const auth = btoa(config.applicationPassword);

    const response = await fetch(
      `${config.apiUrl}/wp/v2/media/${mediaId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    return response.ok;
  } catch {
    return false;
  }
}

export async function testWordPressConnection(
  config: WordPressConfig
): Promise<boolean> {
  try {
    const auth = btoa(config.applicationPassword);

    const response = await fetch(`${config.apiUrl}/wp/v2/`, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    return response.ok;
  } catch {
    return false;
  }
}
