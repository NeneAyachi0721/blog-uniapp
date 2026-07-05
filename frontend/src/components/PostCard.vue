<script setup lang="ts">
import { computed } from "vue";
import type { PostListItem } from "@/types/blog";
import {
  compactNumber,
  formatDate,
  postExcerpt,
  resolveAssetUrl,
} from "@/utils/format";

const props = defineProps<{
  post: PostListItem;
  featured?: boolean;
}>();

const emit = defineEmits<{
  open: [post: PostListItem];
}>();

const cover = computed(() => resolveAssetUrl(props.post.coverImage));
const excerpt = computed(() => postExcerpt(props.post));
const date = computed(() => formatDate(props.post.publishedAt));
const pinned = computed(() => Boolean(props.post.pinnedAt));
const words = computed(() => compactNumber(props.post.contentText?.length ?? 0));
const category = computed(() => props.post.tags?.[0] || "Essay");
</script>

<template>
  <view
    class="post-card elevated-press"
    :class="{ featured: featured || pinned }"
    hover-class="post-card-hover"
    @tap="emit('open', post)"
  >
    <view v-if="cover && featured" class="cover-shell">
      <image :src="cover" mode="aspectFill" class="cover" />
      <view class="cover-mask" />
      <view v-if="pinned" class="pin">置顶</view>
    </view>

    <view class="content">
      <view class="topline">
        <text class="category">{{ category }}</text>
        <text class="date">{{ date }}</text>
      </view>

      <view class="title-row">
        <text class="title">{{ post.title || "未命名文章" }}</text>
        <view class="arrow"><text>›</text></view>
      </view>

      <text v-if="excerpt" class="excerpt">{{ excerpt }}</text>

      <view class="meta-row">
        <view class="meta-pill">
          <text class="meta-dot" />
          <text>{{ words }} 字</text>
        </view>
        <view class="meta-pill">
          <text class="meta-dot blush" />
          <text>{{ compactNumber(post.viewCount) }} 阅读</text>
        </view>
      </view>

      <view v-if="post.tags?.length" class="tags">
        <text v-for="tag in post.tags.slice(0, 4)" :key="tag" class="tag">
          {{ tag }}
        </text>
      </view>
    </view>
  </view>
</template>

<style scoped>
.post-card {
  position: relative;
  overflow: hidden;
  border-radius: 34rpx;
  background: rgba(255, 255, 255, 0.9);
  border: 1rpx solid rgba(255, 255, 255, 0.9);
  box-shadow:
    0 20rpx 54rpx rgba(55, 111, 155, 0.12),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.98);
}

.post-card::before {
  content: "";
  position: absolute;
  left: 22rpx;
  top: 22rpx;
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: rgba(224, 242, 255, 0.38);
  filter: blur(2rpx);
  pointer-events: none;
}

.post-card::after {
  content: "";
  position: absolute;
  right: 0;
  top: 0;
  width: 180rpx;
  height: 180rpx;
  border-radius: 0 34rpx 0 100%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.74), rgba(224, 242, 255, 0.22));
  pointer-events: none;
}

.post-card-hover {
  transform: translateY(2rpx);
  opacity: 0.94;
}

.post-card.featured {
  border-radius: 38rpx;
}

.cover-shell {
  position: relative;
  height: 350rpx;
  margin: 22rpx 22rpx 0;
  border-radius: 30rpx;
  overflow: hidden;
  background: linear-gradient(135deg, #F5FAFF, #EEF8FF);
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
  bottom: 0;
  height: 180rpx;
  background: linear-gradient(180deg, rgba(38, 56, 77, 0), rgba(38, 56, 77, 0.32));
}

.pin {
  position: absolute;
  left: 20rpx;
  top: 20rpx;
  height: 44rpx;
  padding: 0 18rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.94);
  color: #5BA7F0;
  font-size: 21rpx;
  line-height: 44rpx;
  font-weight: 760;
  box-shadow: 0 10rpx 24rpx rgba(55, 111, 155, 0.12);
}

.content {
  position: relative;
  z-index: 1;
  padding: 32rpx 30rpx 30rpx;
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.category {
  max-width: 292rpx;
  padding: 9rpx 17rpx;
  border-radius: 999rpx;
  background: rgba(224, 242, 255, 0.78);
  color: #4F9DE3;
  font-size: 21rpx;
  line-height: 1;
  font-weight: 760;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.date {
  color: #8AA0B3;
  font-size: 22rpx;
  font-weight: 560;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.title {
  flex: 1;
  min-width: 0;
  color: #26384D;
  font-size: 37rpx;
  line-height: 1.34;
  font-weight: 780;
  letter-spacing: -0.4rpx;
}

.featured .title {
  font-size: 41rpx;
}

.arrow {
  width: 52rpx;
  height: 52rpx;
  border-radius: 18rpx;
  background: rgba(255, 255, 255, 0.62);
  border: 1rpx solid rgba(255, 255, 255, 0.78);
  color: #5BA7F0;
  font-size: 42rpx;
  line-height: 48rpx;
  font-weight: 760;
  text-align: center;
  flex-shrink: 0;
}

.excerpt {
  color: #62788F;
  font-size: 26rpx;
  line-height: 1.7;
  font-weight: 420;
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.meta-pill {
  height: 42rpx;
  padding: 0 15rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.56);
  color: #8AA0B3;
  font-size: 21rpx;
  line-height: 1;
  display: flex;
  align-items: center;
  gap: 8rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.72);
}

.meta-dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: #5BA7F0;
  opacity: 0.76;
}

.meta-dot.blush {
  background: #B9DFFF;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.tag {
  max-width: 188rpx;
  padding: 8rpx 14rpx;
  border-radius: 999rpx;
  background: rgba(224, 242, 255, 0.72);
  color: #5B84A5;
  font-size: 22rpx;
  font-weight: 640;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
