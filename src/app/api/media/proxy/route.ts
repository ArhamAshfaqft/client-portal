import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing url param" }, { status: 400 });
  }

  try {
    const parsed = new URL(url);
    const wpHost = parsed.origin;

    const response = await fetch(url, {
      headers: { "User-Agent": "FeedDashProxy/1.0" },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Upstream returned ${response.status}` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get("content-type") || "application/octet-stream";
    const body = await response.arrayBuffer();

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*",
        "X-Proxy-Host": wpHost,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: `Proxy failed: ${err.message}` },
      { status: 502 }
    );
  }
}
