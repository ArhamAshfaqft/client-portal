import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function proxy(request: NextRequest, method: string) {
  const pathname = request.nextUrl.pathname.replace(/^\/api\/supabase-proxy\//, "");
  const search = request.nextUrl.search;
  const target = `${SUPABASE_URL}/${pathname}${search}`;

  const headers: Record<string, string> = {
    apikey: SUPABASE_KEY,
  };
  const auth = request.headers.get("Authorization");
  if (auth) headers["Authorization"] = auth;
  else headers["Authorization"] = `Bearer ${SUPABASE_KEY}`;

  const contentType = request.headers.get("Content-Type");
  if (contentType) headers["Content-Type"] = contentType;
  else if (method !== "GET" && method !== "HEAD") headers["Content-Type"] = "application/json";

  const accept = request.headers.get("Accept");
  if (accept) headers["Accept"] = accept;

  const prefer = request.headers.get("Prefer");
  if (prefer) headers["Prefer"] = prefer;

  const body = method === "GET" || method === "HEAD" ? undefined : await request.text();
  const res = await fetch(target, { method, headers, body });
  const responseBody = await res.text();
  return new NextResponse(responseBody, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("Content-Type") || "application/json" },
  });
}

export const GET = (r: NextRequest) => proxy(r, "GET");
export const POST = (r: NextRequest) => proxy(r, "POST");
export const PATCH = (r: NextRequest) => proxy(r, "PATCH");
export const DELETE = (r: NextRequest) => proxy(r, "DELETE");
export const PUT = (r: NextRequest) => proxy(r, "PUT");
