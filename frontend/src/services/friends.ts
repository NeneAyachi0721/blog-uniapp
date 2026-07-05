import type { ApplyFriendLinkPayload, FriendLinkItem } from "@/types/blog";
import { request } from "./request";

export function getApprovedFriends() {
  return request<{ list: FriendLinkItem[] }>("/api/public/friends");
}

export function applyFriendLink(data: ApplyFriendLinkPayload) {
  return request<{ item: FriendLinkItem; message?: string }>(
    "/api/public/friends/apply",
    {
      method: "POST",
      data,
    },
  );
}
