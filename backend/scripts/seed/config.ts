import type { SeedDatabase } from "./shared";
import { json, now, run } from "./shared";

function upsertConfig(
  db: SeedDatabase,
  configKey: string,
  configValue: unknown,
  description: string,
  isPublic = 1,
) {
  run(
    db,
    `
    INSERT INTO config
      (uuid, config_key, config_value, description, is_public, created_at, updated_at)
    VALUES
      (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(config_key) DO UPDATE SET
      config_value = excluded.config_value,
      description = excluded.description,
      is_public = excluded.is_public,
      updated_at = excluded.updated_at
    `,
    [
      `seed-config-${configKey}`,
      configKey,
      json(configValue),
      description,
      isPublic,
      now,
      now,
    ],
  );
}

export async function ensureAdmin(db: SeedDatabase) {
  const admin = db
    .query(
      "SELECT uuid, username, email FROM user WHERE role = 'admin' LIMIT 1",
    )
    .get() as { uuid: string; username: string; email: string } | null;

  if (admin) {
    return {
      created: false,
      username: admin.username,
      email: admin.email,
      password: "(kept existing password)",
    };
  }

  const password = "Admin@123456";
  const passwordHash = await Bun.password.hash(password);
  const existing = db
    .query(
      "SELECT uuid FROM user WHERE username = 'admin' OR email = 'admin@example.com' LIMIT 1",
    )
    .get() as { uuid: string } | null;

  if (existing) {
    run(
      db,
      `
      UPDATE user SET
        username = 'admin',
        email = 'admin@example.com',
        password_hash = ?,
        role = 'admin',
        status = 'active',
        email_verified = 1,
        updated_at = ?
      WHERE uuid = ?
      `,
      [passwordHash, now, existing.uuid],
    );
  } else {
    run(
      db,
      `
      INSERT INTO user
        (uuid, username, email, password_hash, role, status, created_at, updated_at, email_verified)
      VALUES
        (?, 'admin', 'admin@example.com', ?, 'admin', 'active', ?, ?, 1)
      `,
      ["seed-admin-user", passwordHash, now, now],
    );
  }

  return {
    created: true,
    username: "admin",
    email: "admin@example.com",
    password,
  };
}

export function seedConfigs(db: SeedDatabase) {
  upsertConfig(
    db,
    "appearance",
    { theme: "light", hue: 208, language: "zh-CN" },
    "界面外观配置",
  );

  upsertConfig(
    db,
    "site_info",
    {
      title: "Blog",
      favicon: "/api/uploads/system/favicon.ico",
      footer: "Blog · Built with uni-app, Vue 3, Bun, Elysia and SQLite",
      icp: "",
      footerLinks: [
        { name: "GitHub", url: "https://github.com/" },
        { name: "uni-app", url: "https://uniapp.dcloud.net.cn/" },
        { name: "Vue 3", url: "https://vuejs.org/" },
        { name: "Vue Router", url: "https://router.vuejs.org/" },
        { name: "Pinia", url: "https://pinia.vuejs.org/" },
      ],
    },
    "站点基础信息",
  );

  upsertConfig(
    db,
    "personal_info",
    {
      username: "Sherry",
      avatar: "/api/uploads/system/avatar.webp",
      bio: "私の0721を見て下さいっ",
      socialLinks: [
        {
          name: "GitHub",
          url: "https://github.com/NeneAyachi0721",
          icon: "/api/uploads/social/GitHub-dark.png",
          iconSoft: "/api/uploads/social/GitHub-light.png",
        },
        {
          name: "Bilibili",
          url: "https://space.bilibili.com/436646687",
          icon: "/api/uploads/social/Bilibili-dark.png",
          iconSoft: "/api/uploads/social/Bilibili-light.png",
        },
        {
          name: "Steam",
          url: "https://steamcommunity.com/profiles/76561199568695173",
          icon: "/api/uploads/social/Steam-dark.png",
          iconSoft: "/api/uploads/social/Steam-light.png",
        },
        {
          name: "Email",
          url: "mailto:Sherry1318476070@gmail.com",
          icon: "/api/uploads/social/Email-dark.png",
          iconSoft: "/api/uploads/social/Email-light.png",
        },
      ],
      hero: "/api/uploads/system/hero.webp",
      heroTitle: "Blog",
      heroSubtitles: ["Ciallo～(∠・ω< )⌒☆"],
    },
    "博主个性化信息",
  );

  upsertConfig(
    db,
    "smtp",
    {
      enabled: false,
      host: "smtp.example.com",
      port: 465,
      username: "no-reply@example.com",
      password: "change-me",
      senderEmail: "",
      senderName: "Blog",
    },
    "SMTP 邮件配置",
    0,
  );
}
