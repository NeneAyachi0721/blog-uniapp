export type PostDetailSource = "home" | "archive" | "friends";

const SOURCE_TAB_URL: Record<PostDetailSource, string> = {
  home: "/pages/home/index",
  archive: "/pages/archive/index",
  friends: "/pages/friends/index",
};

let postNavigationLocked = false;

export function resetPostNavigationLock() {
  postNavigationLocked = false;
}

export function getSourceTabUrl(source?: string | null) {
  if (source === "archive") return SOURCE_TAB_URL.archive;
  if (source === "friends") return SOURCE_TAB_URL.friends;
  return SOURCE_TAB_URL.home;
}

export function openPostDetail(
  slug?: string | null,
  source: PostDetailSource = "home",
) {
  if (!slug || postNavigationLocked) return;

  postNavigationLocked = true;

  const url = `/pages/post/detail?slug=${encodeURIComponent(slug)}&from=${source}`;

  // 微信小程序从 tabBar 页面 navigateTo 非 tabBar 页面时，底部 tabBar 会先消失，
  // 内容区再做右入场动画，分离预览窗口里会显得“上下两块画面不同步”。
  // reLaunch 不走进栈右滑动画，并由详情页自定义返回到来源 tab，能避免画面割裂。
  uni.reLaunch({
    url,
    fail: () => {
      uni.showToast({ title: "文章暂时无法打开", icon: "none" });
    },
    complete: () => {
      setTimeout(() => {
        postNavigationLocked = false;
      }, 520);
    },
  });
}
