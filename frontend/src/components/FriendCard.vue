<script setup lang="ts">
import { computed } from "vue";
import type { FriendLinkItem } from "@/types/blog";
import { resolveAssetUrl } from "@/utils/format";

const props = defineProps<{
  item: FriendLinkItem;
}>();

const avatar = computed(() => resolveAssetUrl(props.item.avatarUrl));
const host = computed(() =>
  props.item.url.replace(/^https?:\/\//i, "").replace(/\/$/, ""),
);

function copyUrl() {
  uni.setClipboardData({
    data: props.item.url,
    success: () => {
      uni.showToast({ title: "链接已复制", icon: "success" });
    },
  });
}
</script>

<template>
  <view class="friend-card elevated-press" hover-class="friend-card-hover" @tap="copyUrl">
    <view class="avatar">
      <image v-if="avatar" :src="avatar" mode="aspectFill" class="avatar-img" />
      <text v-else class="avatar-fallback">{{ item.name.slice(0, 1) }}</text>
    </view>

    <view class="body">
      <view class="name-row">
        <view class="name-copy">
          <text class="name">{{ item.name }}</text>
          <text class="host">{{ host }}</text>
        </view>
        <text class="copy">复制</text>
      </view>

      <text class="desc">{{ item.description || "这个站点暂未填写简介。" }}</text>

      <view v-if="item.tags?.length" class="tags">
        <text v-for="tag in item.tags.slice(0, 3)" :key="tag" class="tag">
          {{ tag }}
        </text>
      </view>
    </view>
  </view>
</template>

<style scoped>
.friend-card {
  position: relative;
  padding: 24rpx;
  border-radius: 34rpx;
  background: rgba(255, 255, 255, 0.9);
  border: 1rpx solid rgba(255, 255, 255, 0.88);
  display: flex;
  gap: 20rpx;
  overflow: hidden;
  box-shadow:
    0 20rpx 50rpx rgba(55, 111, 155, 0.11),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.98);
}

.friend-card::after {
  content: "";
  position: absolute;
  right: 22rpx;
  top: 20rpx;
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: rgba(224, 242, 255, 0.42);
  pointer-events: none;
}

.friend-card-hover {
  transform: translateY(2rpx);
  opacity: 0.94;
}

.avatar {
  position: relative;
  z-index: 1;
  width: 94rpx;
  height: 94rpx;
  border-radius: 30rpx;
  overflow: hidden;
  background: linear-gradient(135deg, #FBFDFF, #EAF6FF 58%, #EAF6FF);
  border: 1rpx solid rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 14rpx 30rpx rgba(55, 111, 155, 0.12);
}

.avatar-img {
  width: 100%;
  height: 100%;
}

.avatar-fallback {
  color: #5BA7F0;
  font-size: 36rpx;
  font-weight: 780;
}

.body {
  position: relative;
  z-index: 1;
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.name-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
}

.name-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 5rpx;
}

.name {
  color: #26384D;
  font-size: 31rpx;
  line-height: 1.35;
  font-weight: 780;
}

.host {
  max-width: 320rpx;
  color: #7E93A8;
  font-size: 21rpx;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.copy {
  height: 40rpx;
  padding: 0 15rpx;
  border-radius: 999rpx;
  background: rgba(224, 242, 255, 0.86);
  color: #4F9DE3;
  font-size: 20rpx;
  line-height: 40rpx;
  font-weight: 760;
  flex-shrink: 0;
}

.desc {
  color: #62788F;
  font-size: 24rpx;
  line-height: 1.62;
  background: rgba(255, 255, 255, 0.52);
  border: 1rpx solid rgba(255, 255, 255, 0.66);
  border-radius: 20rpx;
  padding: 14rpx 16rpx;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}

.tag {
  padding: 7rpx 13rpx;
  border-radius: 999rpx;
  color: #5B84A5;
  background: rgba(224, 242, 255, 0.72);
  font-size: 20rpx;
  font-weight: 650;
}
</style>
