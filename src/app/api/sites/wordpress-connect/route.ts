import { NextResponse } from "next/server";
import { testWordPressConnection } from "@/lib/wordpress/api";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { wp_api_url, wp_application_password } = body;

    if (!wp_api_url || !wp_application_password) {
      return NextResponse.json(
        { connected: false, error: "Missing WordPress credentials" },
        { status: 400 }
      );
    }

    const connected = await testWordPressConnection({
      apiUrl: wp_api_url.replace(/\/$/, ""),
      applicationPassword: wp_application_password,
    });

    return NextResponse.json({ connected });
  } catch {
    return NextResponse.json(
      { connected: false, error: "Connection failed" },
      { status: 500 }
    );
  }
}
