<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad, onShareAppMessage } from "@dcloudio/uni-app";
import MiniHeader from "@/components/MiniHeader.vue";
import StateBlock from "@/components/StateBlock.vue";
import { getPostBySlug } from "@/services/posts";
import type { PublicPostDetail } from "@/types/blog";
import { compactNumber, formatDate, resolveAssetUrl } from "@/utils/format";
import { getSourceTabUrl } from "@/utils/navigation";
import { toRichTextNodes } from "@/utils/content";

const slug = ref("");
const origin = ref("home");
const post = ref<PublicPostDetail | null>(null);
const loading = ref(false);
const error = ref("");

const cover = computed(() => resolveAssetUrl(post.value?.coverImage));
const date = computed(() => formatDate(post.value?.publishedAt));
const words = computed(() => compactNumber(post.value?.wordCount ?? 0));
const views = computed(() => compactNumber(post.value?.viewCount ?? 0));
const richNodes = computed(() => toRichTextNodes(post.value?.content));
const primaryTag = computed(() => post.value?.tags?.[0] || "Essay");

async function fetchPost() {
  if (!slug.value) {
    error.value = "文章地址不完整";
    return;
  }

  loading.value = true;
  error.value = "";
  try {
    const data = await getPostBySlug(slug.value);
    post.value = data.post;
  } catch (err) {
    error.value = err instanceof Error ? err.message : "文章加载失败";
  } finally {
    loading.value = false;
  }
}

function back() {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack();
    return;
  }
  uni.switchTab({ url: getSourceTabUrl(origin.value) });
}

onLoad((query) => {
  slug.value = decodeURIComponent(String(query?.slug ?? ""));
  origin.value = String(query?.from ?? "home");
  void fetchPost();
});

onShareAppMessage(() => ({
  title: post.value?.title || "分享文章",
  path: `/pages/post/detail?slug=${encodeURIComponent(slug.value)}`,
}));
</script>

<template>
  <view class="dream-page page">
    <MiniHeader
      eyebrow="Reading"
      title="阅读文章"
      subtitle="完整阅读当前文章。"
      show-back
      compact
      @back="back"
    />

    <StateBlock v-if="loading" title="正在打开文章" loading />
    <StateBlock v-else-if="error" title="打开失败" :description="error" />

    <view v-else-if="post" class="article porcelain-card">
      <view class="article-head">
        <view class="article-chip">
          <text>{{ date }}</text>
        </view>

        <text class="title">{{ post.title || "未命名文章" }}</text>

        <view class="meta">
          <text>{{ words }} 字</text>
          <text class="dot" />
          <text>{{ views }} 阅读</text>
        </view>

        <view v-if="post.tags?.length" class="tags">
          <text v-for="tag in post.tags" :key="tag" class="tag">
            {{ tag }}
          </text>
        </view>
      </view>

      <view class="article-body">
        <view v-if="cover" class="content-cover-panel">
          <image :src="cover" mode="aspectFill" class="cover" />
          <view class="cover-mask" />
          <text class="cover-tag">{{ primaryTag }}</text>
        </view>

        <rich-text :nodes="richNodes" />
      </view>
    </view>
  </view>
</template>

<style scoped>
.page {
  padding-bottom: calc(env(safe-area-inset-bottom) + 38rpx);
}

.article {
  position: relative;
  z-index: 1;
  margin: 0 20rpx;
  border-radius: 38rpx;
  overflow: hidden;
}

.article::before {
  content: "";
  position: absolute;
  right: -48rpx;
  top: 280rpx;
  width: 180rpx;
  height: 180rpx;
  border-radius: 50%;
  background: rgba(224, 242, 255, 0.38);
  pointer-events: none;
}

.article-head {
  position: relative;
  z-index: 1;
  padding: 38rpx 32rpx 30rpx;
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.article-chip {
  align-self: flex-start;
  height: 44rpx;
  padding: 0 17rpx;
  border-radius: 999rpx;
  background: rgba(224, 242, 255, 0.86);
  color: #4f9de3;
  font-size: 22rpx;
  line-height: 44rpx;
  font-weight: 760;
}

.title {
  color: #26384d;
  font-size: 47rpx;
  line-height: 1.26;
  font-weight: 820;
  letter-spacing: -0.9rpx;
}

.meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 13rpx;
  color: #7e93a8;
  font-size: 23rpx;
  font-weight: 560;
}

.dot {
  width: 6rpx;
  height: 6rpx;
  border-radius: 50%;
  background: #b9dfff;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.tag {
  padding: 8rpx 14rpx;
  border-radius: 999rpx;
  background: rgba(224, 242, 255, 0.72);
  color: #5b84a5;
  font-size: 22rpx;
  font-weight: 650;
}

.article-body {
  position: relative;
  z-index: 1;
  padding: 0 32rpx 48rpx;
  color: #31455a;
  font-size: 29rpx;
  line-height: 1.86;
}

.content-cover-panel {
  position: relative;
  height: 430rpx;
  margin: 4rpx 0 36rpx;
  border-radius: 32rpx;
  overflow: hidden;
  background: linear-gradient(135deg, #f5faff, #eef8ff);
}

.cover {
  width: 100%;
  height: 100%;
  display: block;
}

.cover-mask {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background:
    radial-gradient(
      circle at 20% 0%,
      rgba(255, 255, 255, 0.38),
      rgba(255, 255, 255, 0) 260rpx
    ),
    linear-gradient(
      180deg,
      rgba(38, 56, 77, 0) 48%,
      rgba(38, 56, 77, 0.34) 100%
    );
}

.cover-tag {
  position: absolute;
  left: 22rpx;
  bottom: 22rpx;
  height: 46rpx;
  padding: 0 18rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.94);
  color: #4f9de3;
  font-size: 22rpx;
  line-height: 46rpx;
  font-weight: 760;
  box-shadow: 0 10rpx 24rpx rgba(55, 111, 155, 0.13);
}
</style>
