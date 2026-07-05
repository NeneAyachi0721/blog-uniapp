<script setup lang="ts">
import { onHide, onLaunch, onShow } from "@dcloudio/uni-app";

onLaunch(() => {});
onShow(() => {});
onHide(() => {});
</script>

<style>
page {
  min-height: 100%;
  background: #F3F8FF;
  color: #26384D;
  font-family:
    "SF Pro Display",
    "SF Pro Text",
    Inter,
    Roboto,
    "PingFang SC",
    "HarmonyOS Sans SC",
    MiSans,
    "Noto Sans SC",
    "Microsoft YaHei",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
  font-variant-numeric: tabular-nums;
  -webkit-font-smoothing: antialiased;
}

view,
text,
button,
input,
textarea,
image {
  box-sizing: border-box;
}

button {
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  line-height: 1;
  font-family: inherit;
}

button::after {
  border: 0;
}

input,
textarea {
  font-family: inherit;
}

.dream-page,
.premium-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(circle at 14% 2%, rgba(216, 237, 255, 0.68) 0, rgba(216, 237, 255, 0) 360rpx),
    radial-gradient(circle at 92% 10%, rgba(229, 244, 255, 0.56) 0, rgba(229, 244, 255, 0) 330rpx),
    radial-gradient(circle at 50% 100%, rgba(222, 242, 255, 0.54) 0, rgba(222, 242, 255, 0) 520rpx),
    linear-gradient(180deg, #FBFDFF 0%, #F7FBFF 46%, #EAF6FF 100%);
}

.dream-page::before,
.premium-page::before {
  content: "";
  position: absolute;
  left: -180rpx;
  right: -180rpx;
  top: -280rpx;
  height: 610rpx;
  border-radius: 0 0 50% 50%;
  background:
    radial-gradient(circle at 36% 60%, rgba(255, 255, 255, 0.78), rgba(255, 255, 255, 0) 280rpx),
    linear-gradient(135deg, rgba(91, 167, 240, 0.18), rgba(255, 255, 255, 0));
  pointer-events: none;
}

.dream-page::after,
.premium-page::after {
  content: "";
  position: absolute;
  right: -90rpx;
  top: 360rpx;
  width: 280rpx;
  height: 280rpx;
  border-radius: 50%;
  background: rgba(229, 244, 255, 0.46);
  filter: blur(2rpx);
  pointer-events: none;
}

.porcelain-card {
  background: rgba(255, 255, 255, 0.88);
  border: 1rpx solid rgba(255, 255, 255, 0.86);
  box-shadow:
    0 22rpx 58rpx rgba(55, 111, 155, 0.12),
    0 4rpx 18rpx rgba(255, 255, 255, 0.72) inset,
    0 -1rpx 0 rgba(91, 132, 165, 0.08) inset;
  -webkit-backdrop-filter: blur(22rpx);
  backdrop-filter: blur(22rpx);
}

.glass-panel {
  background: rgba(255, 255, 255, 0.46);
  border: 1rpx solid rgba(255, 255, 255, 0.68);
  box-shadow: 0 16rpx 42rpx rgba(55, 111, 155, 0.10);
  -webkit-backdrop-filter: blur(20rpx);
  backdrop-filter: blur(20rpx);
}

.elevated-press {
  transition: transform 0.18s ease, opacity 0.18s ease;
}

.elevated-press:active {
  transform: translateY(2rpx) scale(0.995);
  opacity: 0.92;
}
</style>
