export type MaybeDate = string | number | Date | null | undefined;

export interface SiteInfoConfig {
  title?: string;
  favicon?: string;
  footer?: string;
  icp?: string;
  footerLinks?: Array<{ name: string; url: string }>;
}

export interface PersonalInfoConfig {
  username?: string;
  avatar?: string;
  bio?: string;
  socialLinks?: Array<{
    name: string;
    url: string;
    iconLight?: string;
    iconDark?: string;
  }>;
  hero?: string;
  heroTitle?: string;
  heroSubtitles?: string[];
}

export interface PostListItem {
  uuid: string;
  title: string;
  contentText?: string | null;
  coverImage?: string | null;
  status?: string;
  tags: string[];
  slug?: string | null;
  excerpt?: string | null;
  viewCount: number;
  pinnedAt?: MaybeDate;
  publishedAt?: MaybeDate;
  deletedAt?: MaybeDate;
  createdAt?: MaybeDate;
  updatedAt?: MaybeDate;
}

export interface PublicPostDetail
  extends Omit<PostListItem, "contentText" | "status" | "deletedAt"> {
  content?: unknown;
  wordCount?: number;
}

export interface ArchivePost {
  title: string;
  slug: string | null;
  publishedAt: MaybeDate;
  tags: string[];
}

export interface FriendLinkItem {
  uuid: string;
  name: string;
  url: string;
  avatarUrl?: string | null;
  description?: string | null;
  tags?: string[] | null;
  status?: "pending" | "approved" | "rejected";
  applicantEmail?: string | null;
  rejectReason?: string | null;
  joinedAt?: MaybeDate;
  createdAt?: MaybeDate;
  updatedAt?: MaybeDate;
}

export interface ApplyFriendLinkPayload {
  name: string;
  url: string;
  avatarUrl?: string;
  description?: string;
  tags?: string[];
  applicantEmail?: string;
}
