<script setup lang="ts">
import { computed, ref } from "vue";
import {
  onLoad,
  onPullDownRefresh,
  onReachBottom,
  onShow,
} from "@dcloudio/uni-app";
import PostCard from "@/components/PostCard.vue";
import StateBlock from "@/components/StateBlock.vue";
import { APP_FALLBACK } from "@/config";
import { getConfig } from "@/services/config";
import { getPublicPosts } from "@/services/posts";
import type {
  PersonalInfoConfig,
  PostListItem,
  SiteInfoConfig,
} from "@/types/blog";
import { openPostDetail, resetPostNavigationLock } from "@/utils/navigation";
import { resolveAssetUrl } from "@/utils/format";

const PAGE_SIZE = 8;

const siteInfo = ref<SiteInfoConfig>({});
const personalInfo = ref<PersonalInfoConfig>({});
const posts = ref<PostListItem[]>([]);
const total = ref(0);
const page = ref(1);
const loading = ref(false);
const loadingMore = ref(false);
const error = ref("");

const siteTitle = computed(
  () =>
    siteInfo.value.title ||
    personalInfo.value.username ||
    APP_FALLBACK.siteTitle,
);
const heroTitle = computed(
  () => personalInfo.value.heroTitle || APP_FALLBACK.heroTitle,
);
const heroSubtitle = computed(
  () =>
    personalInfo.value.heroSubtitles?.[0] ||
    personalInfo.value.bio ||
    APP_FALLBACK.heroSubtitle,
);
const heroImage = computed(() =>
  resolveAssetUrl(personalInfo.value.hero || APP_FALLBACK.heroImage),
);
const hasMore = computed(() => posts.value.length < total.value);
const featuredPost = computed(() => posts.value[0] ?? null);
const regularPosts = computed(() => posts.value.slice(1));
const categoryChips = computed(() => {
  const counts = new Map<string, number>();
  for (const post of posts.value) {
    for (const tag of post.tags ?? []) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => ({ name, count }));
});

async function loadConfig() {
  const [site, personal] = await Promise.allSettled([
    getConfig<SiteInfoConfig>("site_info"),
    getConfig<PersonalInfoConfig>("personal_info"),
  ]);
  if (site.status === "fulfilled") siteInfo.value = site.value;
  if (personal.status === "fulfilled") personalInfo.value = personal.value;
}

async function loadPosts(reset = false) {
  if (loading.value || loadingMore.value) return;
  if (reset) {
    page.value = 1;
    loading.value = true;
    error.value = "";
  } else {
    if (!hasMore.value) return;
    loadingMore.value = true;
  }

  try {
    const currentPage = reset ? 1 : page.value;
    const data = await getPublicPosts({
      page: currentPage,
      pageSize: PAGE_SIZE,
    });
    total.value = data.total ?? 0;
    posts.value = reset
      ? (data.list ?? [])
      : [...posts.value, ...(data.list ?? [])];
    page.value = currentPage + 1;
  } catch (err) {
    error.value = err instanceof Error ? err.message : "文章加载失败";
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
}

async function bootstrap() {
  await Promise.allSettled([loadConfig(), loadPosts(true)]);
}

function openPost(post: PostListItem) {
  openPostDetail(post.slug, "home");
}

onLoad(() => {
  void bootstrap();
});

onShow(() => {
  resetPostNavigationLock();
});

onPullDownRefresh(async () => {
  await bootstrap();
  uni.stopPullDownRefresh();
});

onReachBottom(() => {
  void loadPosts(false);
});
</script>

<template>
  <view class="dream-page page">
    <view class="hero-card">
      <image :src="heroImage" mode="aspectFill" class="hero-image" />
      <view class="hero-soft" />
      <view class="hero-vignette" />

      <view class="hero-top glass-panel">
        <text class="hero-eyebrow">Mobile Journal</text>
        <text class="hero-site">{{ siteTitle }}</text>
      </view>

      <view class="hero-copy">
        <text class="hero-title">{{ heroTitle }}</text>
        <text class="hero-subtitle">{{ heroSubtitle }}</text>
      </view>
    </view>

    <view class="bento-grid">
      <view class="bento-card main porcelain-card">
        <text class="bento-value">{{ total }}</text>
        <text class="bento-label">公开文章</text>
      </view>
      <view class="bento-card porcelain-card">
        <text class="bento-value">{{ categoryChips.length || 1 }}</text>
        <text class="bento-label">主题</text>
      </view>
      <view class="bento-card porcelain-card">
        <text class="bento-value">{{ posts.length }}</text>
        <text class="bento-label">本页</text>
      </view>
    </view>

    <view class="chip-bar glass-panel">
      <view class="home-chip active">
        <image
          src="/static/tab/home-active.png"
          mode="aspectFit"
          class="chip-icon"
        />
        <text>全部</text>
      </view>
      <view v-for="item in categoryChips" :key="item.name" class="home-chip">
        <text class="chip-text">{{ item.name }}</text>
        <text class="chip-count">{{ item.count }}</text>
      </view>
      <view v-if="categoryChips.length === 0" class="home-chip">
        <text class="chip-text">文章</text>
        <text class="chip-count">{{ total }}</text>
      </view>
    </view>

    <StateBlock v-if="loading" title="正在加载" loading />
    <StateBlock v-else-if="error" title="加载失败" :description="error" />

    <view v-else class="content-section">
      <view class="section-head">
        <view class="section-copy">
          <text class="section-kicker">Latest Writing</text>
          <text class="section-title">最近更新</text>
        </view>
        <text class="section-subtitle">内容展示</text>
      </view>

      <view class="post-list">
        <PostCard
          v-if="featuredPost"
          :post="featuredPost"
          featured
          @open="openPost"
        />
        <PostCard
          v-for="post in regularPosts"
          :key="post.uuid || post.slug"
          :post="post"
          @open="openPost"
        />
      </view>

      <StateBlock
        v-if="posts.length === 0"
        title="暂无文章"
        description="发布文章后，首页会自动呈现最新内容。"
      />

      <view v-if="posts.length > 0" class="load-more">
        <text v-if="loadingMore">正在加载更多…</text>
        <text v-else-if="!hasMore">已经读到最后一页</text>
        <text v-else>继续下滑查看更多</text>
      </view>
    </view>
  </view>
</template>

<style scoped>
.page {
  padding-bottom: calc(env(safe-area-inset-bottom) + 40rpx);
}

.hero-card {
  position: relative;
  z-index: 1;
  min-height: 690rpx;
  margin: 0 20rpx 20rpx;
  padding: calc(var(--status-bar-height) + 26rpx) 28rpx 34rpx;
  border-radius: 0 0 46rpx 46rpx;
  overflow: hidden;
  box-shadow: 0 26rpx 68rpx rgba(55, 111, 155, 0.16);
}

.hero-image {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
}

.hero-soft {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background:
    radial-gradient(
      circle at 18% 12%,
      rgba(255, 255, 255, 0.82),
      rgba(255, 255, 255, 0) 300rpx
    ),
    radial-gradient(
      circle at 86% 16%,
      rgba(226, 243, 255, 0.68),
      rgba(226, 243, 255, 0) 320rpx
    ),
    linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.42),
      rgba(38, 56, 77, 0.16) 62%,
      rgba(38, 56, 77, 0.36)
    );
}

.hero-vignette {
  position: absolute;
  left: 18rpx;
  right: 18rpx;
  top: 18rpx;
  bottom: 18rpx;
  border-radius: 34rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.5);
  pointer-events: none;
}

.hero-top {
  position: relative;
  z-index: 1;
  min-height: 86rpx;
  padding: 18rpx 20rpx;
  border-radius: 28rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
}

.hero-eyebrow {
  color: #5ba7f0;
  font-size: 20rpx;
  font-weight: 780;
  letter-spacing: 2rpx;
}

.hero-site {
  max-width: 360rpx;
  color: #26384d;
  font-size: 26rpx;
  font-weight: 760;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hero-copy {
  position: absolute;
  z-index: 1;
  left: 34rpx;
  right: 34rpx;
  bottom: 44rpx;
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.hero-title {
  color: #ffffff;
  font-size: 56rpx;
  line-height: 1.12;
  font-weight: 820;
  letter-spacing: -1.4rpx;
  text-shadow: 0 12rpx 34rpx rgba(38, 56, 77, 0.32);
}

.hero-subtitle {
  max-width: 620rpx;
  color: rgba(255, 255, 255, 0.88);
  font-size: 27rpx;
  line-height: 1.68;
  font-weight: 430;
  text-shadow: 0 8rpx 22rpx rgba(38, 56, 77, 0.26);
}

.bento-grid {
  position: relative;
  z-index: 1;
  margin: -56rpx 20rpx 20rpx;
  display: grid;
  grid-template-columns: 1.24fr 0.88fr 0.88fr;
  gap: 14rpx;
}

.bento-card {
  min-height: 112rpx;
  padding: 20rpx 18rpx;
  border-radius: 30rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8rpx;
}

.bento-card.main {
  background: rgba(255, 255, 255, 0.94);
}

.bento-value {
  color: #26384d;
  font-size: 34rpx;
  line-height: 1;
  font-weight: 820;
  letter-spacing: -0.4rpx;
}

.bento-label {
  color: #7e93a8;
  font-size: 20rpx;
  font-weight: 650;
}

.chip-bar {
  position: relative;
  z-index: 1;
  margin: 0 20rpx 28rpx;
  padding: 14rpx;
  border-radius: 30rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
  overflow-x: auto;
}

.home-chip {
  height: 58rpx;
  padding: 0 20rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.54);
  border: 1rpx solid rgba(255, 255, 255, 0.68);
  display: flex;
  align-items: center;
  gap: 9rpx;
  flex-shrink: 0;
  color: #70879e;
  font-size: 24rpx;
  font-weight: 680;
}

.home-chip.active {
  color: #4f9de3;
  background: rgba(224, 242, 255, 0.86);
}

.chip-icon {
  width: 30rpx;
  height: 30rpx;
}

.chip-count {
  color: #5ba7f0;
  font-size: 21rpx;
  font-weight: 650;
}

.content-section {
  position: relative;
  z-index: 1;
  padding: 0 20rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.section-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 0 8rpx 2rpx;
}

.section-copy {
  display: flex;
  flex-direction: column;
  gap: 7rpx;
}

.section-kicker {
  color: #5ba7f0;
  font-size: 20rpx;
  font-weight: 780;
  letter-spacing: 1.8rpx;
}

.section-title {
  color: #26384d;
  font-size: 37rpx;
  font-weight: 800;
  letter-spacing: -0.6rpx;
}

.section-subtitle {
  color: #8fa5b8;
  font-size: 22rpx;
  font-weight: 540;
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.load-more {
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8aa0b3;
  font-size: 24rpx;
}
</style>
