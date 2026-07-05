<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string;
    description?: string;
    loading?: boolean;
  }>(),
  {
    title: "暂无内容",
    description: "稍后再回来看看。",
    loading: false,
  },
);
</script>

<template>
  <view class="state porcelain-card">
    <view class="orb" :class="{ loading }">
      <view class="orb-inner" />
    </view>
    <text class="title">{{ title }}</text>
    <text v-if="description && !loading" class="description">{{ description }}</text>
    <text v-if="loading" class="description">正在整理内容，请稍候。</text>
  </view>
</template>

<style scoped>
.state {
  position: relative;
  z-index: 1;
  margin: 0 20rpx;
  padding: 46rpx 34rpx;
  border-radius: 34rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 18rpx;
  overflow: hidden;
}

.state::before {
  content: "";
  position: absolute;
  left: 44rpx;
  top: 28rpx;
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: rgba(225, 242, 255, 0.36);
  filter: blur(4rpx);
  pointer-events: none;
}

.orb {
  width: 78rpx;
  height: 78rpx;
  border-radius: 50%;
  padding: 10rpx;
  background: linear-gradient(135deg, rgba(91, 167, 240, 0.14), rgba(225, 242, 255, 0.30));
  box-shadow: 0 18rpx 34rpx rgba(66, 128, 176, 0.12);
}

.orb-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #ffffff, #EAF6FF 52%, #E4F3FF);
}

.loading {
  animation: breathe 1.35s ease-in-out infinite;
}

.title {
  color: #26384D;
  font-size: 30rpx;
  font-weight: 760;
  line-height: 1.35;
  text-align: center;
}

.description {
  max-width: 520rpx;
  color: #7E93A8;
  font-size: 24rpx;
  line-height: 1.58;
  text-align: center;
}

@keyframes breathe {
  0%,
  100% {
    transform: scale(0.96);
    opacity: 0.72;
  }
  50% {
    transform: scale(1.04);
    opacity: 1;
  }
}
</style>
