<script setup lang="ts">
import { reactive, ref } from "vue";
import { onLoad, onPullDownRefresh } from "@dcloudio/uni-app";
import FriendCard from "@/components/FriendCard.vue";
import MiniHeader from "@/components/MiniHeader.vue";
import StateBlock from "@/components/StateBlock.vue";
import { applyFriendLink, getApprovedFriends } from "@/services/friends";
import type { FriendLinkItem } from "@/types/blog";
import { splitTags } from "@/utils/format";

const loading = ref(false);
const submitting = ref(false);
const error = ref("");
const links = ref<FriendLinkItem[]>([]);

const form = reactive({
  name: "",
  url: "",
  avatarUrl: "",
  description: "",
  tags: "",
  applicantEmail: "",
});

async function fetchLinks() {
  loading.value = true;
  error.value = "";
  try {
    const data = await getApprovedFriends();
    links.value = data.list ?? [];
  } catch (err) {
    error.value = err instanceof Error ? err.message : "友链加载失败";
  } finally {
    loading.value = false;
  }
}

function isUrl(value: string) {
  return /^https?:\/\/.+/i.test(value.trim());
}

function isEmail(value: string) {
  return !value.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function resetForm() {
  form.name = "";
  form.url = "";
  form.avatarUrl = "";
  form.description = "";
  form.tags = "";
  form.applicantEmail = "";
}

async function submitApply() {
  if (!form.name.trim()) {
    uni.showToast({ title: "请填写站点名称", icon: "none" });
    return;
  }
  if (!isUrl(form.url)) {
    uni.showToast({ title: "站点地址需以 http(s) 开头", icon: "none" });
    return;
  }
  if (form.avatarUrl.trim() && !isUrl(form.avatarUrl)) {
    uni.showToast({ title: "头像地址需以 http(s) 开头", icon: "none" });
    return;
  }
  if (!isEmail(form.applicantEmail)) {
    uni.showToast({ title: "邮箱格式不正确", icon: "none" });
    return;
  }

  submitting.value = true;
  try {
    await applyFriendLink({
      name: form.name.trim(),
      url: form.url.trim(),
      avatarUrl: form.avatarUrl.trim() || undefined,
      description: form.description.trim() || undefined,
      tags: splitTags(form.tags),
      applicantEmail: form.applicantEmail.trim() || undefined,
    });
    uni.showToast({ title: "申请已提交", icon: "success" });
    resetForm();
  } catch (err) {
    uni.showToast({
      title: err instanceof Error ? err.message : "提交失败",
      icon: "none",
    });
  } finally {
    submitting.value = false;
  }
}

onLoad(() => {
  void fetchLinks();
});

onPullDownRefresh(async () => {
  await fetchLinks();
  uni.stopPullDownRefresh();
});
</script>

<template>
  <view class="dream-page page">
    <MiniHeader
      eyebrow="Links"
      title="友谊链接"
      subtitle="发现更多优秀网站。"
    />

    <view class="intro-panel porcelain-card">
      <view class="intro-main">
        <text class="intro-kicker">Directory</text>
        <text class="intro-title">已收录 {{ links.length }} 个站点</text>
        <text class="intro-desc"
          >点击卡片即可复制链接；也欢迎提交你的站点信息。</text
        >
      </view>
      <view class="intro-badge">
        <image src="/static/tab/friends-active.png" mode="aspectFit" />
      </view>
    </view>

    <StateBlock v-if="loading" title="正在读取友链" loading />
    <StateBlock v-else-if="error" title="加载失败" :description="error" />

    <view v-else class="links">
      <FriendCard v-for="item in links" :key="item.uuid" :item="item" />
      <StateBlock
        v-if="links.length === 0"
        title="暂无友链"
        description="通过下方表单提交第一个站点，审核通过后会展示在这里。"
      />
    </view>

    <view class="apply-panel porcelain-card">
      <view class="panel-head">
        <text class="panel-kicker">Submission</text>
        <text class="panel-title">申请友链</text>
        <text class="panel-subtitle"
          >请填写可访问的站点地址，最多提交 3 个标签。</text
        >
      </view>

      <view class="form">
        <view class="field">
          <text class="label">站点名称</text>
          <input
            v-model="form.name"
            class="input"
            maxlength="64"
            placeholder="例如：Mobile Journal"
            placeholder-class="placeholder"
          />
        </view>
        <view class="field">
          <text class="label">站点地址</text>
          <input
            v-model="form.url"
            class="input"
            placeholder="https://example.com"
            placeholder-class="placeholder"
          />
        </view>
        <view class="field">
          <text class="label">头像 URL</text>
          <input
            v-model="form.avatarUrl"
            class="input"
            placeholder="可选，https://..."
            placeholder-class="placeholder"
          />
        </view>
        <view class="field">
          <text class="label">站点简介</text>
          <textarea
            v-model="form.description"
            class="textarea"
            maxlength="200"
            placeholder="用一句话介绍你的站点定位"
            placeholder-class="placeholder"
          />
        </view>
        <view class="field">
          <text class="label">标签</text>
          <input
            v-model="form.tags"
            class="input"
            placeholder="计算机, 游戏, ACG"
            placeholder-class="placeholder"
          />
        </view>
        <view class="field">
          <text class="label">联系邮箱</text>
          <input
            v-model="form.applicantEmail"
            class="input"
            placeholder="可选，用于接收审核结果"
            placeholder-class="placeholder"
          />
        </view>
      </view>

      <button
        class="submit elevated-press"
        :disabled="submitting"
        @tap="submitApply"
      >
        {{ submitting ? "正在提交…" : "提交申请" }}
      </button>
    </view>
  </view>
</template>

<style scoped>
.page {
  padding-bottom: calc(env(safe-area-inset-bottom) + 40rpx);
}

.intro-panel {
  position: relative;
  z-index: 1;
  margin: 0 20rpx 24rpx;
  padding: 32rpx;
  border-radius: 38rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
  overflow: hidden;
}

.intro-panel::before {
  content: "";
  position: absolute;
  right: -30rpx;
  top: -42rpx;
  width: 210rpx;
  height: 210rpx;
  border-radius: 50%;
  background: rgba(224, 242, 255, 0.5);
}

.intro-panel::after {
  content: "";
  position: absolute;
  left: 28rpx;
  bottom: -50rpx;
  width: 210rpx;
  height: 140rpx;
  border-radius: 50%;
  background: rgba(224, 242, 255, 0.52);
}

.intro-main {
  position: relative;
  z-index: 1;
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.intro-kicker {
  color: #5ba7f0;
  font-size: 19rpx;
  font-weight: 780;
  letter-spacing: 2rpx;
}

.intro-title {
  color: #26384d;
  font-size: 37rpx;
  line-height: 1.32;
  font-weight: 820;
  letter-spacing: -0.5rpx;
}

.intro-desc {
  color: #62788f;
  font-size: 25rpx;
  line-height: 1.62;
}

.intro-badge {
  position: relative;
  z-index: 1;
  width: 92rpx;
  height: 92rpx;
  border-radius: 30rpx;
  background: rgba(255, 255, 255, 0.68);
  border: 1rpx solid rgba(255, 255, 255, 0.72);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 14rpx 30rpx rgba(55, 111, 155, 0.12);
}

.intro-badge image {
  width: 44rpx;
  height: 44rpx;
}

.links {
  position: relative;
  z-index: 1;
  padding: 0 20rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.apply-panel {
  position: relative;
  z-index: 1;
  margin: 28rpx 20rpx 0;
  padding: 32rpx;
  border-radius: 38rpx;
}

.panel-head {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  margin-bottom: 26rpx;
}

.panel-kicker {
  color: #5ba7f0;
  font-size: 20rpx;
  font-weight: 780;
  letter-spacing: 1.8rpx;
}

.panel-title {
  color: #26384d;
  font-size: 37rpx;
  font-weight: 820;
  letter-spacing: -0.5rpx;
}

.panel-subtitle {
  color: #7e93a8;
  font-size: 23rpx;
  line-height: 1.55;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.label {
  color: #31455a;
  font-size: 24rpx;
  font-weight: 700;
}

.input,
.textarea {
  width: 100%;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.55);
  border: 1rpx solid rgba(255, 255, 255, 0.72);
  color: #26384d;
  font-size: 26rpx;
  padding: 20rpx 22rpx;
  box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, 0.88);
}

.placeholder {
  color: #a8b8c8;
}

.input {
  height: 86rpx;
}

.textarea {
  min-height: 158rpx;
  line-height: 1.6;
}

.submit {
  margin-top: 28rpx;
  height: 96rpx;
  border-radius: 28rpx;
  background: linear-gradient(135deg, #86c7ff, #b9dfff);
  color: #ffffff;
  font-size: 28rpx;
  font-weight: 780;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 18rpx 38rpx rgba(80, 150, 208, 0.18);
}

.submit[disabled] {
  opacity: 0.72;
}
</style>
