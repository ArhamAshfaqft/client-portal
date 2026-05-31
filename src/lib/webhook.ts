const WP_WEBHOOK_PATH = "/wp-json/feedspace/v1/webhook";

export async function notifyWPWebhook(
  wpRestUrl: string,
  apiKey: string,
  action: string,
  data: Record<string, any>
) {
  try {
    const url = `${wpRestUrl.replace(/\/+$/, "")}/${WP_WEBHOOK_PATH.replace(/^\//, "")}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Feedspace-Key": apiKey,
      },
      body: JSON.stringify({ action, data }),
    });
    if (!res.ok) {
      console.warn("[Feedspace] Webhook to WP failed", res.status, await res.text());
    }
  } catch (err) {
    console.warn("[Feedspace] Webhook to WP error", err);
  }
}
