<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad, onPullDownRefresh, onShow } from "@dcloudio/uni-app";
import MiniHeader from "@/components/MiniHeader.vue";
import StateBlock from "@/components/StateBlock.vue";
import { getArchivePosts } from "@/services/posts";
import type { ArchivePost } from "@/types/blog";
import { formatMonthDay, getYear } from "@/utils/format";
import { openPostDetail, resetPostNavigationLock } from "@/utils/navigation";

interface YearGroup {
  year: number;
  posts: ArchivePost[];
}

const loading = ref(false);
const error = ref("");
const list = ref<ArchivePost[]>([]);

const groups = computed<YearGroup[]>(() => {
  const map = new Map<number, ArchivePost[]>();
  for (const post of list.value) {
    const year = getYear(post.publishedAt);
    const bucket = map.get(year) ?? [];
    bucket.push(post);
    map.set(year, bucket);
  }

  return Array.from(map.entries())
    .map(([year, posts]) => ({ year, posts }))
    .sort((a, b) => b.year - a.year);
});

const latestYear = computed(() => groups.value[0]?.year || "--");

async function fetchArchive() {
  loading.value = true;
  error.value = "";
  try {
    const data = await getArchivePosts();
    list.value = data.list ?? [];
  } catch (err) {
    error.value = err instanceof Error ? err.message : "归档加载失败";
  } finally {
    loading.value = false;
  }
}

function openPost(post: ArchivePost) {
  openPostDetail(post.slug, "archive");
}

onLoad(() => {
  void fetchArchive();
});

onShow(() => {
  resetPostNavigationLock();
});

onPullDownRefresh(async () => {
  await fetchArchive();
  uni.stopPullDownRefresh();
});
</script>

<template>
  <view class="dream-page page">
    <MiniHeader
      eyebrow="Archive"
      title="文章归档"
      subtitle="按时间浏览所有公开文章。"
    />

    <view class="summary-card porcelain-card">
      <view class="summary-icon">
        <image src="/static/tab/archive-active.png" mode="aspectFit" />
      </view>
      <view class="summary-pill active">
        <text class="summary-value">{{ list.length }}</text>
        <text class="summary-label">全部文章</text>
      </view>
      <view class="summary-pill">
        <text class="summary-value">{{ groups.length }}</text>
        <text class="summary-label">年份</text>
      </view>
      <view class="summary-pill">
        <text class="summary-value">{{ latestYear }}</text>
        <text class="summary-label">最近更新</text>
      </view>
    </view>

    <StateBlock v-if="loading" title="正在整理时间线" loading />
    <StateBlock v-else-if="error" title="加载失败" :description="error" />
    <StateBlock
      v-else-if="groups.length === 0"
      title="暂无归档"
      description="发布文章后，这里会自动生成时间线。"
    />

    <view v-else class="timeline-card porcelain-card">
      <view v-for="group in groups" :key="group.year" class="year-group">
        <view class="year-side">
          <text class="year">{{ group.year || "未发布" }}</text>
          <text class="year-count">{{ group.posts.length }} 篇文章</text>
        </view>

        <view class="year-list">
          <view
            v-for="post in group.posts"
            :key="`${post.slug}-${post.title}`"
            class="archive-row elevated-press"
            hover-class="archive-row-hover"
            @tap="openPost(post)"
          >
            <view class="date-col">
              <text>{{ formatMonthDay(post.publishedAt) }}</text>
            </view>
            <view class="line-col">
              <view class="node" />
            </view>
            <view class="row-copy">
              <text class="post-title">{{ post.title || "未命名文章" }}</text>
              <text v-if="post.tags?.length" class="tag">{{
                post.tags[0]
              }}</text>
            </view>
            <view class="chevron"><text>›</text></view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.page {
  padding-bottom: calc(env(safe-area-inset-bottom) + 38rpx);
}

.summary-card {
  position: relative;
  z-index: 1;
  margin: 0 20rpx 26rpx;
  padding: 16rpx;
  min-height: 96rpx;
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
  overflow-x: auto;
}

.summary-icon {
  width: 62rpx;
  height: 62rpx;
  border-radius: 20rpx;
  background: rgba(224, 242, 255, 0.86);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.summary-icon image {
  width: 32rpx;
  height: 32rpx;
}

.summary-pill {
  min-width: 150rpx;
  height: 68rpx;
  padding: 0 20rpx;
  border-radius: 22rpx;
  background: rgba(255, 255, 255, 0.48);
  border: 1rpx solid rgba(255, 255, 255, 0.62);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 6rpx;
  flex-shrink: 0;
}

.summary-pill.active {
  background: linear-gradient(135deg, #86c7ff, #b9dfff);
  box-shadow: 0 14rpx 28rpx rgba(80, 150, 208, 0.14);
}

.summary-value {
  color: #26384d;
  font-size: 25rpx;
  line-height: 1;
  font-weight: 800;
}

.summary-label {
  color: #7e93a8;
  font-size: 19rpx;
  line-height: 1;
  font-weight: 620;
}

.summary-pill.active .summary-value,
.summary-pill.active .summary-label {
  color: #ffffff;
}

.timeline-card {
  position: relative;
  z-index: 1;
  margin: 0 20rpx;
  padding: 38rpx 28rpx 28rpx;
  border-radius: 36rpx;
}

.year-group {
  display: grid;
  grid-template-columns: 112rpx 1fr;
  column-gap: 8rpx;
}

.year-group + .year-group {
  margin-top: 40rpx;
}

.year-side {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  align-items: flex-start;
}

.year {
  color: #26384d;
  font-size: 38rpx;
  line-height: 1;
  font-weight: 820;
  letter-spacing: -0.5rpx;
}

.year-count {
  color: #8fa5b8;
  font-size: 22rpx;
  line-height: 1.3;
  font-weight: 640;
}

.year-list {
  position: relative;
  display: flex;
  flex-direction: column;
}

.year-list::before {
  content: "";
  position: absolute;
  left: 39rpx;
  top: 30rpx;
  bottom: 30rpx;
  width: 2rpx;
  background: linear-gradient(
    180deg,
    rgba(91, 167, 240, 0.22),
    rgba(91, 132, 165, 0.08)
  );
}

.archive-row {
  position: relative;
  min-height: 150rpx;
  display: grid;
  grid-template-columns: 82rpx 46rpx 1fr 46rpx;
  align-items: center;
  column-gap: 10rpx;
}

.archive-row-hover {
  opacity: 0.9;
}

.date-col {
  color: #8fa5b8;
  font-size: 24rpx;
  font-weight: 640;
}

.line-col {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.node {
  width: 17rpx;
  height: 17rpx;
  border-radius: 50%;
  background: #86c7ff;
  box-shadow:
    0 0 0 8rpx #fbfdff,
    0 0 0 14rpx rgba(91, 167, 240, 0.1);
}

.row-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 9rpx;
}

.post-title {
  color: #26384d;
  font-size: 31rpx;
  line-height: 1.42;
  font-weight: 760;
}

.tag {
  align-self: flex-start;
  max-width: 210rpx;
  padding: 7rpx 13rpx;
  border-radius: 999rpx;
  background: rgba(224, 242, 255, 0.72);
  color: #5b84a5;
  font-size: 20rpx;
  font-weight: 650;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chevron {
  width: 46rpx;
  height: 46rpx;
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.5);
  color: #5ba7f0;
  font-size: 38rpx;
  line-height: 42rpx;
  font-weight: 760;
  text-align: center;
}
</style>
