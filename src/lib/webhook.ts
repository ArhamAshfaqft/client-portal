const WP_WEBHOOK_PATH = "/wp-json/feeddash/v1/webhook";

export async function notifyWPWebhook(
  wpRestUrl: string,
  apiKey: string,
  action: string,
  data: Record<string, any>
) {
  try {
    const url = `${wpRestUrl.replace(/\/+$/, "")}/${WP_WEBHOOK_PATH.replace(/^\//, "")}`;
    console.log("[FeedDash] Webhook sending", { url, action, data, apiKey: apiKey ? apiKey.slice(0, 8) + '...' : 'empty' });
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-FeedDash-Key": apiKey,
      },
      body: JSON.stringify({ action, data }),
    });
    if (!res.ok) {
      console.warn("[FeedDash] Webhook to WP failed", res.status, await res.text());
    } else {
      console.log("[FeedDash] Webhook to WP success", { url, action, data });
    }
  } catch (err) {
    console.warn("[FeedDash] Webhook to WP error", err);
  }
}
