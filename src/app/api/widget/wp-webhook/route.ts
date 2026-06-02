import { NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { wpRestUrl, wpApiKey, action, data } = body;

    if (!wpRestUrl || !wpApiKey || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400, headers: corsHeaders });
    }

    const webhookUrl = `${wpRestUrl.replace(/\/+$/, "")}/wp-json/feedspace/v1/webhook`;
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Feedspace-Key": wpApiKey,
      },
      body: JSON.stringify({ action, data }),
    });

    const text = await res.text();
    return NextResponse.json(
      { ok: res.ok, status: res.status, body: text },
      { headers: corsHeaders }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
