import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const formData = await request.formData();
  const file = formData.get("file") as File;
  const projectId = formData.get("projectId") as string;
  const fileName = formData.get("fileName") as string || file.name;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const filePath = `${projectId}/${Date.now()}-${fileName}`;

  const { data, error } = await supabase.storage
    .from("feedback-media")
    .upload(filePath, file);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const { data: publicUrl } = supabase.storage
    .from("feedback-media")
    .getPublicUrl(data.path);

  return NextResponse.json({ url: publicUrl.publicUrl });
}
