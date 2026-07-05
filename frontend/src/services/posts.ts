import type {
  ArchivePost,
  PostListItem,
  PublicPostDetail,
} from "@/types/blog";
import { request } from "./request";

export function getPublicPosts(query: {
  page?: number;
  pageSize?: number;
  keyword?: string;
}) {
  return request<{ list: PostListItem[]; total: number }>("/api/public/posts", {
    query,
  });
}

export function getArchivePosts() {
  return request<{ list: ArchivePost[] }>("/api/public/posts/archive");
}

export function getPostBySlug(slug: string) {
  return request<{ post: PublicPostDetail }>(
    `/api/public/posts/${encodeURIComponent(slug)}`,
  );
}
