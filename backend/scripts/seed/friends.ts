import type { SeedDatabase } from "./shared";
import { day, json, now, run } from "./shared";

const friends = [
  {
    uuid: "seed-link-github",
    name: "GitHub",
    url: "https://github.com/",
    avatarUrl: "https://github.githubassets.com/favicons/favicon.svg",
    description:
      "代码托管与协作平台，用来管理项目仓库、Issues、Pull Requests 和开源生态。",
    tags: ["代码托管", "开源", "Git"],
    joinedAt: now - 1 * day,
  },
  {
    uuid: "seed-link-uniapp",
    name: "uni-app",
    url: "https://uniapp.dcloud.net.cn/",
    avatarUrl: "https://web-assets.dcloud.net.cn/unidoc/zh/uni-app.png",
    description:
      "DCloud 出品的跨端应用框架，本项目小程序前台基于 uni-app 实现。",
    tags: ["小程序", "跨端", "DCloud"],
    joinedAt: now - 2 * day,
  },
  {
    uuid: "seed-link-vue3",
    name: "Vue 3",
    url: "https://vuejs.org/",
    avatarUrl: "https://vuejs.org/logo.svg",
    description: "渐进式 JavaScript 框架，用于构建现代 Web 用户界面。",
    tags: ["Vue 3", "前端框架", "UI"],
    joinedAt: now - 3 * day,
  },
  {
    uuid: "seed-link-vue-router",
    name: "Vue Router",
    url: "https://router.vuejs.org/",
    avatarUrl: "https://router.vuejs.org/logo.svg",
    description: "Vue 官方路由库，用于构建单页面应用的页面导航与路由结构。",
    tags: ["路由", "SPA", "Vue生态"],
    joinedAt: now - 4 * day,
  },
  {
    uuid: "seed-link-pinia",
    name: "Pinia",
    url: "https://pinia.vuejs.org/",
    avatarUrl: "https://pinia.vuejs.org/logo.svg",
    description:
      "Vue 官方推荐的现代状态管理库，类型友好、轻量并支持 Devtools。",
    tags: ["状态管理", "Vue生态", "TypeScript"],
    joinedAt: now - 5 * day,
  },
  {
    uuid: "seed-link-typescript",
    name: "TypeScript",
    url: "https://www.typescriptlang.org/docs/",
    avatarUrl: "https://www.typescriptlang.org/favicon-32x32.png",
    description:
      "为 JavaScript 添加类型系统，提升大型项目的可维护性与编辑器体验。",
    tags: ["类型系统", "JavaScript", "工程化"],
    joinedAt: now - 6 * day,
  },
  {
    uuid: "seed-link-vite",
    name: "Vite",
    url: "https://vite.dev/",
    avatarUrl: "https://vite.dev/logo.svg",
    description: "现代前端构建工具，提供快速开发服务器和生产构建能力。",
    tags: ["构建工具", "前端工程化", "开发体验"],
    joinedAt: now - 7 * day,
  },
  {
    uuid: "seed-link-bun",
    name: "Bun",
    url: "https://bun.sh/",
    avatarUrl: "https://bun.sh/logo.svg",
    description: "现代 JavaScript 运行时与工具链，本项目后端运行环境使用 Bun。",
    tags: ["运行时", "后端", "工具链"],
    joinedAt: now - 8 * day,
  },
  {
    uuid: "seed-link-elysia",
    name: "Elysia",
    url: "https://elysiajs.com/",
    avatarUrl: "https://elysiajs.com/assets/elysia.svg",
    description:
      "面向 Bun 的高性能 TypeScript Web 框架，本项目后端 API 基于 Elysia。",
    tags: ["后端框架", "Bun", "API"],
    joinedAt: now - 9 * day,
  },
  {
    uuid: "seed-link-drizzle",
    name: "Drizzle ORM",
    url: "https://orm.drizzle.team/",
    avatarUrl: "https://orm.drizzle.team/favicon.ico",
    description:
      "TypeScript ORM，用于以类型安全的方式管理数据库表结构、查询和迁移。",
    tags: ["ORM", "数据库", "TypeScript"],
    joinedAt: now - 10 * day,
  },
  {
    uuid: "seed-link-sqlite",
    name: "SQLite",
    url: "https://www.sqlite.org/",
    avatarUrl: "https://www.sqlite.org/favicon.ico",
    description:
      "轻量级嵌入式关系型数据库，本项目使用 SQLite 保存文章、友链和配置。",
    tags: ["数据库", "SQLite", "持久化"],
    joinedAt: now - 11 * day,
  },
  {
    uuid: "seed-link-tailwind",
    name: "Tailwind CSS",
    url: "https://tailwindcss.com/",
    avatarUrl: "https://tailwindcss.com/favicons/favicon-32x32.png",
    description: "实用优先的 CSS 框架，适合快速搭建一致、可维护的界面样式。",
    tags: ["CSS", "UI", "设计系统"],
    joinedAt: now - 12 * day,
  },
];

function upsertFriend(db: SeedDatabase, friend: (typeof friends)[number]) {
  run(
    db,
    `
    INSERT INTO friend_link
      (uuid, name, url, avatar_url, description, tags, status, applicant_email, reject_reason, joined_at, created_at, updated_at)
    VALUES
      (?, ?, ?, ?, ?, ?, 'approved', NULL, NULL, ?, ?, ?)
    ON CONFLICT(uuid) DO UPDATE SET
      name = excluded.name,
      url = excluded.url,
      avatar_url = excluded.avatar_url,
      description = excluded.description,
      tags = excluded.tags,
      status = 'approved',
      applicant_email = NULL,
      reject_reason = NULL,
      joined_at = excluded.joined_at,
      updated_at = excluded.updated_at
    `,
    [
      friend.uuid,
      friend.name,
      friend.url,
      friend.avatarUrl,
      friend.description,
      json(friend.tags),
      friend.joinedAt,
      friend.joinedAt,
      now,
    ],
  );
}

export function seedFriends(db: SeedDatabase) {
  // 按你的需求：清空现有友链，再插入项目技术栈官方链接。
  run(db, "DELETE FROM friend_link");
  for (const friend of friends) upsertFriend(db, friend);
  return friends.length;
}
