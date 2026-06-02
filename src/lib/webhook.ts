const WP_WEBHOOK_PATH = "/wp-json/feedspace/v1/webhook";

// Use Vercel server proxy to avoid browser CORS/loopback restrictions
export async function notifyWPWebhook(
  wpRestUrl: string,
  apiKey: string,
  action: string,
  data: Record<string, any>
) {
  try {
    const proxyUrl = "/api/widget/wp-webhook";
    const res = await fetch(proxyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wpRestUrl, wpApiKey: apiKey, action, data }),
    });
    const result = await res.json();
    if (result.ok) {
      console.log("[Feedspace] Webhook to WP success", { action, data });
    } else {
      console.warn("[Feedspace] Webhook to WP failed", result.status, result.body);
    }
  } catch (err) {
    console.warn("[Feedspace] Webhook to WP error", err);
  }
}
