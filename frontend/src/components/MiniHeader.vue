<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    eyebrow?: string;
    title: string;
    subtitle?: string;
    showBack?: boolean;
    compact?: boolean;
  }>(),
  {
    eyebrow: "",
    subtitle: "",
    showBack: false,
    compact: false,
  },
);

const emit = defineEmits<{
  back: [];
}>();
</script>

<template>
  <view class="mini-header" :class="{ compact: props.compact }">
    <view v-if="props.showBack" class="back-button elevated-press" @tap="emit('back')">
      <view class="back-icon" />
    </view>

    <view class="copy" :class="{ 'copy-with-back': props.showBack }">
      <text v-if="props.eyebrow" class="eyebrow">{{ props.eyebrow }}</text>
      <text class="title">{{ props.title }}</text>
      <text v-if="props.subtitle" class="subtitle">{{ props.subtitle }}</text>
    </view>
  </view>
</template>

<style scoped>
.mini-header {
  position: relative;
  z-index: 1;
  padding: calc(var(--status-bar-height) + 36rpx) 34rpx 30rpx;
  overflow: hidden;
}

.mini-header.compact {
  padding-bottom: 18rpx;
}

.copy {
  position: relative;
  z-index: 1;
  min-height: 118rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12rpx;
}

.copy-with-back {
  padding-left: 84rpx;
}

.eyebrow {
  align-self: flex-start;
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.6);
  color: #5BA7F0;
  font-size: 20rpx;
  line-height: 1;
  font-weight: 760;
  letter-spacing: 2.2rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.72);
  box-shadow: 0 10rpx 24rpx rgba(66, 128, 176, 0.08);
}

.title {
  max-width: 590rpx;
  color: #26384D;
  font-size: 45rpx;
  line-height: 1.16;
  font-weight: 780;
  letter-spacing: -0.8rpx;
}

.subtitle {
  max-width: 640rpx;
  color: #70879E;
  font-size: 25rpx;
  line-height: 1.62;
  font-weight: 420;
}

.back-button {
  position: absolute;
  z-index: 2;
  left: 34rpx;
  bottom: 47rpx;
  width: 66rpx;
  height: 66rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.9);
  border: 1rpx solid rgba(255, 255, 255, 0.9);
  box-shadow:
    0 16rpx 34rpx rgba(55, 111, 155, 0.12),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.98);
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  width: 18rpx;
  height: 18rpx;
  border-left: 4rpx solid #5BA7F0;
  border-bottom: 4rpx solid #5BA7F0;
  transform: rotate(45deg);
  margin-left: 7rpx;
}
</style>
