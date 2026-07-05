import { API_BASE_URL } from "@/config";
import type { MaybeDate, PostListItem } from "@/types/blog";

export function toDate(value: MaybeDate): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "number") {
    return new Date(value < 10_000_000_000 ? value * 1000 : value);
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDate(value: MaybeDate, fallback = "未发布") {
  const date = toDate(value);
  if (!date) return fallback;
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}.${month}.${day}`;
}

export function formatMonthDay(value: MaybeDate, fallback = "--") {
  const date = toDate(value);
  if (!date) return fallback;
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${month}.${day}`;
}

export function getYear(value: MaybeDate) {
  return toDate(value)?.getFullYear() ?? 0;
}

export function compactNumber(value?: number | null) {
  const num = Number(value ?? 0);
  if (num >= 10000) return `${(num / 10000).toFixed(num >= 100000 ? 0 : 1)}万`;
  if (num >= 1000) return `${(num / 1000).toFixed(num >= 10000 ? 0 : 1)}千`;
  return `${num}`;
}

export function postExcerpt(
  post: Pick<PostListItem, "excerpt" | "contentText">,
) {
  const raw = post.excerpt || post.contentText || "";
  const cleanText = raw.replace(/\s+/g, " ").trim();
  return cleanText.length > 88 ? `${cleanText.slice(0, 88)}…` : cleanText;
}

export function resolveAssetUrl(url?: string | null) {
  if (!url) return "";
  if (
    /^https?:\/\//i.test(url) ||
    url.startsWith("data:") ||
    url.startsWith("wxfile:") ||
    url.startsWith("/static/")
  ) {
    return url;
  }
  if (url.startsWith("/")) return `${API_BASE_URL}${url}`;
  return url;
}

export function splitTags(input: string) {
  return input
    .split(/[,\s，、]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);
}
