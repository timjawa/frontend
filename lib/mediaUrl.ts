/**
 * Origin Laravel (tanpa suffix /api) dari base URL API.
 */
export function backendOriginFromApiBase(apiBase: string): string {
  return apiBase.replace(/\/api\/?$/i, "");
}

/**
 * URL siap dipakai untuk <img> / <video> — path relatif (/storage/...) di-resolve ke host backend.
 */
export function resolveMediaSrc(apiBase: string, url: string | null | undefined): string {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  const origin = backendOriginFromApiBase(apiBase);
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${origin}${path}`;
}

export function isYouTubeUrl(url: string): boolean {
  return /youtube\.com|youtu\.be/i.test(url);
}

export function toYouTubeEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.replace(/^www\./, "") === "youtu.be") {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
  } catch {
    return null;
  }
  return null;
}
