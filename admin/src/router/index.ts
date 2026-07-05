// src/router/index.ts
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";
import { useSystemStore } from "@/stores/system.store";

const routes = [
  {
    path: "/setup",
    name: "setup",
    component: () => import("@/views/setup/Setup.page.vue"),
  },
  {
    path: "/",
    redirect: { name: "dashboard" },
  },
  {
    path: "/admin/login",
    name: "login",
    component: () => import("@/views/admin/pages/auth/Login.page.vue"),
  },
  {
    path: "/admin/forgot-password",
    name: "forgot-password",
    component: () => import("@/views/admin/pages/auth/ForgotPassword.page.vue"),
  },
  {
    path: "/admin",
    meta: { requiresAdmin: true },
    redirect: { name: "dashboard" },
    component: () => import("@/views/admin/components/layout/AdminLayout.vue"),
    children: [
      {
        path: "dashboard",
        name: "dashboard",
        component: () => import("@/views/admin/pages/Dashboard.page.vue"),
      },
      {
        path: "posts",
        component: () =>
          import("@/views/admin/components/posts/layout/PostsLayout.vue"),
        children: [
          {
            path: "",
            name: "posts",
            component: () =>
              import("@/views/admin/pages/posts/PostList.page.vue"),
          },
          {
            path: ":uuid/edit",
            name: "post-edit",
            component: () =>
              import("@/views/admin/pages/posts/PostEditor.page.vue"),
          },
        ],
      },
      {
        path: "emails",
        name: "emails",
        component: () => import("@/views/admin/pages/Emails.page.vue"),
      },
      {
        path: "friend-links",
        name: "friend-links",
        component: () => import("@/views/admin/pages/FriendLinks.page.vue"),
      },
      {
        path: "settings",
        name: "settings",
        component: () => import("@/views/admin/pages/Settings.page.vue"),
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: { name: "dashboard" },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
});

router.beforeEach(async (to) => {
  const systemStore = useSystemStore();
  const authStore = useAuthStore();
  const initialized = await systemStore.checkStatus();

  if (!initialized) {
    return to.name === "setup" ? true : { name: "setup" };
  }

  if (to.name === "setup") {
    return { name: "dashboard" };
  }

  const requiresAdmin = to.matched.some((record) => record.meta.requiresAdmin);
  if (requiresAdmin) {
    if (!authStore.user) {
      await authStore.fetchMe();
    }

    if (!authStore.isAdmin) {
      return { name: "login" };
    }
  }

  return true;
});

export default router;
