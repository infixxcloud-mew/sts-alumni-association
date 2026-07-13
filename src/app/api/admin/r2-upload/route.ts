import { createClient } from "@supabase/supabase-js";
import { isR2Configured, putR2Object, r2PublicUrlFor } from "@/lib/r2";

export const runtime = "nodejs";

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

function fileSafeName(value: string) {
  return (
    value
      .normalize("NFKC")
      .trim()
      .toLowerCase()
      .replace(/\.[^.]+$/, "")
      .replace(/[\s_]+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || `image-${Date.now()}`
  );
}

function numberFromForm(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function POST(request: Request) {
  if (!isR2Configured()) {
    return jsonError("Cloudflare R2 environment variables are not configured.", 500);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const authHeader = request.headers.get("authorization") || "";
  const accessToken = authHeader.replace(/^Bearer\s+/i, "").trim();

  if (!supabaseUrl || !publishableKey) {
    return jsonError("Supabase environment variables are not configured.", 500);
  }
  if (!accessToken) return jsonError("Missing admin session.", 401);

  const supabase = createClient(supabaseUrl, publishableKey, {
    auth: {
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(accessToken);

  if (userError || !user) return jsonError("Invalid admin session.", 401);

  const adminProfileQuery = supabase
    .from("admin_profiles")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  const adminEmailQuery = user.email
    ? supabase
        .from("admin_emails")
        .select("email")
        .eq("email", user.email.toLowerCase())
        .maybeSingle()
    : Promise.resolve({ data: null, error: null });
  const [adminProfile, adminEmail] = await Promise.all([
    adminProfileQuery,
    adminEmailQuery,
  ]);

  if (!adminProfile.data && !adminEmail.data) {
    return jsonError("Admin permission required.", 403);
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const title = String(formData.get("title") || "");

  if (!(file instanceof File)) return jsonError("Missing image file.", 400);
  if (!file.type.startsWith("image/")) return jsonError("Only image files are allowed.", 400);
  if (file.size > 10 * 1024 * 1024) {
    return jsonError("Image is larger than the 10MB upload limit.", 400);
  }

  const key = `admin/${user.id}/${Date.now()}-${fileSafeName(file.name)}.webp`;
  const body = Buffer.from(await file.arrayBuffer());

  await putR2Object({
    key,
    body,
    contentType: file.type || "image/webp",
  });

  const publicUrl = r2PublicUrlFor(key);
  const { data: media, error: mediaError } = await supabase
    .from("cms_media")
    .insert({
      title,
      alt: title,
      caption: "",
      storage_path: key,
      public_url: publicUrl,
      width: numberFromForm(formData.get("width")),
      height: numberFromForm(formData.get("height")),
      created_by: user.id,
    })
    .select("id,title,alt,caption,storage_path,public_url,width,height")
    .single();

  if (mediaError) return jsonError(mediaError.message, 500);

  return Response.json({ media });
}
