<!-- src/components/base/slider/ColorSlider.vue -->
<script setup lang="ts">
const model = defineModel<number>({ default: 250 });
</script>

<template>
  <!-- 颜色滑动条 -->
  <input
    type="range"
    v-model.number="model"
    min="0"
    max="360"
    class="w-full h-3 rounded-full appearance-none cursor-pointer outline-none"
    style="
      background: linear-gradient(
        to right,
        oklch(0.82 0.08 0),
        oklch(0.82 0.08 45),
        oklch(0.82 0.08 90),
        oklch(0.82 0.08 135),
        oklch(0.82 0.08 180),
        oklch(0.82 0.08 225),
        oklch(0.82 0.08 270),
        oklch(0.82 0.08 315),
        oklch(0.82 0.08 360)
      );
    "
  />
</template>

<style scoped>
/* 轨道样式 */
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 12px;
  border-radius: 4px;
  outline: none;
}

/* WebKit 滑块（竖线样式） */
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 6px;
  /* 竖线宽度 */
  height: 24px;
  /* 竖线高度 */
  border-radius: 2px;
  background: #ffffff;
  border: 1px solid rgb(226 232 240);
  box-shadow: 0 2px 8px rgba(59, 92, 122, 0.18);
  cursor: pointer;
  transition: all 0.2s ease;
}

/* 滑块悬停/选中状态 */
input[type="range"]::-webkit-slider-thumb:hover,
input[type="range"]:active::-webkit-slider-thumb {
  transform: scale(1.2);
  /* 放大效果 */
  box-shadow: 0 3px 10px rgba(59, 92, 122, 0.22);
  height: 28px;
  /* 稍微变长 */
}

/* Firefox 兼容 */
input[type="range"]::-moz-range-thumb {
  width: 6px;
  height: 24px;
  border-radius: 2px;
  background: #ffffff;
  border: 1px solid rgb(226 232 240);
  box-shadow: 0 2px 8px rgba(59, 92, 122, 0.18);
  cursor: pointer;
  transition: all 0.2s ease;
}

input[type="range"]::-moz-range-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 3px 10px rgba(59, 92, 122, 0.22);
}
</style>
