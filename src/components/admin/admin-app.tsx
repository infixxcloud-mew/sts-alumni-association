"use client";

import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import {
  CheckCircle2,
  ImagePlus,
  Loader2,
  LogOut,
  Plus,
  RefreshCw,
  Save,
  Upload,
} from "lucide-react";
import {
  getSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase/browser";

type AdminTab = "albums" | "announcement" | "memory";
type ContentType = "announcement" | "memory";

type AdminMedia = {
  id: string;
  title: string | null;
  alt: string | null;
  caption: string | null;
  storage_path: string | null;
  public_url: string | null;
  width: number | null;
  height: number | null;
};

type AdminAlbumPhoto = {
  album_id: string;
  media_id: string;
  title: string | null;
  caption: string | null;
  sort_order: number | null;
  media: AdminMedia | null;
};

type AdminAlbum = {
  id: string;
  slug: string;
  title: string;
  event_date: string | null;
  event_year: string | null;
  description: string | null;
  cover_media_id: string | null;
  is_published: boolean;
  sort_order: number | null;
  created_at: string | null;
  updated_at: string | null;
  cover: AdminMedia | null;
  photos: AdminAlbumPhoto[];
};

type AdminContent = {
  id: string;
  type: ContentType;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string | null;
  display_date: string | null;
  category: string | null;
  venue: string | null;
  cover_media_id: string | null;
  is_published: boolean;
  sort_order: number | null;
  created_at: string | null;
  updated_at: string | null;
  cover: AdminMedia | null;
};

type ContentForm = {
  id: string;
  type: ContentType;
  title: string;
  slug: string;
  display_date: string;
  category: string;
  venue: string;
  excerpt: string;
  body: string;
  cover_media_id: string;
  coverUrl: string;
  is_published: boolean;
  sort_order: string;
};

type AlbumForm = {
  id: string;
  title: string;
  slug: string;
  event_date: string;
  event_year: string;
  description: string;
  cover_media_id: string;
  coverUrl: string;
  is_published: boolean;
  sort_order: string;
};

const inputClass =
  "w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-950 outline-none transition focus:border-[#7a1f24] focus:ring-2 focus:ring-[#7a1f24]/20";
const labelClass = "text-sm font-medium text-stone-700";

function emptyContentForm(type: ContentType): ContentForm {
  return {
    id: "",
    type,
    title: "",
    slug: "",
    display_date: "",
    category: "",
    venue: "",
    excerpt: "",
    body: "",
    cover_media_id: "",
    coverUrl: "",
    is_published: false,
    sort_order: "0",
  };
}

function emptyAlbumForm(): AlbumForm {
  return {
    id: "",
    title: "",
    slug: "",
    event_date: "",
    event_year: "",
    description: "",
    cover_media_id: "",
    coverUrl: "",
    is_published: false,
    sort_order: "0",
  };
}

function slugify(value: string) {
  const slug = value
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[/?#&]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || `item-${Date.now()}`;
}

function fileSafeName(value: string) {
  return slugify(value).replace(/[^a-z0-9-]/g, "") || `image-${Date.now()}`;
}

function parseSortOrder(value: string) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function contentTypeLabel(type: ContentType) {
  return type === "announcement" ? "通告" : "回忆";
}

function imageFromFile(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("图片无法读取"));
    };
    image.src = url;
  });
}

async function compressImage(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("只能上传图片文件");
  }

  const image = await imageFromFile(file);
  const maxSize = 1800;
  const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("浏览器无法压缩图片");
  context.drawImage(image, 0, 0, width, height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error("图片压缩失败"))),
      "image/webp",
      0.82,
    );
  });

  const baseName = file.name.replace(/\.[^.]+$/, "");
  return {
    file: new File([blob], `${fileSafeName(baseName)}.webp`, {
      type: "image/webp",
    }),
    width,
    height,
  };
}

async function uploadCmsImage({
  supabase,
  file,
  title,
}: {
  supabase: SupabaseClient;
  file: File;
  title: string;
}) {
  const optimized = await compressImage(file);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) throw new Error("Admin session expired.");

  const formData = new FormData();
  formData.append("file", optimized.file);
  formData.append("title", title);
  formData.append("width", String(optimized.width));
  formData.append("height", String(optimized.height));

  const response = await fetch("/api/admin/r2-upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    body: formData,
  });

  const result = (await response.json()) as {
    media?: AdminMedia;
    error?: string;
  };

  if (!response.ok || !result.media) {
    throw new Error(result.error || "R2 upload failed.");
  }

  return result.media;
}

function StatusBadge({ published }: { published: boolean }) {
  return (
    <span
      className={
        published
          ? "inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700"
          : "inline-flex items-center gap-1 rounded-full bg-stone-100 px-2 py-1 text-xs font-medium text-stone-600"
      }
    >
      <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />
      {published ? "已发布" : "草稿"}
    </span>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1.5">
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}

function SetupPanel() {
  return (
    <main className="min-h-screen bg-stone-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-2xl rounded-lg border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <p className="mt-4 text-sm leading-6 text-stone-300">
          Supabase 环境变量还没有配置。先创建 Supabase 项目，并在本地
          <code className="mx-1 rounded bg-black/30 px-1.5 py-0.5">
            .env.local
          </code>
          或 Vercel Environment Variables 里加入
          <code className="mx-1 rounded bg-black/30 px-1.5 py-0.5">
            NEXT_PUBLIC_SUPABASE_URL
          </code>
          和
          <code className="mx-1 rounded bg-black/30 px-1.5 py-0.5">
            NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
          </code>
          。
        </p>
      </div>
    </main>
  );
}

function LoginPanel({
  onLogin,
  loading,
  error,
}: {
  onLogin: (email: string, password: string) => Promise<void>;
  loading: boolean;
  error: string;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onLogin(email, password);
  }

  return (
    <main className="min-h-screen bg-[#f8f6f1] px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="mx-auto grid max-w-md gap-5 rounded-lg border border-stone-200 bg-white p-6 shadow-sm"
      >
        <div>
          <p className="text-sm font-semibold tracking-[0.16em] text-[#7a1f24] uppercase">
            Admin
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-stone-950">后台登录</h1>
        </div>
        <Field label="Email">
          <input
            className={inputClass}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </Field>
        <Field label="Password">
          <input
            className={inputClass}
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </Field>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-[#7a1f24] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5f171b] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut aria-hidden="true" className="h-4 w-4 rotate-180" />
          )}
          登录
        </button>
      </form>
    </main>
  );
}

function NoAdminAccess({
  userEmail,
  onLogout,
}: {
  userEmail: string;
  onLogout: () => void;
}) {
  return (
    <main className="min-h-screen bg-[#f8f6f1] px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-lg border border-amber-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-stone-950">没有后台权限</h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">
          当前已登录：{userEmail}。这个账号还没有写入
          <code className="mx-1 rounded bg-stone-100 px-1.5 py-0.5">
            admin_profiles
          </code>
          。
        </p>
        <button
          type="button"
          onClick={onLogout}
          className="mt-5 inline-flex items-center gap-2 rounded-md bg-stone-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-stone-800"
        >
          <LogOut aria-hidden="true" className="h-4 w-4" />
          登出
        </button>
      </div>
    </main>
  );
}

export function AdminApp() {
  const configured = isSupabaseConfigured();
  const supabase = configured ? getSupabaseBrowserClient() : null;
  const [loadingAuth, setLoadingAuth] = useState(Boolean(supabase));
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>("albums");
  const [albums, setAlbums] = useState<AdminAlbum[]>([]);
  const [contents, setContents] = useState<AdminContent[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (!supabase) return;

    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUser(data.session?.user || null);
      setLoadingAuth(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user || null;
      setUser(nextUser);
      if (!nextUser) {
        setIsAdmin(false);
        setCheckingAdmin(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!supabase || !user) return;

    const client = supabase;
    const currentUser = user;
    let mounted = true;
    async function checkAdmin() {
      setCheckingAdmin(true);
      const { data, error } = await client
        .from("admin_profiles")
        .select("user_id")
        .eq("user_id", currentUser.id)
        .maybeSingle();

        if (!mounted) return;
        setIsAdmin(Boolean(data && !error));
        setCheckingAdmin(false);
    }

    void checkAdmin();

    return () => {
      mounted = false;
    };
  }, [supabase, user]);

  const loadAdminData = useCallback(async () => {
    if (!supabase || !isAdmin) return;
    setLoadingData(true);
    try {
      const [albumResult, photoResult, mediaResult, contentResult] =
        await Promise.all([
          supabase
            .from("cms_albums")
            .select(
              "id,slug,title,event_date,event_year,description,cover_media_id,is_published,sort_order,created_at,updated_at",
            )
            .order("sort_order", { ascending: true })
            .order("created_at", { ascending: false }),
          supabase
            .from("cms_album_photos")
            .select("album_id,media_id,title,caption,sort_order")
            .order("sort_order", { ascending: true }),
          supabase
            .from("cms_media")
            .select("id,title,alt,caption,storage_path,public_url,width,height"),
          supabase
            .from("cms_content")
            .select(
              "id,type,slug,title,excerpt,body,display_date,category,venue,cover_media_id,is_published,sort_order,created_at,updated_at",
            )
            .order("sort_order", { ascending: true })
            .order("created_at", { ascending: false }),
        ]);

      if (albumResult.error) throw albumResult.error;
      if (photoResult.error) throw photoResult.error;
      if (mediaResult.error) throw mediaResult.error;
      if (contentResult.error) throw contentResult.error;

      const mediaRows = (mediaResult.data as AdminMedia[] | null) || [];
      const mediaById = new Map(mediaRows.map((media) => [media.id, media]));
      const photoRows = (photoResult.data as Omit<AdminAlbumPhoto, "media">[] | null) || [];
      const photosByAlbum = new Map<string, AdminAlbumPhoto[]>();

      for (const photo of photoRows) {
        const photos = photosByAlbum.get(photo.album_id) || [];
        photos.push({
          ...photo,
          media: mediaById.get(photo.media_id) || null,
        });
        photosByAlbum.set(photo.album_id, photos);
      }

      setAlbums(
        ((albumResult.data as Omit<AdminAlbum, "cover" | "photos">[] | null) || []).map(
          (album) => ({
            ...album,
            cover: album.cover_media_id ? mediaById.get(album.cover_media_id) || null : null,
            photos: photosByAlbum.get(album.id) || [],
          }),
        ),
      );
      setContents(
        ((contentResult.data as Omit<AdminContent, "cover">[] | null) || []).map(
          (item) => ({
            ...item,
            cover: item.cover_media_id ? mediaById.get(item.cover_media_id) || null : null,
          }),
        ),
      );
    } finally {
      setLoadingData(false);
    }
  }, [isAdmin, supabase]);

  useEffect(() => {
    if (!isAdmin) return;

    async function loadInitialData() {
      await loadAdminData();
    }

    void loadInitialData();
  }, [isAdmin, loadAdminData]);

  async function handleLogin(email: string, password: string) {
    if (!supabase) return;
    setLoginLoading(true);
    setLoginError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoginLoading(false);
    if (error) setLoginError(error.message);
  }

  async function handleLogout() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
  }

  if (!configured || !supabase) return <SetupPanel />;
  if (loadingAuth) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f8f6f1]">
        <Loader2 aria-hidden="true" className="h-7 w-7 animate-spin text-[#7a1f24]" />
      </main>
    );
  }
  if (!user) {
    return <LoginPanel onLogin={handleLogin} loading={loginLoading} error={loginError} />;
  }
  if (checkingAdmin) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f8f6f1]">
        <Loader2 aria-hidden="true" className="h-7 w-7 animate-spin text-[#7a1f24]" />
      </main>
    );
  }
  if (!isAdmin) {
    return (
      <NoAdminAccess
        userEmail={user.email || user.id}
        onLogout={() => void handleLogout()}
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f6f1] text-stone-950">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-sm font-semibold tracking-[0.16em] text-[#7a1f24] uppercase">
              Admin
            </p>
            <h1 className="mt-1 text-2xl font-semibold">内容后台</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void loadAdminData()}
              className="inline-flex items-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 transition hover:border-[#7a1f24] hover:text-[#7a1f24]"
            >
              <RefreshCw aria-hidden="true" className="h-4 w-4" />
              刷新
            </button>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="inline-flex items-center gap-2 rounded-md bg-stone-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-stone-800"
            >
              <LogOut aria-hidden="true" className="h-4 w-4" />
              登出
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-wrap gap-2">
          {[
            ["albums", "相册"],
            ["announcement", "通告"],
            ["memory", "回忆"],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id as AdminTab)}
              className={
                activeTab === id
                  ? "rounded-md bg-[#7a1f24] px-4 py-2 text-sm font-semibold text-white"
                  : "rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-[#7a1f24] hover:text-[#7a1f24]"
              }
            >
              {label}
            </button>
          ))}
        </div>

        {loadingData ? (
          <div className="mb-4 inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm text-stone-600">
            <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
            读取中
          </div>
        ) : null}

        {activeTab === "albums" ? (
          <AlbumManager
            albums={albums}
            supabase={supabase}
            userId={user.id}
            onSaved={loadAdminData}
          />
        ) : (
          <ContentManager
            key={activeTab}
            type={activeTab}
            items={contents.filter((item) => item.type === activeTab)}
            supabase={supabase}
            userId={user.id}
            onSaved={loadAdminData}
          />
        )}
      </div>
    </main>
  );
}

function ContentManager({
  type,
  items,
  supabase,
  userId,
  onSaved,
}: {
  type: ContentType;
  items: AdminContent[];
  supabase: SupabaseClient;
  userId: string;
  onSaved: () => Promise<void>;
}) {
  const [form, setForm] = useState<ContentForm>(() => emptyContentForm(type));
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);
  const label = contentTypeLabel(type);

  function selectItem(item: AdminContent) {
    setForm({
      id: item.id,
      type,
      title: item.title,
      slug: item.slug,
      display_date: item.display_date || "",
      category: item.category || "",
      venue: item.venue || "",
      excerpt: item.excerpt || "",
      body: item.body || "",
      cover_media_id: item.cover_media_id || "",
      coverUrl: item.cover?.public_url || "",
      is_published: item.is_published,
      sort_order: String(item.sort_order || 0),
    });
    setCoverFile(null);
    setFileInputKey((key) => key + 1);
    setMessage("");
    setError("");
  }

  function newItem() {
    setForm(emptyContentForm(type));
    setCoverFile(null);
    setFileInputKey((key) => key + 1);
    setMessage("");
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const slug = form.slug.trim() || slugify(form.title);
      let coverMediaId = form.cover_media_id || null;

      if (coverFile) {
        const media = await uploadCmsImage({
          supabase,
          file: coverFile,
          title: form.title,
        });
        coverMediaId = media.id;
      }

      const payload = {
        type,
        title: form.title.trim(),
        slug,
        excerpt: form.excerpt.trim(),
        body: form.body.trim(),
        display_date: form.display_date.trim(),
        category: form.category.trim(),
        venue: form.venue.trim(),
        cover_media_id: coverMediaId,
        is_published: form.is_published,
        sort_order: parseSortOrder(form.sort_order),
      };

      if (form.id) {
        const { error: updateError } = await supabase
          .from("cms_content")
          .update(payload)
          .eq("id", form.id);
        if (updateError) throw updateError;
      } else {
        const { data, error: insertError } = await supabase
          .from("cms_content")
          .insert({ ...payload, created_by: userId })
          .select("id,cover_media_id")
          .single();
        if (insertError) throw insertError;
        setForm((current) => ({
          ...current,
          id: String(data.id),
          slug,
          cover_media_id: String(data.cover_media_id || coverMediaId || ""),
        }));
      }

      setCoverFile(null);
      setFileInputKey((key) => key + 1);
      setMessage(`${label}已保存`);
      await onSaved();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="grid gap-5 xl:grid-cols-[320px_1fr]">
      <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-semibold">{label}</h2>
          <button
            type="button"
            onClick={newItem}
            className="inline-flex items-center gap-1.5 rounded-md bg-stone-950 px-3 py-2 text-xs font-semibold text-white"
          >
            <Plus aria-hidden="true" className="h-3.5 w-3.5" />
            新建
          </button>
        </div>
        <div className="grid gap-2">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => selectItem(item)}
              className="rounded-md border border-stone-200 p-3 text-left transition hover:border-[#7a1f24]"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="line-clamp-2 text-sm font-semibold text-stone-950">
                  {item.title}
                </p>
                <StatusBadge published={item.is_published} />
              </div>
              <p className="mt-1 truncate text-xs text-stone-500">/{item.slug}</p>
            </button>
          ))}
          {items.length === 0 ? (
            <p className="rounded-md border border-dashed border-stone-300 p-4 text-sm text-stone-500">
              暂无内容
            </p>
          ) : null}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-5 rounded-lg border border-stone-200 bg-white p-5 shadow-sm"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold tracking-[0.14em] text-[#7a1f24] uppercase">
              {label}
            </p>
            <h2 className="mt-1 text-xl font-semibold">
              {form.id ? "编辑内容" : "新建内容"}
            </h2>
          </div>
          <label className="inline-flex items-center gap-2 text-sm font-medium text-stone-700">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  is_published: event.target.checked,
                }))
              }
            />
            发布
          </label>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Field label="标题">
            <input
              className={inputClass}
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  title: event.target.value,
                  slug: current.slug || slugify(event.target.value),
                }))
              }
              required
            />
          </Field>
          <Field label="Slug">
            <input
              className={inputClass}
              value={form.slug}
              onChange={(event) =>
                setForm((current) => ({ ...current, slug: slugify(event.target.value) }))
              }
              required
            />
          </Field>
          <Field label="日期">
            <input
              className={inputClass}
              value={form.display_date}
              onChange={(event) =>
                setForm((current) => ({ ...current, display_date: event.target.value }))
              }
            />
          </Field>
          <Field label="排序">
            <input
              className={inputClass}
              type="number"
              value={form.sort_order}
              onChange={(event) =>
                setForm((current) => ({ ...current, sort_order: event.target.value }))
              }
            />
          </Field>
          <Field label="分类">
            <input
              className={inputClass}
              value={form.category}
              onChange={(event) =>
                setForm((current) => ({ ...current, category: event.target.value }))
              }
            />
          </Field>
          <Field label="地点">
            <input
              className={inputClass}
              value={form.venue}
              onChange={(event) =>
                setForm((current) => ({ ...current, venue: event.target.value }))
              }
            />
          </Field>
        </div>

        <Field label="摘要">
          <textarea
            className={`${inputClass} min-h-24`}
            value={form.excerpt}
            onChange={(event) =>
              setForm((current) => ({ ...current, excerpt: event.target.value }))
            }
          />
        </Field>
        <Field label="正文">
          <textarea
            className={`${inputClass} min-h-52`}
            value={form.body}
            onChange={(event) =>
              setForm((current) => ({ ...current, body: event.target.value }))
            }
          />
        </Field>

        <div className="grid gap-3 rounded-md border border-stone-200 bg-stone-50 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-stone-700 transition hover:border-[#7a1f24] hover:text-[#7a1f24]">
              <ImagePlus aria-hidden="true" className="h-4 w-4" />
              封面图片
              <input
                key={fileInputKey}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => setCoverFile(event.target.files?.[0] || null)}
              />
            </label>
            {coverFile ? (
              <span className="text-sm text-stone-600">{coverFile.name}</span>
            ) : form.coverUrl ? (
              <span className="text-sm text-stone-600">已有封面</span>
            ) : null}
          </div>
        </div>

        {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={saving}
          className="inline-flex w-fit items-center gap-2 rounded-md bg-[#7a1f24] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5f171b] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
          ) : (
            <Save aria-hidden="true" className="h-4 w-4" />
          )}
          保存
        </button>
      </form>
    </section>
  );
}

function AlbumManager({
  albums,
  supabase,
  userId,
  onSaved,
}: {
  albums: AdminAlbum[];
  supabase: SupabaseClient;
  userId: string;
  onSaved: () => Promise<void>;
}) {
  const [form, setForm] = useState<AlbumForm>(() => emptyAlbumForm());
  const [files, setFiles] = useState<File[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);
  const selectedAlbum = useMemo(
    () => albums.find((album) => album.id === form.id) || null,
    [albums, form.id],
  );

  function selectAlbum(album: AdminAlbum) {
    setForm({
      id: album.id,
      title: album.title,
      slug: album.slug,
      event_date: album.event_date || "",
      event_year: album.event_year || "",
      description: album.description || "",
      cover_media_id: album.cover_media_id || "",
      coverUrl: album.cover?.public_url || "",
      is_published: album.is_published,
      sort_order: String(album.sort_order || 0),
    });
    setFiles([]);
    setFileInputKey((key) => key + 1);
    setMessage("");
    setError("");
  }

  function newAlbum() {
    setForm(emptyAlbumForm());
    setFiles([]);
    setFileInputKey((key) => key + 1);
    setMessage("");
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const slug = form.slug.trim() || slugify(form.title);
      const payload = {
        title: form.title.trim(),
        slug,
        event_date: form.event_date.trim(),
        event_year: form.event_year.trim(),
        description: form.description.trim(),
        cover_media_id: form.cover_media_id || null,
        is_published: form.is_published,
        sort_order: parseSortOrder(form.sort_order),
      };

      let albumId = form.id;
      let coverMediaId = form.cover_media_id || "";

      if (form.id) {
        const { error: updateError } = await supabase
          .from("cms_albums")
          .update(payload)
          .eq("id", form.id);
        if (updateError) throw updateError;
      } else {
        const { data, error: insertError } = await supabase
          .from("cms_albums")
          .insert({ ...payload, created_by: userId })
          .select("id")
          .single();
        if (insertError) throw insertError;
        albumId = String(data.id);
      }

      const baseSort = selectedAlbum?.photos.length || 0;
      for (const [index, file] of files.entries()) {
        const media = await uploadCmsImage({
          supabase,
          file,
          title: form.title || file.name,
        });
        const { error: photoError } = await supabase.from("cms_album_photos").insert({
          album_id: albumId,
          media_id: media.id,
          title: media.title || form.title,
          caption: "",
          sort_order: baseSort + index,
        });
        if (photoError) throw photoError;
        if (!coverMediaId) coverMediaId = media.id;
      }

      if (coverMediaId && coverMediaId !== form.cover_media_id) {
        const { error: coverError } = await supabase
          .from("cms_albums")
          .update({ cover_media_id: coverMediaId })
          .eq("id", albumId);
        if (coverError) throw coverError;
      }

      setForm((current) => ({
        ...current,
        id: albumId,
        slug,
        cover_media_id: coverMediaId,
      }));
      setFiles([]);
      setFileInputKey((key) => key + 1);
      setMessage("相册已保存");
      await onSaved();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="grid gap-5 xl:grid-cols-[320px_1fr]">
      <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-semibold">相册</h2>
          <button
            type="button"
            onClick={newAlbum}
            className="inline-flex items-center gap-1.5 rounded-md bg-stone-950 px-3 py-2 text-xs font-semibold text-white"
          >
            <Plus aria-hidden="true" className="h-3.5 w-3.5" />
            新建
          </button>
        </div>
        <div className="grid gap-2">
          {albums.map((album) => (
            <button
              key={album.id}
              type="button"
              onClick={() => selectAlbum(album)}
              className="rounded-md border border-stone-200 p-3 text-left transition hover:border-[#7a1f24]"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="line-clamp-2 text-sm font-semibold text-stone-950">
                  {album.title}
                </p>
                <StatusBadge published={album.is_published} />
              </div>
              <p className="mt-1 truncate text-xs text-stone-500">/{album.slug}</p>
              <p className="mt-2 text-xs text-stone-500">
                {album.photos.length} 张照片
              </p>
            </button>
          ))}
          {albums.length === 0 ? (
            <p className="rounded-md border border-dashed border-stone-300 p-4 text-sm text-stone-500">
              暂无相册
            </p>
          ) : null}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-5 rounded-lg border border-stone-200 bg-white p-5 shadow-sm"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold tracking-[0.14em] text-[#7a1f24] uppercase">
              Album
            </p>
            <h2 className="mt-1 text-xl font-semibold">
              {form.id ? "编辑相册" : "新建相册"}
            </h2>
          </div>
          <label className="inline-flex items-center gap-2 text-sm font-medium text-stone-700">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  is_published: event.target.checked,
                }))
              }
            />
            发布
          </label>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Field label="标题">
            <input
              className={inputClass}
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  title: event.target.value,
                  slug: current.slug || slugify(event.target.value),
                }))
              }
              required
            />
          </Field>
          <Field label="Slug">
            <input
              className={inputClass}
              value={form.slug}
              onChange={(event) =>
                setForm((current) => ({ ...current, slug: slugify(event.target.value) }))
              }
              required
            />
          </Field>
          <Field label="日期">
            <input
              className={inputClass}
              value={form.event_date}
              onChange={(event) =>
                setForm((current) => ({ ...current, event_date: event.target.value }))
              }
            />
          </Field>
          <Field label="年份">
            <input
              className={inputClass}
              value={form.event_year}
              onChange={(event) =>
                setForm((current) => ({ ...current, event_year: event.target.value }))
              }
            />
          </Field>
          <Field label="排序">
            <input
              className={inputClass}
              type="number"
              value={form.sort_order}
              onChange={(event) =>
                setForm((current) => ({ ...current, sort_order: event.target.value }))
              }
            />
          </Field>
        </div>

        <Field label="说明">
          <textarea
            className={`${inputClass} min-h-28`}
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({ ...current, description: event.target.value }))
            }
          />
        </Field>

        <div className="grid gap-3 rounded-md border border-stone-200 bg-stone-50 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-stone-700 transition hover:border-[#7a1f24] hover:text-[#7a1f24]">
              <Upload aria-hidden="true" className="h-4 w-4" />
              上传照片
              <input
                key={fileInputKey}
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(event) => setFiles(Array.from(event.target.files || []))}
              />
            </label>
            {files.length > 0 ? (
              <span className="text-sm text-stone-600">{files.length} 个文件</span>
            ) : form.coverUrl ? (
              <span className="text-sm text-stone-600">已有封面</span>
            ) : null}
          </div>
          {selectedAlbum ? (
            <div className="flex flex-wrap gap-2 text-xs text-stone-500">
              <span>{selectedAlbum.photos.length} 张已上传照片</span>
              {selectedAlbum.cover?.public_url ? <span>已有封面</span> : null}
            </div>
          ) : null}
        </div>

        {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={saving}
          className="inline-flex w-fit items-center gap-2 rounded-md bg-[#7a1f24] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5f171b] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
          ) : (
            <Save aria-hidden="true" className="h-4 w-4" />
          )}
          保存
        </button>
      </form>
    </section>
  );
}
